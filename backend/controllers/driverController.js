const Driver = require('../models/Driver');

// @route  POST /api/drivers/toggle-status
const toggleStatus = async (req, res) => {
    try {
        const { isOnline, currentLocation } = req.body;
        const driver = await Driver.findOne({ userId: req.user._id });
        if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

        driver.isOnline = isOnline !== undefined ? isOnline : !driver.isOnline;

        if (currentLocation && currentLocation.lat && currentLocation.lng) {
            driver.currentLocation = {
                type: 'Point',
                coordinates: [currentLocation.lng, currentLocation.lat],
            };
        }

        await driver.save();

        // Notify via socket
        const io = req.app.get('io');
        if (io) {
            io.emit('driver:status_changed', { driverId: driver._id, isOnline: driver.isOnline });
        }

        res.json({ driver, message: `Driver is now ${driver.isOnline ? 'online' : 'offline'}` });
    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  GET /api/drivers/nearby
const getNearbyDrivers = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query; // radius in km

        let drivers;
        if (lat && lng) {
            drivers = await Driver.find({
                isOnline: true,
                currentLocation: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                        $maxDistance: radius * 1000, // convert to meters
                    },
                },
            }).populate('userId', 'name phone');
        } else {
            // Fallback: return all online drivers without geo filter
            drivers = await Driver.find({ isOnline: true }).populate('userId', 'name phone');
        }

        res.json({ drivers });
    } catch (error) {
        console.error('Nearby drivers error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  GET /api/drivers/profile
const getDriverProfile = async (req, res) => {
    try {
        const driver = await Driver.findOne({ userId: req.user._id }).populate('userId', 'name email phone');
        if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
        res.json({ driver });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  PUT /api/drivers/location
const updateLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const driver = await Driver.findOne({ userId: req.user._id });
        if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

        driver.currentLocation = { type: 'Point', coordinates: [lng, lat] };
        await driver.save();

        // Broadcast location update
        const io = req.app.get('io');
        if (io) {
            io.emit('driver:location_update', { driverId: driver._id, lat, lng });
        }

        res.json({ message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

module.exports = { toggleStatus, getNearbyDrivers, getDriverProfile, updateLocation };
