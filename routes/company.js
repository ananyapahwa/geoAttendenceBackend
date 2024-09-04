const express = require('express');
const router = express.Router();
const authCompanyMiddleware = require('../middleware/authCompanyMiddleware'); // Auth middleware for company
const companyController = require('../controllers/companyController');

// Route to get company profile
router.get('/profile', authCompanyMiddleware, companyController.getCompanyProfile);

router.get('/companyinfo/:companyID', companyController.getCompanyInfoById );

router.get('/employeedetails/:companyID', companyController.employeeInfo );

module.exports = router;