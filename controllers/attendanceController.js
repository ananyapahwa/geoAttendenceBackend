const mongoose = require('mongoose');
const Attendance = require('../models/attendance');
const { getDistance } = require('geolib'); // Import getDistance from geolib

// Update location and handle check-ins/check-outs
const updateLocation = async (req, res) => {
  const { userId, latitude, longitude, hqLatitude, hqLongitude } = req.body;
  const date = new Date().toDateString();

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  if (!hqLatitude || !hqLongitude) {
    return res.status(400).json({ message: 'HQ coordinates are required' });
  }

  try {
    // Save or update the user's location
    await Attendance.updateOne(
      { userId, date },
      { 
        $set: {
          location: { type: 'Point', coordinates: [longitude, latitude] }
        }
      },
      { upsert: true }
    );

    // Check if the user is inside the geofence
    const isInsideHQ = checkIfInsideGeofence(latitude, longitude, hqLatitude, hqLongitude);

    // Update attendance based on geofence status
    const attendanceRecord = await Attendance.findOne({ userId, date });

    if (isInsideHQ) {
      if (!attendanceRecord.checkInTime) {
        await checkIn(userId, date);
      }
    } else {
      if (attendanceRecord.checkInTime && !attendanceRecord.checkOutTime) {
        await checkOut(userId, date);
      }
    }

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to determine if the location is inside the geofence
const checkIfInsideGeofence = (latitude, longitude, hqLatitude, hqLongitude) => {
  const distanceThreshold = 200.0; // Geofence radius in meters

  const distance = getDistance(
    { latitude, longitude },
    { latitude: hqLatitude, longitude: hqLongitude }
  );

  return distance <= distanceThreshold;
};

// Check-in the user
const checkIn = async (userId, date) => {
  await Attendance.updateOne(
    { userId, date },
    { 
      $set: { 
        checkInTime: new Date(),
        isInsideHQ: true
      },
      $setOnInsert: {
        status: 'Present'
      }
    },
    { upsert: true }
  );
};

// Check-out the user
const checkOut = async (userId, date) => {
  await Attendance.updateOne(
    { userId, date },
    { 
      $set: { 
        checkOutTime: new Date(),
        isInsideHQ: false
      }
    }
  );
};

module.exports = { updateLocation };
