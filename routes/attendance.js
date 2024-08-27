const express = require('express');
const { updateLocation } = require('../controllers/attendanceController'); // Adjust path as needed

const router = express.Router();

// Route for updating location
router.post('/update-location', updateLocation);

module.exports = router;
