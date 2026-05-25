import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AIDoctorChat from './pages/AIDoctorChat';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
  return (
    <Router>
      <CssBaseline />
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