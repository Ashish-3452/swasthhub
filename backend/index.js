const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// रूट फ़ाइलें
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const emergencyRoutes = require('./routes/emergency');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);

// ---------- Socket.io CORS (प्रोडक्शन के लिए) ----------
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// ---------- Express CORS ----------
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ---------- MongoDB कनेक्शन ----------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// ---------- API रूट्स ----------
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ai', aiRoutes);

// ---------- हेल्थ चेक ----------
app.get('/', (req, res) => res.send('SwasthHub API running'));

// ---------- Socket.io इवेंट्स ----------
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // डॉक्टर द्वारा कॉल शुरू करना
  socket.on('start-call', ({ patientId, appointmentId }) => {
    const roomId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    socket.join(roomId);
    socket.emit('call-started', { roomId, appointmentId });
    io.to(`patient-${patientId}`).emit('incoming-call', {
      roomId,
      appointmentId,
      message: 'Doctor is calling you. Join now!'
    });
  });

  // मरीज़ को उसके निजी रूम में रजिस्टर करना
  socket.on('register-patient', (userId) => {
    socket.join(`patient-${userId}`);
    console.log(`Patient ${userId} registered for incoming calls`);
  });

  // वीडियो कॉल रूम जॉइन
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // WebRTC सिग्नलिंग
  socket.on('signal', ({ roomId, data }) => {
    socket.to(roomId).emit('signal', { from: socket.id, data });
  });

  // डिस्कनेक्ट
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ---------- io को ऐप में सेट करें (routes के लिए) ----------
app.set('io', io);

// ---------- सर्वर प्रारंभ ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));