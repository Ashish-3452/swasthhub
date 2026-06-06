import React, { useRef, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Container, Typography, Button, Paper, Box, Grid, Alert } from '@mui/material';
import { Videocam, CallEnd, Mic, MicOff, VideocamOff } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('room');
  const role = searchParams.get('role'); // 'initiator' or 'receiver'
  const [callStatus, setCallStatus] = useState('idle'); // idle, waiting, connecting, connected, ended
  const [localStream, setLocalStream] = useState(null);
  const [mediaEnabled, setMediaEnabled] = useState(false); // नया – कैमरा चालू करने का नियंत्रण
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
    setTimeout(() => navigate('/dashboard'), 1500);
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
      setCallStatus('connecting');
      if (!isInitiator) setCallStatus('connected'); // receiver के लिए तुरंत कनेक्टेड दिखाएँ
    } catch (err) {
      console.error('Media error:', err);
      if (err.name === 'NotAllowedError') {
        alert('कृपया कैमरा और माइक्रोफ़ोन की अनुमति दें।');
      }
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

    socketRef.current.on('signal', ({ from, data }) => {
      if (peerRef.current) {
        peerRef.current.signal(data);
      }
    });

    if (role === 'receiver') {
      // रिसीवर को 'user-joined' इवेंट का इंतज़ार होगा
      setCallStatus('waiting');
      socketRef.current.on('user-joined', () => {
        setMediaEnabled(true); // कैमरा चालू करने के लिए बटन दिखाएगा
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [roomId, role, navigate]);

  // जब mediaEnabled true हो जाए, तो कैमरा चालू करें
  useEffect(() => {
    if (mediaEnabled && !localStream) {
      startMediaAndCall(role === 'initiator');
    }
  }, [mediaEnabled, localStream, role, startMediaAndCall]);

  const enableMedia = () => setMediaEnabled(true);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          <Videocam sx={{ mr: 1, verticalAlign: 'middle' }} />
          Video Consultation
        </Typography>

        {callStatus === 'idle' && !mediaEnabled && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {role === 'initiator'
                ? 'कॉल शुरू करने के लिए "Enable Camera & Join" पर क्लिक करें।'
                : 'डॉक्टर के आने का इंतज़ार करें। फिर कैमरा चालू करें।'}
            </Alert>
            <Button variant="contained" size="large" onClick={enableMedia}>
              Enable Camera & Join
            </Button>
          </Box>
        )}

        {callStatus === 'waiting' && (
          <Alert severity="info">Waiting for the other person to join...</Alert>
        )}
        {callStatus === 'connecting' && <Alert severity="info">Connecting...</Alert>}
        {callStatus === 'connected' && <Alert severity="success">Connected</Alert>}
        {callStatus === 'ended' && <Alert severity="warning">Call ended</Alert>}
        {callStatus === 'failed' && <Alert severity="error">Connection failed</Alert>}

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