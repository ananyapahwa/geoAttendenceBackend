const mongoose = require('mongoose');
const Attendance = require('../models/attendance');
const Location = require('../models/location');

const attendanceController = {
  // Update the user's location and handle check-ins/check-outs
  updateLocation: async (req, res) => {
    const { userId, latitude, longitude } = req.body;
    const date = new Date().toDateString();

    // Check if userId is a valid ObjectId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    try {
      // Save the user's location
      await Attendance.updateOne(
        { userId, date },
        { $set: { location: { type: 'Point', coordinates: [longitude, latitude] } } },
        { upsert: true }
      );

      res.status(200).json({ message: 'Location updated successfully' });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Check-in the user
  checkIn: async (req, res) => {
    const { userId } = req.body;
    const date = new Date().toDateString();

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    try {
      await Attendance.updateOne(
        { userId, date },
        { $set: { checkInTime: new Date() } },
        { upsert: true }
      );
      res.status(200).json({ message: 'Checked in successfully' });
    } catch (error) {
      console.error('Error checking in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Check-out the user
  checkOut: async (req, res) => {
    const { userId } = req.body;
    const date = new Date().toDateString();

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    try {
      await Attendance.updateOne(
        { userId, date },
        { $set: { checkOutTime: new Date() } }
      );
      res.status(200).json({ message: 'Checked out successfully' });
    } catch (error) {
      console.error('Error checking out:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Manual check-in based on location
  manualCheckIn: async (req, res) => {
    const { userId, locationId } = req.body;
    const date = new Date().toDateString();

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    try {
      // Ensure that locationId corresponds to a valid location
      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(400).json({ message: 'Invalid location' });
      }

      await Attendance.updateOne(
        { userId, date },
        { $set: { checkInTime: new Date(), locationId } },
        { upsert: true }
      );
      res.status(200).json({ message: 'Manual check-in successful' });
    } catch (error) {
      console.error('Error during manual check-in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = attendanceController;