const express = require('express');
const authControllerCompany = require('../controllers/authControllerCompany');
const router = express.Router();

// User registration
router.post('/registercompany', authControllerCompany.registerCompany);

// User login
router.post('/logincompany', authControllerCompany.loginCompany);

// PIN verification
router.post('/verify-pincompany', authControllerCompany.verifyPin);

module.exports = router;