const Ride = require('../models/Ride');
const Driver = require('../models/Driver');

// Helper: Calculate distance between two coords (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper: Calculate fare based on distance and vehicle type
const calculateFare = (distance, vehicleType) => {
    const baseFare = { BIKE: 10, AUTO: 15, CAR: 25, SUV: 35 };
    const perKm = { BIKE: 5, AUTO: 8, CAR: 12, SUV: 16 };
    const base = baseFare[vehicleType] || 25;
    const rate = perKm[vehicleType] || 12;
    return Math.round(base + distance * rate);
};

// @route  POST /api/rides/request
const requestRide = async (req, res) => {
    try {
        const { pickupLocation, dropLocation, vehicleType } = req.body;

        const distance = calculateDistance(
            pickupLocation.lat, pickupLocation.lng,
            dropLocation.lat, dropLocation.lng
        );
        const fare = calculateFare(distance, vehicleType || 'CAR');

        const ride = await Ride.create({
            riderId: req.user._id,
            pickupLocation,
            dropLocation,
            distance: parseFloat(distance.toFixed(2)),
            fare,
            vehicleType: vehicleType || 'CAR',
            status: 'requested',
        });

        // Emit to all online drivers via socket
        const io = req.app.get('io');
        if (io) {
            const onlineDrivers = await Driver.find({ isOnline: true }).populate('userId', 'name phone');
            onlineDrivers.forEach((driver) => {
                io.to(`driver:${driver._id}`).emit('ride:new_request', {
                    ride: {
                        ...ride.toObject(),
                        riderName: req.user.name,
                        riderPhone: req.user.phone,
                    },
                });
            });
        }

        res.status(201).json({ ride, message: 'Ride requested successfully' });
    } catch (error) {
        console.error('Request ride error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  POST /api/rides/estimate
const estimateFare = async (req, res) => {
    try {
        const { pickupLocation, dropLocation } = req.body;
        const distance = calculateDistance(
            pickupLocation.lat, pickupLocation.lng,
            dropLocation.lat, dropLocation.lng
        );
        const estimates = {
            BIKE: calculateFare(distance, 'BIKE'),
            AUTO: calculateFare(distance, 'AUTO'),
            CAR: calculateFare(distance, 'CAR'),
            SUV: calculateFare(distance, 'SUV'),
        };
        res.json({ distance: parseFloat(distance.toFixed(2)), estimates });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  POST /api/rides/accept
const acceptRide = async (req, res) => {
    try {
        const { rideId } = req.body;
        const driver = await Driver.findOne({ userId: req.user._id });
        if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (ride.status !== 'requested') {
            return res.status(400).json({ message: 'Ride is no longer available' });
        }

        ride.driverId = driver._id;
        ride.status = 'accepted';
        await ride.save();

        const populatedRide = await Ride.findById(rideId)
            .populate('riderId', 'name phone email')
            .populate({ path: 'driverId', populate: { path: 'userId', select: 'name phone' } });

        // Notify rider
        const io = req.app.get('io');
        if (io) {
            io.to(`rider:${ride.riderId}`).emit('ride:accepted', {
                ride: populatedRide,
                driver: { name: req.user.name, phone: req.user.phone, vehicle: driver.vehicleType, vehicleNumber: driver.vehicleNumber },
            });
        }

        res.json({ ride: populatedRide, message: 'Ride accepted' });
    } catch (error) {
        console.error('Accept ride error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  POST /api/rides/start
const startRide = async (req, res) => {
    try {
        const { rideId } = req.body;
        const driver = await Driver.findOne({ userId: req.user._id });
        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (String(ride.driverId) !== String(driver._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        ride.status = 'in_progress';
        await ride.save();

        const io = req.app.get('io');
        if (io) {
            io.to(`rider:${ride.riderId}`).emit('ride:status_update', { rideId, status: 'in_progress' });
        }

        res.json({ ride, message: 'Ride started' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  POST /api/rides/complete
const completeRide = async (req, res) => {
    try {
        const { rideId } = req.body;
        const driver = await Driver.findOne({ userId: req.user._id });
        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (String(ride.driverId) !== String(driver._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        ride.status = 'completed';
        ride.completedAt = new Date();
        await ride.save();

        // Update driver earnings
        driver.totalEarnings += ride.fare;
        await driver.save();

        const io = req.app.get('io');
        if (io) {
            io.to(`rider:${ride.riderId}`).emit('ride:status_update', { rideId, status: 'completed', fare: ride.fare });
        }

        res.json({ ride, message: 'Ride completed' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  GET /api/rides/history
const getRideHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.user.role === 'RIDER') {
            query.riderId = req.user._id;
        } else if (req.user.role === 'DRIVER') {
            const driver = await Driver.findOne({ userId: req.user._id });
            if (driver) query.driverId = driver._id;
        }

        const rides = await Ride.find(query)
            .populate('riderId', 'name email phone')
            .populate({ path: 'driverId', populate: { path: 'userId', select: 'name phone' } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Ride.countDocuments(query);

        res.json({ rides, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route  GET /api/rides/current
const getCurrentRide = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'RIDER') {
            query.riderId = req.user._id;
            query.status = { $in: ['requested', 'accepted', 'driver_arriving', 'in_progress'] };
        } else {
            const driver = await Driver.findOne({ userId: req.user._id });
            if (driver) {
                query.driverId = driver._id;
                query.status = { $in: ['accepted', 'driver_arriving', 'in_progress'] };
            }
        }
        const ride = await Ride.findOne(query)
            .populate('riderId', 'name email phone')
            .populate({ path: 'driverId', populate: { path: 'userId', select: 'name phone' } })
            .sort({ createdAt: -1 });

        res.json({ ride });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

module.exports = { requestRide, estimateFare, acceptRide, startRide, completeRide, getRideHistory, getCurrentRide };
