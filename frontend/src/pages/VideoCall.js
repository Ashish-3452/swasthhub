import React, { useRef, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Container, Typography, Button, Paper, Box, Grid, Alert } from '@mui/material';
import { Videocam, CallEnd } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('room');
  const role = searchParams.get('role'); // 'initiator' or 'receiver'
  const [callStatus, setCallStatus] = useState('connecting');
  const [localStream, setLocalStream] = useState(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const socketRef = useRef();
  const peerRef = useRef();

  const endCall = useCallback(() => {
    if (peerRef.current) peerRef.current.destroy();
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setCallStatus('ended');
    setTimeout(() => navigate('/dashboard'), 1000);
  }, [localStream, navigate]);

  const startMediaAndCall = useCallback(async (isInitiator) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideo.current) localVideo.current.srcObject = stream;

      const peer = new SimplePeer({ initiator: isInitiator, stream });

      peer.on('signal', (data) => {
        socketRef.current.emit('signal', { roomId, data });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
        setCallStatus('connected');
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setCallStatus('failed');
      });

      peer.on('close', () => {
        setCallStatus('ended');
      });

      peerRef.current = peer;
      if (!isInitiator) setCallStatus('connected');
    } catch (err) {
      console.error('Media error:', err);
      setCallStatus('failed');
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      navigate('/dashboard');
      return;
    }

    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

    socketRef.current.emit('join-room', roomId);

    if (role === 'initiator') {
      startMediaAndCall(true);
    } else {
      setCallStatus('waiting');
      socketRef.current.on('user-joined', () => {
        startMediaAndCall(false);
      });
    }

    socketRef.current.on('signal', ({ from, data }) => {
      if (peerRef.current) {
        peerRef.current.signal(data);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [roomId, role, navigate, startMediaAndCall]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          <Videocam sx={{ mr: 1, verticalAlign: 'middle' }} />
          Video Consultation
        </Typography>
        
        {callStatus === 'connecting' && <Alert severity="info">Connecting...</Alert>}
        {callStatus === 'waiting' && <Alert severity="info">Waiting for doctor to join...</Alert>}
        {callStatus === 'connected' && <Alert severity="success">Connected</Alert>}
        {callStatus === 'ended' && <Alert severity="warning">Call ended</Alert>}
        {callStatus === 'failed' && <Alert severity="error">Connection failed. Please try again.</Alert>}

        <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <video ref={localVideo} autoPlay muted style={{ width: '100%', borderRadius: 8, border: '2px solid #1976d2' }} />
            <Typography>You</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <video ref={remoteVideo} autoPlay style={{ width: '100%', borderRadius: 8, border: '2px solid #7c4dff' }} />
            <Typography>Remote</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          {callStatus === 'connected' && (
            <Button variant="contained" color="error" startIcon={<CallEnd />} onClick={endCall}>
              End Call
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default VideoCall;