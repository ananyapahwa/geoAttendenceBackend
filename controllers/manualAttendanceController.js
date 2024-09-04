const ManualAttendance = require('../models/manualAttendance');
const {startOfday, endOfDay,parseISO, addMinutes}=require('date-fns');

// Convert date to IST (Indian Standard Time)
const toIST = (utcDate) => {
  return addMinutes(new Date(utcDate),330);
};

// Convert date to UTC from IST
const toUTC = (date) => {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset is +5:30 from UTC
  return new Date(date.getTime() - istOffset);
};

// Handle manual check-in
const manualCheckIn = async (req, res) => {
  try {
    const { userId, companyID, location } = req.body;

    const date = req.body.date ? new Date(req.body.date) : new Date();
    const manualCheckInTime = req.body.manualCheckInTime ? new Date(req.body.manualCheckInTime) : new Date();

    // Convert to IST for the user's local time
    const dateIST = toIST(date).setUTCHours(0, 0, 0, 0);
    const manualCheckInTimeIST = toIST(manualCheckInTime);

    // Convert to UTC for storage
    const dateUTC = toUTC(new Date(dateIST));
    const manualCheckInTimeUTC = toUTC(manualCheckInTimeIST);

    let attendance = await ManualAttendance.findOne({
      userId,
      companyID,
      date: dateUTC,
    });

    if (attendance) {
      return res.status(400).json({ message: 'Check-in already exists for this date' });
    }

    // Create a new attendance record
    attendance = new ManualAttendance({
      userId,
      companyID,
      date: dateUTC,
      manualCheckInTime: manualCheckInTimeUTC,
      location,
      status: 'Present', // Set status to 'Present' on check-in
    });

    await attendance.save();

    // Convert the dates to IST for the response
    attendance.manualCheckInTime = toIST(attendance.manualCheckInTime);
    attendance.date = toIST(attendance.date);

    res.status(201).json({ message: 'Check-in successful', attendance });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ error: 'Server error during check-in' });
  }
};

// Handle manual check-out
const manualCheckOut = async (req, res) => {
  try {
    const { userId, companyID } = req.body;

    const date = req.body.date ? new Date(req.body.date) : new Date();
    const manualCheckOutTime = req.body.manualCheckOutTime ? new Date(req.body.manualCheckOutTime) : new Date();

    // Convert to IST for the user's local time
    const dateIST = toIST(date).setUTCHours(0, 0, 0, 0);
    const manualCheckOutTimeIST = toIST(manualCheckOutTime);

    // Convert to UTC for storage
    const dateUTC = toUTC(new Date(dateIST));
    const manualCheckOutTimeUTC = toUTC(manualCheckOutTimeIST);

    // Find the user's attendance record for this date
    const attendance = await ManualAttendance.findOne({
      userId,
      companyID,
      date: dateUTC,
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for this date' });
    }

    if (attendance.manualCheckOutTime) {
      return res.status(400).json({ message: 'Check-out already recorded for this date' });
    }

    // Update the attendance record with check-out time and calculate working hours
    const checkInTime = toIST(attendance.manualCheckInTime);
    const checkOutTime = manualCheckOutTimeIST;
    const workingHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2); // Calculate working hours
    attendance.manualCheckOutTime = manualCheckOutTimeUTC;
    attendance.workingHours = `${workingHours} hours`;

    await attendance.save();

    // Convert the dates to IST for the response
    attendance.manualCheckInTime = toIST(attendance.manualCheckInTime);
    attendance.manualCheckOutTime = toIST(attendance.manualCheckOutTime);
    attendance.date = toIST(attendance.date);

    res.status(200).json({ message: 'Check-out successful', attendance });
  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({ error: 'Server error during check-out' });
  }
};

// Fetch manual attendance details
const getManualAttendanceDetails = async (req, res) => {
  try {
    const { userId, companyID, date } = req.query;

    // Set the current date (in IST) if no date is provided
    const queryDate = date ? new Date(date) : new Date();
    const queryDateIST = toIST(queryDate).setUTCHours(0, 0, 0, 0);

    // Fetch attendance records for the user
    const attendanceRecords = await ManualAttendance.find({
      userId,
      companyID,
      date: toUTC(new Date(queryDateIST)),
    });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    // Convert the dates to IST for the response
    attendanceRecords.forEach(record => {
      record.manualCheckInTime = toIST(record.manualCheckInTime);
      record.manualCheckOutTime = toIST(record.manualCheckOutTime);
      record.date = toIST(record.date);
    });

    res.status(200).json({ attendanceRecords });
  } catch (error) {
    console.error('Error fetching attendance details:', error);
    res.status(500).json({ error: 'Server error fetching attendance details' });
  }
};

module.exports = {
  manualCheckIn,
  manualCheckOut,
  getManualAttendanceDetails,
};