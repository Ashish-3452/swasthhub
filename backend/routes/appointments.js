const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const DoctorSlot = require('../models/DoctorSlot');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// --------------- समय सहायक फंक्शन ---------------
function parseTime(str) {
  const [h, m] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function formatTime(d) {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ---------- डॉक्टर अपनी साप्ताहिक स्लॉट सेट करे ----------
router.post('/set-slots', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can set slots' });
    }

    const { slots } = req.body; // [{ dayOfWeek, startTime, endTime }]
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'slots array required' });
    }

    // पुराने स्लॉट हटाओ और नए डालो
    await DoctorSlot.deleteMany({ doctorId: req.user.id });
    const slotDocs = slots.map(s => ({ ...s, doctorId: req.user.id }));
    await DoctorSlot.insertMany(slotDocs);

    res.json({ message: 'Slots updated', slots: slotDocs });
  } catch (err) {
    console.error('Set slots error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- किसी डॉक्टर के उपलब्ध स्लॉट (मरीज़ के लिए) ----------
router.get('/slots/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;          // YYYY-MM-DD

    if (!date) return res.status(400).json({ message: 'date query param required' });

    const dayOfWeek = new Date(date).getDay();
    const doctorSlot = await DoctorSlot.findOne({ doctorId, dayOfWeek });

    if (!doctorSlot) {
      return res.json({ slots: [] });
    }

    // 30-मिनट के स्लॉट जनरेट करो
    const start = parseTime(doctorSlot.startTime);
    const end = parseTime(doctorSlot.endTime);
    const allSlots = [];
    for (let t = start; t < end; t += 30 * 60 * 1000) {
      allSlots.push({
        start: formatTime(new Date(t)),
        end: formatTime(new Date(t + 30 * 60 * 1000))
      });
    }

    // पहले से बुक स्लॉट हटाओ
    const booked = await Appointment.find({
      doctorId,
      slotDate: date,
      status: { $ne: 'cancelled' }
    });

    const bookedSet = new Set(booked.map(b => `${b.startTime}-${b.endTime}`));
    const freeSlots = allSlots.filter(s => !bookedSet.has(`${s.start}-${s.end}`));

    res.json({ slots: freeSlots });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- मरीज़ अपॉइंटमेंट बुक करे ----------
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, slotDate, startTime, endTime, symptoms } = req.body;

    // स्लॉट पहले से बुक तो नहीं?
    const conflict = await Appointment.findOne({
      doctorId,
      slotDate,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: 'scheduled'
    });

    if (conflict) {
      return res.status(409).json({ message: 'Slot already booked' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      slotDate,
      startTime,
      endTime,
      symptoms: symptoms || ''
    });

    res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- मरीज़ / डॉक्टर अपनी अपॉइंटमेंट देखें ----------
// GET /api/appointments/my
router.get('/my', authMiddleware, async (req, res) => {
  try {
    // डीबग: लॉग इन उपयोगकर्ता की जानकारी
    console.log('Authenticated user ID:', req.user.id);
    console.log('User role (from token):', req.user.role);

    // भूमिका के अनुसार फ़िल्टर बनाएँ (केवल एक बार)
    const filter = req.user.role === 'doctor'
      ? { doctorId: req.user.id }
      : { patientId: req.user.id };

    console.log('Filter used:', filter);   // 👈 यह बताएगा कि क्या ढूँढ रहे हैं

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ slotDate: 1, startTime: 1 });

    console.log('Number of appointments found:', appointments.length);  // 👈 मिली संख्या

    res.json(appointments);
  } catch (err) {
    console.error('My appointments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// backend/routes/appointments.js में जोड़ें
router.post('/start-call', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // सुनिश्चित करें कि रिक्वेस्ट करने वाला डॉक्टर ही है
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the assigned doctor can start the call' });
    }

    const roomId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // io इंस्टेंस प्राप्त करें (app से)
    const io = req.app.get('io');
    
    // डॉक्टर को रूम ID भेजें (हालाँकि हम इसे रिस्पॉन्स में भी भेज सकते हैं)
    // io.to(req.user.id).emit('call-started', { roomId, appointmentId }); // डॉक्टर के सॉकेट के लिए
    
    // मरीज़ को नोटिफाई करें
    io.to(`patient-${appointment.patientId}`).emit('incoming-call', {
      roomId,
      appointmentId,
      message: 'Your doctor is ready for the video consultation.'
    });

    res.json({ roomId, appointmentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;