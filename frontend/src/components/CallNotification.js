import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const CallNotification = () => {
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket'] });

    // अगर मरीज़ है तो उसे उसके निजी रूम में रजिस्टर करें ताकि डॉक्टर उसे ढूंढ सके
    if (user.role === 'patient') {
      socket.emit('register-patient', user.id);
    }

    // इनकमिंग कॉल का इवेंट सुनें
    socket.on('incoming-call', (data) => {
      setIncomingCall(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAccept = () => {
    if (incomingCall) {
      navigate(`/video-call?room=${incomingCall.roomId}&role=receiver`);
    }
    setIncomingCall(null);
  };

  const handleReject = () => {
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <Dialog open={Boolean(incomingCall)} onClose={handleReject}>
      <DialogTitle>Incoming Video Call</DialogTitle>
      <DialogContent>
        <Typography>{incomingCall.message || 'Doctor is calling you. Join now?'}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReject} color="error">Reject</Button>
        <Button onClick={handleAccept} variant="contained" color="success">Join Call</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CallNotification;