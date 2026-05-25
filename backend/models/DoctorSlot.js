const mongoose = require('mongoose');

const doctorSlotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: Number,        // 0=Sunday, 1=Monday, ..., 6=Saturday
    required: true
  },
  startTime: {
    type: String,        // "09:00"
    required: true
  },
  endTime: {
    type: String,        // "17:00"
    required: true
  }
});

// एक डॉक्टर एक दिन में सिर्फ़ एक स्लॉट सेट कर सके
doctorSlotSchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('DoctorSlot', doctorSlotSchema);