const express = require('express');
const { upsertLocation, getLocation } = require('../controllers/locationController');

const router = express.Router();

// Route to upsert location
router.post('/upsert-location', upsertLocation);

// Route to get location by name
router.get('/location/:name', getLocation);

module.exports = router;
