import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#0a192f', color: 'white', py: 6, mt: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              SwasthHub
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              AI-Integrated Telemedicine Platform connecting patients with trusted doctors in real‑time.
            </Typography>
            <Box>
              <IconButton color="inherit"><Facebook /></IconButton>
              <IconButton color="inherit"><Twitter /></IconButton>
              <IconButton color="inherit"><Instagram /></IconButton>
              <IconButton color="inherit"><LinkedIn /></IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/doctors" color="inherit" display="block" sx={{ mb: 1 }}>Find Doctors</Link>
            <Link component={RouterLink} to="/emergency" color="inherit" display="block" sx={{ mb: 1 }}>Emergency</Link>
            <Link component={RouterLink} to="/symptom-checker" color="inherit" display="block" sx={{ mb: 1 }}>AI Symptom Checker</Link>
            <Link component={RouterLink} to="/video-call" color="inherit" display="block" sx={{ mb: 1 }}>Video Call</Link>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>support@swasthhub.com</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>+91 9876543210</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>New Delhi, India</Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" align="center" sx={{ mt: 4, opacity: 0.6 }}>
          &copy; {new Date().getFullYear()} SwasthHub. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;