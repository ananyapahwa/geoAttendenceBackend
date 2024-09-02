const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Company = require('../models/company');
const sendEmail = require('../utils/helpers').sendEmail;

const authControllerCompany = {
  registerCompany: async (req, res) => {
    const { companyName, contactNumber, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log('Generating PIN...');
      const pin = Math.floor(100000 + Math.random() * 900000); // 6-digit PIN
      console.log(`Generated PIN: ${pin}`);

      const newCompany = new Company({
        companyName,
        contactNumber,
        email,
        password: hashedPassword,
        pin,
      });

      console.log('New company object:', newCompany);

      console.log('Saving new company...');
      await newCompany.save();

      console.log('Saved company:', await Company.findOne({ email }));

      console.log('Sending email...');
      await sendEmail(email, 'Your PIN', `Your verification PIN is ${pin}`);

      console.log('Company registered successfully');
      res.status(201).json({ message: 'Company registered. Please check your email for the PIN.' });
    } catch (error) {
      console.error('Error during company registration:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  loginCompany: async (req, res) => {
    const { email, password } = req.body;

    try {
      console.log('Finding company...');
      const company = await Company.findOne({ email });
      if (!company) {
        console.log('Company not found');
        return res.status(400).json({ message: 'Company not found' });
      }

      console.log('Comparing passwords...');
      const isMatch = await bcrypt.compare(password, company.password);
      if (!isMatch) {
        console.log('Invalid credentials');
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      console.log('Generating token...');
      const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET_COMPANY, { expiresIn: '1h' });

      console.log('Login successful');
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error during company login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  verifyPin: async (req, res) => {
    const { email, pin } = req.body;

    try {
      console.log('Finding company by email...');
      const company = await Company.findOne({ email });
      console.log(`Provided PIN: ${pin}`);
      console.log(`Stored PIN: ${company ? company.pin : 'Company not found'}`);
      console.log(`Company email: ${company ? company.email : 'Company not found'}`);

      if (!company || (company.pin)!== Number(pin)) {
        console.log('Invalid PIN');
        return res.status(400).json({ message: 'Invalid PIN' });
      }

      console.log('PIN verified, clearing PIN...');
      company.pin = null; // Clear PIN after successful verification
      company.emailVerified = true;
      await company.save();

      console.log('PIN verification successful');
      res.status(200).json({ message: 'PIN verified successfully' });
    } catch (error) {
      console.error('Error during PIN verification:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = authControllerCompany;
