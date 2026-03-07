const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { toggleStatus, getNearbyDrivers, getDriverProfile, updateLocation } = require('../controllers/driverController');

router.post('/toggle-status', protect, requireRole('DRIVER'), toggleStatus);
router.get('/nearby', protect, getNearbyDrivers);
router.get('/profile', protect, requireRole('DRIVER'), getDriverProfile);
router.put('/location', protect, requireRole('DRIVER'), updateLocation);

module.exports = router;
