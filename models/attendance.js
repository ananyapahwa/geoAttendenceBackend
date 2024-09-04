const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  date: {
    type: Date, // Date for better time handling
    required: true
  },
  records: [{
    checkInTime: {
      type: Date,
      required: false
    },
    checkOutTime: {
      type: Date,
      required: false
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    isInsideHQ: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Checked In', 'Checked Out'],
      default: 'Checked Out'
    },
    marked: {
      type: String,
      enum: ['Present', 'Absent'],
      default: 'Absent'
    },
    workingHours: {
      type: Number, // Changed to Number if storing hours
      required: false
    }
  }],
  workingHours: {
    type: Number, // Changed to Number if storing hours
    required: false
  }
}, {
  timestamps: true
});

// Ensure 2dsphere index for geospatial queries
attendanceSchema.index({ 'records.location': '2dsphere' });

// Add index for date to optimize queries by date
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);