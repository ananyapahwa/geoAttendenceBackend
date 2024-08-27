const express = require('express');
const { upsertLocation, getLocation } = require('../controllers/locationController'); // Adjust path as needed

const router = express.Router();

// Route to upsert location
router.post('/upsert-location', upsertLocation);

// Route to get location by userId
router.get('/location/:userId', getLocation);

module.exports = router;
