const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// ---------- इमरजेंसी ट्रायज (प्रायोरिटी 1-5) ----------
function calculatePriority(symptoms) {
  const s = symptoms.toLowerCase();
  if (s.includes('chest pain') || s.includes('breathless') || s.includes('stroke')) return 5;
  if (s.includes('severe bleeding') || s.includes('poison')) return 5;
  if (s.includes('high fever') || s.includes('vomit') || s.includes('injury')) return 3;
  return 1;
}

// ---------- POST /api/emergency/request ----------
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id;
    const { symptoms } = req.body;
    const priority = calculatePriority(symptoms);

    // 1. ऑनलाइन डॉक्टर खोजो (सिर्फ जो currently online हैं)
    const doctors = await User.find({ role: 'doctor', isOnline: true })
      .select('name specialization fee');

    if (doctors.length === 0) {
      return res.json({ message: 'No doctors online at the moment. Please visit nearest hospital.', priority });
    }

    // 2. बेहतर अनुभव के लिए हम पहले 5 डॉक्टरों को भेजते हैं (real में geolocation लगता)
    const selected = doctors.slice(0, 5).map(d => ({
      id: d._id,
      name: d.name,
      specialization: d.specialization
    }));

    // 3. एक कमरा ID बनाओ (WebRTC के लिए)
    const roomId = 'emergency-' + Date.now();

    // 4. जवाब दो (डॉक्टर स्वीकार करने वाला लॉजिक बाद में सॉकेट से जोड़ेंगे)
    res.json({
      message: 'Emergency request sent. Searching for doctors...',
      priority,
      roomId,
      doctorsNotified: selected
    });
  } catch (err) {
    console.error('Emergency error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;