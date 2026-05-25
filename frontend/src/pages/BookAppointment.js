import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Skeleton,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { CalendarMonth, AccessTime, Psychology } from '@mui/icons-material';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor');

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor || '');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const fetchSlots = async () => {
    if (!selectedDoctor || !date) return;
    try {
      const res = await api.get(`/appointments/slots/${selectedDoctor}?date=${date}`);
      setSlots(res.data.slots);
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (date && selectedDoctor) fetchSlots();
  }, [date, selectedDoctor]);

  const handleBook = async () => {
    if (!selectedSlot) {
      setMessage('Please select a time slot.');
      return;
    }
    try {
      await api.post('/appointments/book', {
        doctorId: selectedDoctor,
        slotDate: date,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        symptoms,
      });
      setMessage('Appointment booked successfully!');
      setSelectedSlot(null);
      setSymptoms('');
      fetchSlots();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    }
  };

  const checkAI = async () => {
    if (!symptoms) return;
    try {
      const res = await api.post('/ai/predict', { symptoms });
      setAiSuggestion(
        `AI suggests: ${res.data.specialty} (Confidence: ${(res.data.confidence * 100).toFixed(0)}%)`
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Book an Appointment
      </Typography>

      {message && (
        <Alert severity={message.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* बायाँ भाग - चयन */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Select Doctor & Date
            </Typography>
            {loading ? (
              <Skeleton height={50} />
            ) : (
              <TextField
                select
                fullWidth
                label="Choose Doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                sx={{ mb: 2 }}
              >
                {doctors.map((doc) => (
                  <MenuItem key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization || 'General'}) – {doc.isOnline ? 'Online' : 'Offline'}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              fullWidth
              type="date"
              label="Select Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            {slots.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  <AccessTime fontSize="small" /> Available Slots
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {slots.map((s, i) => (
                    <Chip
                      key={i}
                      label={`${s.start} - ${s.end}`}
                      clickable
                      color={selectedSlot?.start === s.start ? 'primary' : 'default'}
                      onClick={() => setSelectedSlot(s)}
                      variant={selectedSlot?.start === s.start ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Card>
        </Grid>

        {/* दायाँ भाग - लक्षण और बुकिंग */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Symptoms & Confirm
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Describe your symptoms (optional)"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., headache, fever"
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              startIcon={<Psychology />}
              onClick={checkAI}
              sx={{ mb: 2 }}
            >
              Analyze with AI
            </Button>
            {aiSuggestion && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {aiSuggestion}
              </Alert>
            )}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleBook}
              disabled={!selectedSlot}
              startIcon={<CalendarMonth />}
            >
              Confirm Booking
            </Button>
            {selectedSlot && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selected: {selectedSlot.start} – {selectedSlot.end}
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookAppointment;