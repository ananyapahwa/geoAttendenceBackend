const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userController = {
  // Get user details
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
 
  // Logout user
  logoutUser: (req, res) => {
    try {
      // Ideally, you would remove or invalidate the token here
      // This example assumes you're just sending a response and relying on the client to discard the token.
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};


module.exports = userController;
