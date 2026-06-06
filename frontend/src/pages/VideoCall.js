import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Container, Typography, Button, Paper, Box, Grid, Alert, CircularProgress } from '@mui/material';
import { Videocam, CallEnd } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('room');
  const role = searchParams.get('role') || 'initiator';

  const [callStatus, setCallStatus] = useState('waiting');
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  // कॉल समाप्ति का साझा फ़ंक्शन (refs के साथ, कोई stale closure नहीं)
  const endCallHandler = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCallStatus('ended');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  useEffect(() => {
    if (!roomId) return navigate('/dashboard');

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, { transports: ['websocket'] });
    const socket = socketRef.current;

    socket.emit('join-room', roomId);

    // WebRTC सिग्नलिंग
    socket.on('signal', ({ from, data }) => {
      if (peerRef.current) {
        peerRef.current.signal(data);
      }
    });

    // जब दूसरा व्यक्ति कॉल समाप्त करे
    socket.on('end-call', () => {
      endCallHandler();
    });

    const setupPeer = async (isInitiator) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideo.current) localVideo.current.srcObject = stream;

        const peer = new SimplePeer({ initiator: isInitiator, stream });

        peer.on('signal', (data) => {
          socket.emit('signal', { roomId, data });
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
          // अगर पीयर बंद हो जाए और अभी तक ended न किया हो तो
          if (peerRef.current) {
            setCallStatus('ended');
          }
        });

        peerRef.current = peer;
        setCallStatus('connecting');
      } catch (err) {
        console.error('Media error:', err);
        setCallStatus('failed');
      }
    };

    // भूमिका के अनुसार
    if (role === 'receiver') {
      setupPeer(false);
    } else if (role === 'initiator') {
      socket.on('user-joined', () => {
        setupPeer(true);
      });
    }

    return () => {
      // क्लीनअप – लेकिन endCallHandler यहाँ मत बुलाएँ, सिर्फ़ सॉकेट और पीयर छोड़ें
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      socket.disconnect();
    };
    // डिपेंडेंसी ऐरे में केवल roomId, role, navigate — callStatus नहीं
  }, [roomId, role, navigate]);

  const onEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('end-call');  // दूसरे पक्ष को सूचित करें
    }
    endCallHandler();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          <Videocam sx={{ mr: 1, verticalAlign: 'middle' }} /> Video Consultation
        </Typography>

        {callStatus === 'waiting' && <Alert severity="info">Waiting for other person to join...</Alert>}
        {callStatus === 'connecting' && <CircularProgress sx={{ my: 2 }} />}
        {callStatus === 'connected' && <Alert severity="success">Connected!</Alert>}
        {callStatus === 'ended' && <Alert severity="warning">Call ended. Redirecting to dashboard...</Alert>}
        {callStatus === 'failed' && <Alert severity="error">Connection failed. Please try again.</Alert>}

        <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <video ref={localVideo} autoPlay muted playsInline
              style={{ width: '100%', borderRadius: 8, border: '2px solid #1976d2', background: '#000' }} />
            <Typography>You</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <video ref={remoteVideo} autoPlay playsInline
              style={{ width: '100%', borderRadius: 8, border: '2px solid #7c4dff', background: '#000' }} />
            <Typography>Doctor</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="error" startIcon={<CallEnd />} onClick={onEndCall}>
            End Call
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VideoCall;