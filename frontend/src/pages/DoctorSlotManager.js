import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Alert,
} from '@mui/material';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorSlotManager = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState(
    DAYS.map((_, idx) => ({ dayOfWeek: idx, startTime: '', endTime: '' }))
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'doctor') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleTimeChange = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const handleCopyMonday = () => {
    const monday = slots[1];
    if (!monday.startTime || !monday.endTime) {
      setMessage('Please set Monday times first.');
      return;
    }
    const updated = slots.map((slot, idx) => {
      if (idx === 1) return slot;
      return { ...slot, startTime: monday.startTime, endTime: monday.endTime };
    });
    setSlots(updated);
    setMessage('Monday schedule copied to all days!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filled = slots.filter((s) => s.startTime && s.endTime);
    if (filled.length === 0) {
      setMessage('Please set at least one slot.');
      return;
    }
    try {
      await api.post('/appointments/set-slots', { slots: filled });
      setMessage('Slots saved successfully!');
    } catch (err) {
      setMessage('Error saving slots');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Set Your Weekly Availability
      </Typography>

      {message && (
        <Alert severity={message.includes('success') ? 'success' : 'warning'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Day</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Start Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>End Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slots.map((slot, idx) => (
                <TableRow key={idx}>
                  <TableCell>{DAYS[idx]}</TableCell>
                  <TableCell>
                    <TextField
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                      variant="standard"
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                      variant="standard"
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleCopyMonday}
          sx={{ mt: 2 }}
        >
          Copy Monday Schedule to All Days
        </Button>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
        >
          Save Availability
        </Button>
      </form>
    </Container>
  );
};

export default DoctorSlotManager;