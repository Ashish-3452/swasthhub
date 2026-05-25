import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Skeleton,
} from '@mui/material';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    fee: '',
    consultationHours: '',
  });
  const [isOnline, setIsOnline] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const user = res.data;
        if (user.role !== 'doctor') {
          navigate('/dashboard');
          return;
        }
        setFormData({
          specialization: user.specialization || '',
          experience: user.experience || '',
          fee: user.fee || '',
          consultationHours: user.consultationHours || '',
        });
        setIsOnline(user.isOnline);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/doctors/profile', formData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Error updating profile');
    }
  };

  const handleToggleOnline = async () => {
    try {
      const res = await api.put('/doctors/toggle-online');
      setIsOnline(res.data.isOnline);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 2, p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Doctor Profile
        </Typography>

        {message && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <form onSubmit={handleUpdateProfile}>
          <TextField
            fullWidth
            label="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="e.g., Cardiologist"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Experience (years)"
            name="experience"
            type="number"
            value={formData.experience}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Consultation Fee (₹)"
            name="fee"
            type="number"
            value={formData.fee}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Consultation Hours"
            name="consultationHours"
            value={formData.consultationHours}
            onChange={handleChange}
            placeholder="e.g., 9 AM - 5 PM"
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth size="large">
            Update Profile
          </Button>
        </form>

        <Card variant="outlined" sx={{ mt: 3, p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            Online Status
          </Typography>
          <FormControlLabel
            control={<Switch checked={isOnline} onChange={handleToggleOnline} />}
            label={isOnline ? 'Online' : 'Offline'}
          />
        </Card>
      </Card>
    </Container>
  );
};

export default DoctorProfile;