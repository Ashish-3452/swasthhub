import React, { useState, useEffect } from 'react';

import {
  Container, Typography, Button, Grid, Card,  Box,
  TextField, InputAdornment, Paper, Skeleton
} from '@mui/material';
import {
  Search, LocalHospital, People, Videocam, Star,
  ArrowForward, Download, PhoneAndroid
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
  totalDoctors: 0,
  onlineDoctors: 0,
  totalAppointments: null,
  averageRating: null,
});
  const [specialties, setSpecialties] = useState([]);
  

  useEffect(() => {
  const fetchData = async () => {
    try {
      // 1. डॉक्टरों की लिस्ट लाएँ
      const doctorsRes = await api.get('/doctors');
      const list = doctorsRes.data;
      const total = list.length;
      const online = list.filter(d => d.isOnline).length;

      // 2. अपॉइंटमेंट की कुल संख्या (यह एंडपॉइंट अभी हो या न हो)
      let totalApps = null;
      try {
        const appsRes = await api.get('/appointments/count');
        totalApps = appsRes.data.count;
      } catch (e) {
        console.warn('Appointments count API not available, will show placeholder');
      }

      // 3. स्टेट अपडेट करें
      setStats({
        totalDoctors: total,
        onlineDoctors: online,
        totalAppointments: totalApps,   // अगर मिला तो संख्या, वरना null
        averageRating: null,            // अभी रेटिंग सिस्टम नहीं है
      });

      setDoctors(list);

      // 4. स्पेशलिटीज़ निकालें
      const specs = [...new Set(list.map(d => d.specialization).filter(Boolean))];
      setSpecialties(specs.slice(0, 8));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
  // फ़ीचर्ड डॉक्टर (सिर्फ़ 3 जिनकी रेटिंग/अनुभव ज़्यादा – यहाँ हम बस पहले 3 लेते हैं)
  const featured = doctors.slice(0, 3);

  return (
    <Box>
      {/* ========== हीरो सेक्शन ========== */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 8, md: 14 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Your Health, Our Priority
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Find the right doctor, book instantly, and consult via secure video calls.
          </Typography>
          <Paper elevation={4} sx={{ p: 1, display: 'flex', maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
            <TextField
              fullWidth
              placeholder="Search by specialty, symptom, or doctor name..."
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ px: 2 }}
            />
            <Button variant="contained" size="large" sx={{ borderRadius: 2 }} onClick={() => navigate('/doctors')}>
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -5, mb: 8 }}>
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Grid container spacing={4} sx={{ maxWidth: 900 }}>
      {loading ? (
        // स्केलेटन लोडिंग
        Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          </Grid>
        ))
      ) : (
        <>
          {/* कार्ड 1: Verified Doctors */}
          <Grid item xs={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocalHospital color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {stats.totalDoctors}+
              </Typography>
              <Typography variant="body2">Verified Doctors</Typography>
            </Paper>
          </Grid>

          {/* कार्ड 2: Online Now */}
          <Grid item xs={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {stats.onlineDoctors}
              </Typography>
              <Typography variant="body2">Online Now</Typography>
            </Paper>
          </Grid>

          {/* कार्ड 3: Total Consultations (असली अपॉइंटमेंट संख्या) */}
          <Grid item xs={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Videocam color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {stats.totalAppointments !== null ? `${stats.totalAppointments}+` : '...'}
              </Typography>
              <Typography variant="body2">Consultations</Typography>
            </Paper>
          </Grid>

          {/* कार्ड 4: User Rating (अभी कोई सिस्टम नहीं) */}
          <Grid item xs={6} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                N/A
              </Typography>
              <Typography variant="body2">User Rating</Typography>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  </Box>
</Container>

      {/* ========== कैसे काम करता है ========== */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ textAlign: 'center' }} gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            { step: '01', title: 'Search Doctor', desc: 'Filter by specialty, availability, and ratings.' },
            { step: '02', title: 'Book Instantly', desc: 'Pick a time slot and confirm with one click.' },
            { step: '03', title: 'Consult Online', desc: 'Join a secure video call or visit the clinic.' }
          ].map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper elevation={0} sx={{ textAlign: 'center', p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="h2" color="primary" fontWeight="bold">{item.step}</Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ========== स्पेशलिटीज़ (डायनैमिक) ========== */}
      <Box sx={{ bgcolor: '#f5f9ff', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" sx={{ textAlign: 'center' }} gutterBottom>
            Top Specialties
          </Typography>
          <Grid container spacing={2} sx={{ mt: 4 }}>
            {specialties.map((spec) => (
              <Grid item xs={6} sm={3} key={spec}>
                <Card
                  elevation={1}
                  sx={{ textAlign: 'center', p: 2, borderRadius: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => navigate(`/doctors?specialty=${spec}`)}
                >
                  <LocalHospital color="primary" sx={{ fontSize: 30 }} />
                  <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>{spec}</Typography>
                </Card>
              </Grid>
            ))}
            {specialties.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }} width="100%">
                No doctors available yet.
              </Typography>
            )}
          </Grid>
        </Container>
      </Box>

      {/* ========== फ़ीचर्ड डॉक्टर्स (डायनैमिक) ========== */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">Featured Doctors</Typography>
          <Button endIcon={<ArrowForward />} onClick={() => navigate('/doctors')}>View All</Button>
        </Box>
        <Grid container spacing={3}>
          {loading
            ? [1,2,3].map(i => (
                <Grid item xs={12} md={4} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            : featured.map((doc) => (
                <Grid item xs={12} md={4} key={doc._id}>
                  <Card elevation={2} sx={{ borderRadius: 2, p: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ fontSize: 50, mb: 1 }}>{doc.name.charAt(0)}</Box>
                      <Typography variant="h6" fontWeight="bold">{doc.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{doc.specialization || 'General'}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Star sx={{ color: '#faaf00', mr: 0.5 }} />
                        <Typography variant="body2" fontWeight="bold">4.8</Typography> {/* Placeholder rating */}
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Container>

      {/* ========== ऐप डाउनलोड ========== */}
      <Box sx={{ bgcolor: '#0a192f', color: 'white', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <PhoneAndroid sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Coming soon Mobile Application
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
            Book appointments, consult doctors, and manage your health on the go.
          </Typography>
          <Button variant="contained" size="large" sx={{ mx: 1, mb: 1 }} startIcon={<Download />}>
            App Store
          </Button>
          <Button variant="outlined" size="large" sx={{ mx: 1, mb: 1, color: 'white', borderColor: 'white' }} startIcon={<Download />}>
            Google Play
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;