const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/company');

const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.company.id).select('-password');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCompanyProfile };
