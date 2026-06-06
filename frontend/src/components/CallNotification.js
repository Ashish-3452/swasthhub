import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const CallNotification = () => {
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const handleIncomingCall = (event) => {
      setIncomingCall(event.detail);
    };

    window.addEventListener('incoming-video-call', handleIncomingCall);
    return () => window.removeEventListener('incoming-video-call', handleIncomingCall);
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