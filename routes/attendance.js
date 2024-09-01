const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Route to update user location (handles both check-in and check-out based on location)
router.post('/update-location', attendanceController.updateLocation);

// Route to get attendance details for a specific date
router.get('/attendance-details', attendanceController.getAttendanceDetails);

module.exports = router;
