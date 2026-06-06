import React from 'react';
import {
  Box, Container, Grid, Typography, Link, IconButton, Divider
} from '@mui/material';
import {
  Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#0a192f', color: 'white', py: 6, mt: 8 }}>
      <Container maxWidth="lg">
        {/* ---------- मुख्य हेडिंग ---------- */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            SwasthHub
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Your AI-Integrated Telemedicine Platform
          </Typography>
        </Box>

        {/* ---------- तीन कॉलम (सेंटर में और स्पेसिंग के साथ) ---------- */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={8} sx={{ maxWidth: 900 }}>
            {/* कॉलम 1: सोशल आइकन */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Connect With Us
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, mb: 2 }}>
                  <IconButton color="inherit" aria-label="Facebook"><Facebook /></IconButton>
                  <IconButton color="inherit" aria-label="Twitter"><Twitter /></IconButton>
                  <IconButton color="inherit" aria-label="Instagram"><Instagram /></IconButton>
                  <IconButton color="inherit" aria-label="LinkedIn"><LinkedIn /></IconButton>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Connecting patients with trusted doctors in real‑time.
                </Typography>
              </Box>
            </Grid>

            {/* कॉलम 2: त्वरित लिंक */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Links
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
                  {[
                    { to: '/doctors', text: 'Find Doctors' },
                    { to: '/emergency', text: 'Emergency' },
                    { to: '/symptom-checker', text: 'AI Symptom Checker' },
                    { to: '/video-call', text: 'Video Call' },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      component={RouterLink}
                      to={link.to}
                      color="inherit"
                      sx={{
                        display: 'block',
                        width: '100%',
                        opacity: 0.8,
                        '&:hover': { opacity: 1, textDecoration: 'underline' },
                      }}
                    >
                      {link.text}
                    </Link>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* कॉलम 3: संपर्क */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Contact Us
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <Email fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    support@swasthhub.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <Phone fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    +91 7061571706
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LocationOn fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Daltonganj, Palamu, Jharkhand, 822110
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ---------- डिवाइडर ---------- */}
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* ---------- कॉपीराइट ---------- */}
        <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.5 }}>
          &copy; {new Date().getFullYear()} SwasthHub. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;