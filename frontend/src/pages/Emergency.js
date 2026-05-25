import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { Emergency as EmergencyIcon, Warning } from '@mui/icons-material';   // 👈 बदली हुई लाइन

const Emergency = () => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);

  const handleEmergency = async () => {
    try {
      const res = await api.post('/emergency/request', { symptoms });
      setResult(res.data);
    } catch (err) {
      alert('Emergency request failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 2, p: 3, textAlign: 'center' }}>
        <EmergencyIcon sx={{ fontSize: 60, color: 'error.main' }} />   {/* 👈 बदला हुआ */}
        <Typography variant="h4" fontWeight="bold" color="error.main" gutterBottom>
          Emergency Booking
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Describe your symptoms quickly – we’ll find the nearest available doctor.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Describe symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g., severe chest pain, difficulty breathing"
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          color="error"
          size="large"
          startIcon={<Warning />}
          onClick={handleEmergency}
        >
          Send Emergency Request
        </Button>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Priority Level: {result.priority}
            </Alert>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {result.message}
            </Typography>
            {result.roomId && (
              <>
                <Chip label={`Room ID: ${result.roomId}`} variant="outlined" sx={{ mb: 2 }} />
                <Button
                  component={RouterLink}
                  to={`/video-call?room=${result.roomId}`}
                  variant="contained"
                  color="error"
                  fullWidth
                >
                  Join Emergency Video Call
                </Button>
              </>
            )}
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default Emergency;