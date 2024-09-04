const mongoose=require('mongoose');

const ManualAttendanceSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    date: {
      type: Date, // Date of manual check-in/check-out
      required: true
    },
    manualCheckInTime: {
      type: Date,
      required: false
    },
    manualCheckOutTime: {
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
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late'],
        default: 'Absent'
      },
      workingHours: String  ,
  }, {
    timestamps: true
  });
  
  module.exports = mongoose.model('ManualAttendance', ManualAttendanceSchema);