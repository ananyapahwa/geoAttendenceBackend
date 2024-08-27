const mongoose = require('mongoose');
const Attendance = require('../models/attendance');
const Location = require('../models/location');
const { getDistance } = require('geolib');

const updateLocation = async (req, res) => {
  const { userId, latitude, longitude } = req.body;
  const date = new Date().toDateString();

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid User ID' });
  }

  try {
    const location = await Location.findOne({ name: 'HQ' });
    if (!location || !location.coordinates || !location.coordinates.coordinates) {
      return res.status(404).json({ message: 'HQ location not found' });
    }

    const [hqlongitude, hqlatitude] = location.coordinates.coordinates;

    await Attendance.updateOne(
      { userId, date },
      {
        $set: {
          location: { type: 'Point', coordinates: [longitude, latitude] }
        }
      },
      { upsert: true }
    );

    const isInsideHQ = checkIfInsideGeofence(latitude, longitude, hqlatitude, hqlongitude);
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

    // Calculate working hours if check-out time is available
    if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime) {
      const workingHours = (attendanceRecord.checkOutTime - attendanceRecord.checkInTime) / (1000 * 60 * 60); // in hours
      await Attendance.updateOne(
        { userId, date },
        { $set: { workingHours } }
      );
    }

    res.status(200).json({ message: 'Location Updated Successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const checkIfInsideGeofence = (latitude, longitude, hqlatitude, hqlongitude) => {
  const distanceThreshold = 200.0; // meters

  const distance = getDistance(
    { latitude, longitude },
    { latitude: hqlatitude, longitude: hqlongitude }
  );

  return distance <= distanceThreshold;
};

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
