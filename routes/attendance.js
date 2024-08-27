const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/attendanceController'); // Import your controller

// Route to update location
router.post('/update-location', updateLocation); // Ensure updateLocation is imported and defined

module.exports = router;
