const express = require('express');
const router = express.Router();
//const Appointment = require('../models/Appointment');
//const DoctorSlot = require('../models/DoctorSlot');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// --------------- टाइम हेल्पर फंक्शंस ---------------
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

// ---------- डॉक्टर अपनी वीकली स्लॉट सेट करे ----------
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

    // 30-मिनट के स्लॉट्स जनरेट करो
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

    // 1. डॉक्टर का होना और ऑनलाइन ज़रूरी नहीं, पर स्लॉट फ़्री होना चाहिए
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

    // यहाँ हम डॉक्टर को रियल-टाइम नोटिफिकेशन भी भेज सकते हैं (Socket.io से)
    // लेकिन फ़िलहाल छोड़ देते हैं

    res.status(201).json({ message: 'Appointment booked', appointment });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- मरीज़ / डॉक्टर अपनी अपॉइंटमेंट्स देखें ----------
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role === 'doctor'
      ? { doctorId: req.user.id }
      : { patientId: req.user.id };

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ slotDate: 1, startTime: 1 });

    res.json(appointments);
  } catch (err) {
    console.error('My appointments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can update profile.' });
    }

    const { specialization, experience, fee, consultationHours } = req.body;

    if (specialization !== undefined) user.specialization = specialization;
    if (experience !== undefined) user.experience = experience;
    if (fee !== undefined) user.fee = fee;
    if (consultationHours !== undefined) user.consultationHours = consultationHours;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/doctors/toggle-online
router.put('/toggle-online', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can toggle status.' });
    }

    // स्टेटस उल्टा करो
    user.isOnline = !user.isOnline;
    await user.save();

    // io ऑब्जेक्ट app से प्राप्त करो और सभी क्लाइंट को इवेंट भेजो
    const io = req.app.get('io');
    if (io) {
      io.emit('doctor-status-changed', {
        doctorId: user._id,
        isOnline: user.isOnline
      });
    }

    res.json({ isOnline: user.isOnline });
  } catch (err) {
    console.error('Toggle online error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ isOnline: -1 });
    res.json(doctors);
  } catch (err) {
    console.error('Fetch doctors error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;