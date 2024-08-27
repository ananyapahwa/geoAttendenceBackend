const express = require('express');
const locationController = require('../controllers/locationController');
const router = express.Router();

// Route to create or update office location
router.post('/upsert', locationController.upsertLocation);

// Route to retrieve office location
router.get('/:userId', locationController.getLocation);

module.exports = router;
