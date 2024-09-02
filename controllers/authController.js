const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Company = require('../models/company');
const sendEmail = require('../utils/helpers').sendEmail;
const mongoose = require('mongoose');

const authController = {
  registerUser: async (req, res) => {
    const { name, companyID, contactNumber, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!mongoose.isValidObjectId(companyID)) {
      return res.status(400).json({ message: 'Invalid Company ID' });
  }

    try {
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log('Generating PIN...');
      const pin = Math.floor(100000 + Math.random() * 900000); // 6-digit PIN
      console.log(`Generated PIN: ${pin}`);

      const newUser = new User({
        name,
        companyID,
        contactNumber,
        email,
        password: hashedPassword,
        pin,
      });

      console.log('New user object:', newUser);

      console.log('Saving new user...');
      await newUser.save();

      console.log('Saved user:', await User.findOne({ email }));

      console.log('Sending email...');
      await sendEmail(email, 'Your PIN', `Your verification PIN is ${pin}`);

      console.log('User registered successfully');
      res.status(201).json({ message: 'User registered. Please check your email for the PIN.' });
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  loginUser: async (req, res) => {
    const { email, password } = req.body;

    try {
      console.log('Finding user...');
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found');
        return res.status(400).json({ message: 'User not found' });
      }

      console.log('Comparing passwords...');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Invalid credentials');
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      console.log('Generating token...');
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_USER, { expiresIn: '1h' });

      console.log('Login successful');
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error during user login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  verifyPin: async (req, res) => {
    const { email, pin } = req.body;

    try {
      console.log('Finding user by email...');
      const user = await User.findOne({ email });
      console.log(`Provided PIN: ${pin}`);
      console.log(`Stored PIN: ${user ? user.pin : 'User not found'}`);
      console.log(`User email: ${user ? user.email : 'User not found'}`);

      if (!user || (user.pin)!== Number(pin)) {
        console.log('Invalid PIN');
        return res.status(400).json({ message: 'Invalid PIN' });
      }

      console.log('PIN verified, clearing PIN...');
      user.pin = null; // Clear PIN after successful verification
      user.emailVerified = true;
      await user.save();

      console.log('PIN verification successful');
      res.status(200).json({ message: 'PIN verified successfully' });
    } catch (error) {
      console.error('Error during PIN verification:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = authController;