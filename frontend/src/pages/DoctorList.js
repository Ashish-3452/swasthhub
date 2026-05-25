import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import io from 'socket.io-client';
import {
  Container,
  Typography,
  Card,
  Grid,
  CardActionArea,
  TextField,
  InputAdornment,
  MenuItem,
  Chip,
  Box,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Search,
  FilterList,
  Star,
  Videocam,
  LocationOn,
} from '@mui/icons-material';

const ENDPOINT = 'http://localhost:5000';
let socket;

const DoctorList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();

    socket = io(ENDPOINT);
    socket.on('doctor-status-changed', ({ doctorId, isOnline }) => {
      setDoctors((prev) =>
        prev.map((doc) => (doc._id === doctorId ? { ...doc, isOnline } : doc))
      );
    });

    return () => socket.disconnect();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      const list = res.data;
      setDoctors(list);
      setFiltered(list);
      // स्पेशलिटी की लिस्ट बनाओ
      const specs = [...new Set(list.map((d) => d.specialization).filter(Boolean))];
      setSpecialties(specs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // फ़िल्टर लॉजिक
  useEffect(() => {
    let result = doctors;
    if (search.trim()) {
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          (d.specialization || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    if (specialty !== 'All') {
      result = result.filter((d) => d.specialization === specialty);
    }
    setFiltered(result);
  }, [search, specialty, doctors]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Find Doctors
      </Typography>

      {/* ---------- सर्च और फ़िल्टर ---------- */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterList />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="All">All Specialties</MenuItem>
            {specialties.map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* ---------- डॉक्टर कार्ड्स ---------- */}
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : filtered.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc._id}>
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
                    onClick={() => navigate(`/book-appointment?doctor=${doc._id}`)}
                    sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: doc.isOnline ? 'success.main' : 'grey.400',
                        fontSize: 30,
                        mb: 2,
                      }}
                    >
                      {doc.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'center' }}>
                      {doc.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {doc.specialization || 'General'}
                    </Typography>
                    <Chip
                      icon={<Videocam />}
                      label={doc.isOnline ? 'Online' : 'Offline'}
                      color={doc.isOnline ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Star sx={{ color: '#faaf00', mr: 0.5 }} fontSize="small" />
                      <Typography variant="body2" fontWeight="bold">
                        4.8
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        (50+ reviews)
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <LocationOn fontSize="inherit" /> 2.5 km away
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                      ₹ {doc.fee || 500}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>

      {!loading && filtered.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center' }} sx={{ mt: 4 }} color="text.secondary">
          No doctors found matching your criteria.
        </Typography>
      )}
    </Container>
  );
};

export default DoctorList;