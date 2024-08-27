const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const router = express.Router();

// Route to update user location
router.post('/update-location', attendanceController.updateLocation);

// Route for user check-in
router.post('/check-in', attendanceController.checkIn);

// Route for user check-out
router.post('/check-out', attendanceController.checkOut);

// Route for manual check-in with location verification
router.post('/manual-check-in', attendanceController.manualCheckIn);

module.exports = router; 