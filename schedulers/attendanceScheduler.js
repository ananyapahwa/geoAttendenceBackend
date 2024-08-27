const cron = require('node-cron');
const mongoose = require('mongoose');
const Attendance = require('../models/attendance');

// Schedule the task to run daily at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('Running end-of-day attendance check...');

  const today = new Date().toDateString();

  try {
    // Find all attendance records for today where checkInTime is missing
    const absentUsers = await Attendance.updateMany(
      { date: today, checkInTime: { $exists: false } },
      {
        $set: {
          status: 'Absent',
        },
      }
    );

    console.log(`Updated ${absentUsers.nModified} records to 'Absent'`);
  } catch (error) {
    console.error('Error updating absent status:', error);
  }
});
