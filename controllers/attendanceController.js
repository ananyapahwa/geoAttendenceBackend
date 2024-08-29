const mongoose = require('mongoose');
const Attendance = require('../models/attendance');
const Location = require('../models/location');
const { getDistance } = require('geolib');

// Function to update user location
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
    console.log('Is Inside HQ:', isInsideHQ);

    // First fetch the record to check the current state
    let attendanceRecord = await Attendance.findOne({ userId, date });

    let message = 'Location Updated Successfully';
    let workingHours = null;
    let checkStatus = 'Not Checked In/Out';

    if (isInsideHQ) {
      if (!attendanceRecord.checkInTime) {
        await checkIn(userId, date);
        // Fetch the record again to ensure we get the updated data
        attendanceRecord = await Attendance.findOne({ userId, date });
        message = 'Checked In';
        checkStatus = 'Checked In';
      }
    } else {
      if (attendanceRecord.checkInTime && !attendanceRecord.checkOutTime) {
        await checkOut(userId, date);
        // Fetch the record again to ensure we get the updated data
        attendanceRecord = await Attendance.findOne({ userId, date });

        message = 'Checked Out';
        checkStatus = 'Checked Out';

        // Calculate working hours in hours and minutes
        const totalMinutes = Math.round((attendanceRecord.checkOutTime - attendanceRecord.checkInTime) / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        workingHours = `${hours} hours and ${minutes} minutes`;

        await Attendance.updateOne(
          { userId, date },
          { $set: { workingHours } }
        );
      }
    }

    res.status(200).json({
      message,
      status: attendanceRecord.status,
      workingHours,
      checkStatus
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Function to get attendance details for a specific date
const getAttendanceDetails = async (req, res) => {
  const { userId, date } = req.query; // Using query parameters

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid User ID' });
  }

  try {
    // Parse the input date and create the start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Query for attendance records within the date range
    const attendanceRecord = await Attendance.findOne({
      userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!attendanceRecord) {
      return res.status(404).json({ message: 'No attendance record found for this date' });
    }

    // Calculate working hours if not already calculated
    let workingHours = attendanceRecord.workingHours;
    if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime && !workingHours) {
      const totalMinutes = Math.round((attendanceRecord.checkOutTime - attendanceRecord.checkInTime) / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      workingHours = `${hours} hours and ${minutes} minutes`;

      await Attendance.updateOne(
        { userId, date: { $gte: startOfDay, $lte: endOfDay } },
        { $set: { workingHours } }
      );
    }

    res.status(200).json({
      checkInTime: attendanceRecord.checkInTime,
      checkOutTime: attendanceRecord.checkOutTime,
      workingHours: workingHours || 'Not Calculated'
    });
  } catch (error) {
    console.error('Error fetching attendance details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Function to check if the user is inside the HQ geofence
const checkIfInsideGeofence = (latitude, longitude, hqlatitude, hqlongitude) => {
  const distanceThreshold = 200.0; // meters

  const distance = getDistance(
    { latitude, longitude },
    { latitude: hqlatitude, longitude: hqlongitude }
  );

  return distance <= distanceThreshold;
};

// Function to handle user check-in
const checkIn = async (userId, date) => {
  await Attendance.updateOne(
    { userId, date },
    {
      $set: {
        checkInTime: new Date(),
        isInsideHQ: true,
        status: 'Present'
      }
    },
    { upsert: true }
  );
};

// Function to handle user check-out
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

// Export the functions
module.exports = { updateLocation , getAttendanceDetails};