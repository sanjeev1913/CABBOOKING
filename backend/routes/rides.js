const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
    requestRide,
    estimateFare,
    acceptRide,
    startRide,
    completeRide,
    getRideHistory,
    getCurrentRide,
} = require('../controllers/rideController');

router.post('/estimate', protect, estimateFare);
router.post('/request', protect, requireRole('RIDER'), requestRide);
router.post('/accept', protect, requireRole('DRIVER'), acceptRide);
router.post('/start', protect, requireRole('DRIVER'), startRide);
router.post('/complete', protect, requireRole('DRIVER'), completeRide);
router.get('/history', protect, getRideHistory);
router.get('/current', protect, getCurrentRide);

module.exports = router;
