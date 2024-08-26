const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
require('dotenv').config();
const connectDB=require('./config/db');

const app=express();
connectDB();

app.use(cors());
app.use(bodyParser.json())

app.get('/',(req,res)=>{
    res.send("Welcome to geolocation attendance app!")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
