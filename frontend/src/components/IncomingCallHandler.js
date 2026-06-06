import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const IncomingCallHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'patient') return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['websocket'],   // केवल WebSocket, कोई पोलिंग नहीं
    });

    socket.on('connect', () => {
      console.log('IncomingCallHandler connected:', socket.id);
      socket.emit('register-patient', user.id);
    });

    socket.on('incoming-call', ({ roomId, message }) => {
      if (window.confirm(message || 'Doctor is calling you. Join now?')) {
        navigate(`/video-call?room=${roomId}&role=receiver`);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  return null;
};

export default IncomingCallHandler;