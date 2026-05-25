const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');   // जल्दी ही बनाएँगे

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', require('./routes/appointments'))

app.get('/', (req, res) => res.send('SwasthHub API running'));

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // डॉक्टर या कोई भी उपयोगकर्ता कॉल शुरू कर सकता है
  socket.on('start-call', ({ patientId, appointmentId }) => {
    // एक यूनिक रूम ID जनरेट करें
    const roomId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // डॉक्टर खुद इस रूम में जुड़ जाए
    socket.join(roomId);
    
    // डॉक्टर को रूम ID भेजें
    socket.emit('call-started', { roomId, appointmentId });
    
    // मरीज़ को खोजें (मान लें कि मरीज़ का socket किसी तरह online है)
    // हम patientId को एक कमरे में रख सकते हैं, लेकिन अभी के लिए हम सभी कनेक्टेड सॉकेट्स को ब्रॉडकास्ट करेंगे
    // बेहतर तरीका: मरीज़ के सॉकेट को उसके userId से ट्रैक करें।
    // हम यहाँ एक सरल तरीका अपनाएँगे: मरीज़ को 'patient-{patientId}' रूम में जॉइन कराएँ (लॉगिन पर)।
    // फिर यहाँ उस रूम में इवेंट भेजें।
    io.to(`patient-${patientId}`).emit('incoming-call', {
      roomId,
      appointmentId,
      message: 'Doctor is calling you. Join now!'
    });
  });

  // मरीज़ को उसके निजी रूम में रजिस्टर करना (लॉगिन के बाद)
  socket.on('register-patient', (userId) => {
    socket.join(`patient-${userId}`);
    console.log(`Patient ${userId} registered for incoming calls`);
  });


  // -------- वीडियो कॉल के लिए --------
  // रूम जॉइन करना
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    // बाकी लोगों को बताओ कि कोई नया आया
    socket.to(roomId).emit('user-joined', socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // WebRTC सिग्नलिंग डेटा (offer, answer, ice candidates)
  socket.on('signal', ({ roomId, data }) => {
    // भेजने वाले को छोड़कर बाकी सबको सिग्नल भेजो
    socket.to(roomId).emit('signal', { from: socket.id, data });
  });

  // डिस्कनेक्ट
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
app.set('io', io);   // routes में io उपलब्ध कराने के लिए
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const emergencyRoutes = require('./routes/emergency');
const aiRoutes = require('./routes/ai');

// ... बाकी कोड के बाद
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ai', aiRoutes);
