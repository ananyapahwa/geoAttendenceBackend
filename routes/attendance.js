const express = require('express');
const { updateLocation, getAttendanceDetails } = require('../controllers/attendanceController');

const router = express.Router();

// Route for updating user location
router.post('/updateLocation', updateLocation);

// Route for getting attendance details
router.get('/getAttendanceDetails', getAttendanceDetails);

module.exports = router;
