const express = require('express');
const router = express.Router();
const {
  manualCheckIn,
  manualCheckOut,
  getManualAttendanceDetails
} = require('../controllers/manualAttendanceController');

// Route for manual check-in
router.post('/checkin', manualCheckIn);

// Route for manual check-out
router.post('/checkout', manualCheckOut);

// Route to get manual attendance details
router.get('/details', getManualAttendanceDetails);

module.exports = router;
