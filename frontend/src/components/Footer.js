import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#b13106', color: 'white', py: 6, mt: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          {/* ब्रांड सेक्शन */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              SwasthHub
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              AI-Integrated Telemedicine Platform connecting patients with trusted doctors in real‑time.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" aria-label="Facebook"><Facebook /></IconButton>
              <IconButton color="inherit" aria-label="Twitter"><Twitter /></IconButton>
              <IconButton color="inherit" aria-label="Instagram"><Instagram /></IconButton>
              <IconButton color="inherit" aria-label="LinkedIn"><LinkedIn /></IconButton>
            </Box>
          </Grid>

          {/* त्वरित लिंक */}
          <Grid item xs={12} sm={6} md={4}>
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

          {/* संपर्क सेक्शन */}
          <Grid item xs={12} sm={6} md={4}>
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

        {/* कॉपीराइट */}
        <Typography
          variant="body2"
          sx={{ mt: 4, opacity: 0.6, textAlign: 'center' }}
        >
          &copy; {new Date().getFullYear()} SwasthHub. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;