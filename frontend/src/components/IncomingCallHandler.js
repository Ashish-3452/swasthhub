import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const IncomingCallHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'patient') return;

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socket.emit('register-patient', user.id);
    console.log('Global patient registered:', user.id);

    socket.on('incoming-call', ({ roomId, message }) => {
      if (window.confirm(message || 'Doctor is calling you. Join now?')) {
        navigate(`/video-call?room=${roomId}&role=receiver`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]); // खाली डिपेंडेंसी नहीं, बल्कि navigate को शामिल करें (stable)

  return null; // यह कम्पोनेंट कुछ भी रेंडर नहीं करता
};

export default IncomingCallHandler;