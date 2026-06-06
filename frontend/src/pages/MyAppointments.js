import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Container, Typography, Card, CardContent, Chip, Button, Skeleton, Box, Alert,
} from '@mui/material';
import { CalendarMonth, AccessTime, Person, Videocam } from '@mui/icons-material';
import io from 'socket.io-client';

const ENDPOINT = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
let socket;

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchAppointments();
    socket = io(ENDPOINT, {
    transports: ['websocket']
  });
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = (appointmentId, patientId) => {
    socket.emit('start-call', { appointmentId, patientId });
    socket.on('call-started', ({ roomId }) => {
      navigate(`/video-call?room=${roomId}&role=initiator`);
    });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Appointments
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
        ))
      ) : appointments.length === 0 ? (
        <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          No appointments found.
        </Typography>
      ) : (
        appointments.map((apt) => (
          <Card key={apt._id} elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarMonth color="primary" />
                  <Typography variant="h6">
                    {new Date(apt.slotDate).toDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccessTime fontSize="small" />
                  <Typography variant="body1">
                    {apt.startTime} – {apt.endTime}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" />
                  <Typography variant="body2">
                    {user?.role === 'doctor'
                      ? `Patient: ${apt.patientId?.name}`
                      : `Doctor: ${apt.doctorId?.name} (${apt.doctorId?.specialization || 'General'})`}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={apt.status}
                  color={apt.status === 'scheduled' ? 'success' : 'default'}
                  size="small"
                />
                {apt.status === 'scheduled' && (
                  user?.role === 'doctor' ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Videocam />}
                      onClick={() => handleStartCall(apt._id, apt.patientId?._id)}
                      size="small"
                    >
                      Start Call
                    </Button>
                  ) : (
                    <Button
                      component={RouterLink}
                      to={`/video-call?room=apt-${apt._id}&role=receiver`}
                      variant="contained"
                      color="secondary"
                      startIcon={<Videocam />}
                      size="small"
                    >
                      Join Call
                    </Button>
                  )
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default MyAppointments;