const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const router = express.Router();

// Location update
router.post('/update-location', attendanceController.updateLocation);

// Check-in
router.post('/check-in', attendanceController.checkIn);

// Check-out
router.post('/check-out', attendanceController.checkOut);

// Manual check-in
router.post('/manual-check-in', attendanceController.manualCheckIn);

module.exports = router;
