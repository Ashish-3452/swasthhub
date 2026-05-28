import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#0a192f', color: 'white', py: 6, mt: 8 }}>
      <Container maxWidth="lg">
        {/* ========== फ़ुटर मुख्य हेडिंग ========== */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            SwasthHub
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Your AI-Integrated Telemedicine Platform
          </Typography>
        </Box>

        {/* ========== तीन कॉलम ========== */}
        <Grid container spacing={4} justifyContent="center">
          {/* कॉलम 1: ब्रांड और सोशल आइकन */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
              <IconButton color="inherit" aria-label="Facebook"><Facebook /></IconButton>
              <IconButton color="inherit" aria-label="Twitter"><Twitter /></IconButton>
              <IconButton color="inherit" aria-label="Instagram"><Instagram /></IconButton>
              <IconButton color="inherit" aria-label="LinkedIn"><LinkedIn /></IconButton>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
              Connecting patients with trusted doctors in real‑time.
            </Typography>
          </Grid>

          {/* कॉलम 2: त्वरित लिंक */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/doctors" color="inherit" display="block" sx={{ mb: 1, opacity: 0.8, '&:hover': { opacity: 1 } }}>
              Find Doctors
            </Link>
            <Link component={RouterLink} to="/emergency" color="inherit" display="block" sx={{ mb: 1, opacity: 0.8, '&:hover': { opacity: 1 } }}>
              Emergency
            </Link>
            <Link component={RouterLink} to="/symptom-checker" color="inherit" display="block" sx={{ mb: 1, opacity: 0.8, '&:hover': { opacity: 1 } }}>
              AI Symptom Checker
            </Link>
            <Link component={RouterLink} to="/video-call" color="inherit" display="block" sx={{ mb: 1, opacity: 0.8, '&:hover': { opacity: 1 } }}>
              Video Call
            </Link>
          </Grid>

          {/* कॉलम 3: संपर्क */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
              support@swasthhub.com
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
              +91 9876543210
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              New Delhi, India
            </Typography>
          </Grid>
        </Grid>

        {/* ========== कॉपीराइट ========== */}
        <Typography
          variant="body2"
          sx={{ mt: 6, opacity: 0.6, textAlign: 'center' }}
        >
          &copy; {new Date().getFullYear()} SwasthHub. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;