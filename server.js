const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
require('dotenv').config();
const connectDB=require('./config/db');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const userRoutes = require('./routes/user');
const locationRoutes = require('./routes/location');
require('./schedulers/attendanceScheduler');

const app=express();
connectDB();

app.use(cors());
app.use(bodyParser.json())

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/user', userRoutes);
app.use('/api/locations', locationRoutes);

app.get('/',(req,res)=>{
    res.send("Welcome to geolocation attendance app!")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));