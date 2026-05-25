import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../utils/api';
import io from 'socket.io-client';

import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Button,
  Avatar,
  Box,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Search,
  CalendarMonth,
  Videocam,
  Settings,
  Emergency,
  Psychology,
  Logout,
  Article,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, []);

  useEffect(() => {
  // केवल मरीज़ के लिए ही यह लिसनर चलाएं
  if (!user || user.role !== 'patient') return;

  const socket = io('http://localhost:5000');
  
  // मरीज़ को उसके ID से रजिस्टर करें ताकि डॉक्टर उसे ढूंढ सके
  socket.emit('register-patient', user.id);

  // इनकमिंग कॉल इवेंट सुनें
  socket.on('incoming-call', ({ roomId, message }) => {
    // एक कन्फर्मेशन डायलॉग दिखाएं
    if (window.confirm(message || 'Doctor is calling you. Join now?')) {
      window.location.href = `/video-call?room=${roomId}&role=receiver`;
    }
  });

  return () => {
    socket.disconnect();
  };
}, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  const patientLinks = [
    { label: 'Find Doctors', icon: <Search />, path: '/doctors', color: '#1976d2' },
    { label: 'Book Appointment', icon: <CalendarMonth />, path: '/book-appointment', color: '#2e7d32' },
    { label: 'My Appointments', icon: <Article />, path: '/my-appointments', color: '#0288d1' },
    { label: 'Video Call', icon: <Videocam />, path: '/video-call', color: '#7c4dff' },
    { label: 'AI Checker', icon: <Psychology />, path: '/symptom-checker', color: '#ed6c02' },
    { label: 'Emergency', icon: <Emergency />, path: '/emergency', color: '#d32f2f' },
  ];

  const doctorLinks = [
    { label: 'Edit Profile', icon: <Settings />, path: '/doctor-profile', color: '#1976d2' },
    { label: 'Set Availability', icon: <CalendarMonth />, path: '/doctor-slots', color: '#2e7d32' },
    { label: 'View Appointments', icon: <Article />, path: '/my-appointments', color: '#0288d1' },
    { label: 'Video Call', icon: <Videocam />, path: '/video-call', color: '#7c4dff' },
  ];

  const links = user.role === 'patient' ? patientLinks : doctorLinks;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* -------- वेलकम कार्ड -------- */}
      <Card elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 32 }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              Welcome, {loading ? '...' : profile?.name || user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.role === 'patient' ? 'Patient' : 'Doctor'}
              {loading
                ? ''
                : user.role === 'doctor'
                ? ` • ${profile?.specialization || ''} • ${profile?.isOnline ? 'Online' : 'Offline'}`
                : ''}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* -------- त्वरित कार्रवाई -------- */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : links.map((link) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={link.label}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    height: '100%',
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  }}
                >
                  <CardActionArea
                    component={RouterLink}
                    to={link.path}
                    sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Box sx={{ fontSize: 40, color: link.color, mb: 1 }}>{link.icon}</Box>
                    <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ textAlign: 'center' }}>
                      {link.label}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* -------- उपयोगी सुझाव -------- */}
      {!loading && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" variant="outlined">
            {user.role === 'patient'
              ? 'Tip: Book an appointment with a verified doctor and get instant confirmation.'
              : 'Tip: Keep your availability updated to receive more patient consultations.'}
          </Alert>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;