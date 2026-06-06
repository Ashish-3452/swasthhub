import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Container, Typography, Button, Paper, Box, Grid, Alert } from '@mui/material';
import { Videocam, CallEnd } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('room');
  const role = searchParams.get('role') || 'initiator';

  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, connected, ended
  const [stream, setStream] = useState(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    if (!roomId) return navigate('/dashboard');

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, { transports: ['websocket'] });
    const socket = socketRef.current;

    socket.emit('join-room', roomId);

    // अगर रिसीवर (मरीज़) है तो 'user-joined' का इंतज़ार करें
    if (role === 'receiver') {
      setCallStatus('waiting');
      socket.on('user-joined', () => {
        startLocalStream(false);
      });
    } else {
      // इनिशिएटर (डॉक्टर) तुरंत कैमरा चालू करे
      startLocalStream(true);
    }

    // सिग्नलिंग
    socket.on('signal', ({ from, data }) => {
      if (peerRef.current) {
        peerRef.current.signal(data);
      }
    });

    return () => {
      if (socket) socket.disconnect();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [roomId, role]);

  const startLocalStream = async (isInitiator) => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(localStream);
      if (localVideo.current) localVideo.current.srcObject = localStream;

      const peer = new SimplePeer({
        initiator: isInitiator,
        stream: localStream,
      });

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

      peer.on('close', () => setCallStatus('ended'));

      peerRef.current = peer;
      setCallStatus('connecting');
    } catch (err) {
      console.error('Media error:', err);
      setCallStatus('failed');
    }
  };

  const endCall = () => {
    if (peerRef.current) peerRef.current.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
    setCallStatus('ended');
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          <Videocam sx={{ mr: 1, verticalAlign: 'middle' }} />
          Video Consultation
        </Typography>

        {callStatus === 'idle' && <Alert severity="info">Initializing camera...</Alert>}
        {callStatus === 'waiting' && <Alert severity="info">Waiting for the other person to join...</Alert>}
        {callStatus === 'connecting' && <Alert severity="info">Connecting...</Alert>}
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

        {callStatus === 'connected' && (
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" color="error" startIcon={<CallEnd />} onClick={endCall}>
              End Call
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VideoCall;