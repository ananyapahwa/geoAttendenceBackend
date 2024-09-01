const mongoose = require('mongoose');
const ManualAttendance = require('../models/manualAttendance'); // Ensure this matches the exported model name

// Function to handle manual check-in
const manualCheckIn = async (req, res) => {
  const { userId, date, coordinates } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid User ID' });
  }

  try {
    const attendanceRecord = await ManualAttendance.findOne({ userId, date });

    if (attendanceRecord && attendanceRecord.manualCheckInTime) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }

    const newAttendance = await ManualAttendance.updateOne(
      { userId, date },
      {
        $set: {
          manualCheckInTime: new Date(),
          location: { type: 'Point', coordinates }
        }
      },
      { upsert: true }
    );

    res.status(200).json({ message: 'Manual Check-In Successful', newAttendance });
  } catch (error) {
    console.error('Error during manual check-in:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Function to handle manual check-out
const manualCheckOut = async (req, res) => {
    const { userId, date, coordinates } = req.body;
  
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid User ID ' });
    }
  
    try {
      const attendanceRecord = await ManualAttendance.findOne({ userId, date });
  
      if (!attendanceRecord || !attendanceRecord.manualCheckInTime) {
        return res.status(400).json({ message: 'No check-in record found for today' });
      }
  
      if (attendanceRecord.manualCheckOutTime) {
        return res.status(400).json({ message: 'Already checked out for today' });
      }
  
      // Calculate working hours
      const checkInTime = new Date(attendanceRecord.manualCheckInTime);
      const checkOutTime = new Date();
      const totalMinutes = Math.round((checkOutTime - checkInTime) / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const workingHours = `${hours} hours and ${minutes} minutes`;
  
      const updatedAttendance = await ManualAttendance.findOneAndUpdate(
        { userId, date },
        {
          $set: {
            manualCheckOutTime: checkOutTime,
            location: { type: 'Point', coordinates },
            workingHours
          }
        },
        { new: true } // Return the updated document
      );
  
      res.status(200).json({ message: 'Manual Check-Out Successful', updatedAttendance });
    } catch (error) {
      console.error('Error during manual check-out:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  

// Function to get manual attendance details
const getManualAttendanceDetails = async (req, res) => {
  const { userId, date } = req.query;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid User ID' });
  }

  try {
    const attendanceRecord = await ManualAttendance.findOne({ userId, date });

    if (!attendanceRecord) {
      return res.status(404).json({ message: 'No manual attendance record found for this date' });
    }

    res.status(200).json({
      manualCheckInTime: attendanceRecord.manualCheckInTime,
      manualCheckOutTime: attendanceRecord.manualCheckOutTime,
      workingHours: attendanceRecord.workingHours || 'Not Calculated'
    });
  } catch (error) {
    console.error('Error fetching manual attendance details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  manualCheckIn,
  manualCheckOut,
  getManualAttendanceDetails
};
