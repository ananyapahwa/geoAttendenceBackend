const Location = require('../models/location');
const mongoose = require('mongoose');

const locationController = {
  // Create or update office location
  upsertLocation: async (req, res) => {
    const { userId, name, address, latitude, longitude } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
      // Upsert the location based on userId
      const location = await Location.findOneAndUpdate(
        { userId },
        { name, address, coordinates: [longitude, latitude] },
        { new: true, upsert: true }
      );

      res.status(200).json({ message: 'Location updated successfully', location });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Retrieve office location
  getLocation: async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
      const location = await Location.findOne({ userId });
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }

      res.status(200).json(location);
    } catch (error) {
      console.error('Error retrieving location:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = locationController;
