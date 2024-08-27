const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, userController.getUser); // Protecting the /me route
router.post('/logout', authMiddleware, userController.logoutUser); // Protecting the /logout route

module.exports = router;