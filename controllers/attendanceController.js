const Attendance = require('../models/attendance');
const Location = require('../models/location');

const attendanceController = {
  updateLocation: async (req, res) => {
    const { userId, latitude, longitude } = req.body;

    try {
      const officeLocation = await Location.findOne({ userId }); 
      const distance = calculateDistance(latitude, longitude, officeLocation.latitude, officeLocation.longitude);

      const isWithinRadius = distance <= 200;

      if (isWithinRadius) {
        await Attendance.updateOne(
          { userId, date: new Date().toDateString() },
          { $set: { lastLocation: { latitude, longitude }, insideOffice: true } },
          { upsert: true }
        );
        res.status(200).send('Location updated');
      } else {
        res.status(400).send('Out of office range');
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  checkIn: async (req, res) => {
    const { userId } = req.body;

    try {
      await Attendance.updateOne(
        { userId, date: new Date().toDateString() },
        { $set: { checkInTime: new Date(), insideOffice: true } },
        { upsert: true }
      );
      res.status(200).send('Checked in successfully');
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  checkOut: async (req, res) => {
    const { userId } = req.body;

    try {
      await Attendance.updateOne(
        { userId, date: new Date().toDateString() },
        { $set: { checkOutTime: new Date(), insideOffice: false } }
      );
      res.status(200).send('Checked out successfully');
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  manualCheckIn: async (req, res) => {
    const { userId, locationId } = req.body;

    try {
      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(400).json({ message: 'Invalid location' });
      }

      await Attendance.updateOne(
        { userId, date: new Date().toDateString() },
        { $set: { checkInTime: new Date(), insideOffice: true, locationId } },
        { upsert: true }
      );
      res.status(200).send('Manual check-in successful');
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δφ = (lat2 - lat1) * (Math.PI / 180);
  const Δλ = (lon2 - lon1) * (Math.PI / 180);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

module.exports = attendanceController;