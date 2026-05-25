import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Skeleton,
  Box,
} from '@mui/material';
import { CalendarMonth, AccessTime, Person, Videocam } from '@mui/icons-material';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000/api';
let socket;

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchAppointments();

    // सॉकेट कनेक्ट करें
    socket = io(ENDPOINT);

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // डॉक्टर के लिए कॉल शुरू करने का फ़ंक्शन
  const handleStartCall = (appointmentId, patientId) => {
    // 1. सॉकेट इवेंट भेजो "start-call"
    socket.emit('start-call', { appointmentId, patientId });

    // 2. बैकएंड से "call-started" इवेंट का इंतज़ार करो
    socket.on('call-started', ({ roomId }) => {
      // 3. वीडियो कॉल पेज पर डॉक्टर को इनिशिएटर के रूप में भेजो
      navigate(`/video-call?room=${roomId}&role=initiator`);
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Appointments
      </Typography>

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
                {/* यहाँ रोल के अनुसार बटन दिखाओ */}
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