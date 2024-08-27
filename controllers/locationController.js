const Location = require('../models/location');
const mongoose = require('mongoose');

const locationController = {
  // Create or update location
  upsertLocation: async (req, res) => {
    const { name, latitude, longitude } = req.body;

    try {
      // Upsert the location based on name
      const location = await Location.findOneAndUpdate(
        { name },
        {
          coordinates: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        },
        { new: true, upsert: true }
      );

      res.status(200).json({ message: 'Location updated successfully', location });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Retrieve location by name
  getLocation: async (req, res) => {
    const { name } = req.params;

    try {
      const location = await Location.findOne({ name });
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
