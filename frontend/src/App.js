import React, { useEffect } from 'react';   // या अगर पहले से React इम्पोर्ट है तो useEffect जोड़ें
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';           // यह नई लाइन
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
// ... बाकी इम्पोर्ट
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AIDoctorChat from './pages/AIDoctorChat';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CallNotification from './components/CallNotification';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorProfile from './pages/DoctorProfile';
import DoctorList from './pages/DoctorList';
import DoctorSlotManager from './pages/DoctorSlotManager';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import Emergency from './pages/Emergency';


import VideoCall from './pages/VideoCall';

import './customStyles.css';

function App() {
  // ------ ग्लोबल इनकमिंग कॉल लिसनर ------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'patient') return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket'] });

    socket.on('connect', () => {
      socket.emit('register-patient', user.id);
      console.log('Patient globally registered for calls');
    });

    socket.on('incoming-call', ({ roomId, message }) => {
      if (window.confirm(message || 'Doctor is calling you. Join now?')) {
        window.location.href = `/video-call?room=${roomId}&role=receiver`;
      }
    });

    return () => socket.disconnect();
  }, []);
  return (
    <Router>
      <CssBaseline />
      <CallNotification />
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} /> 
         <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctor-profile" element={<DoctorProfile />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctor-slots" element={<DoctorSlotManager />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="/emergency" element={<Emergency />} /> 
      <Route path="/symptom-checker" element={<AIDoctorChat />} />
       <Route path="/ai-doctor" element={<AIDoctorChat />} />
      </Routes>
       <Footer />  
    </Router>
  );
}

export default App;