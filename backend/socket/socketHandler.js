const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');

const initializeSocket = (io) => {
    // Middleware: authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`Socket connected: ${socket.id} (userId: ${socket.userId})`);

        // Rider joins their personal room
        socket.on('join:rider', (riderId) => {
            socket.join(`rider:${riderId}`);
            console.log(`Rider ${riderId} joined room rider:${riderId}`);
        });

        // Driver joins their personal room
        socket.on('join:driver', async (driverId) => {
            socket.join(`driver:${driverId}`);
            console.log(`Driver ${driverId} joined room driver:${driverId}`);
        });

        // Driver location update (real-time)
        socket.on('driver:location', async (data) => {
            const { driverId, lat, lng } = data;
            // Broadcast to all clients listening (e.g., riders tracking)
            socket.broadcast.emit('driver:location_update', { driverId, lat, lng });

            // Update driver location in DB periodically
            try {
                await Driver.findByIdAndUpdate(driverId, {
                    currentLocation: { type: 'Point', coordinates: [lng, lat] },
                });
            } catch (err) {
                console.error('Location update error:', err.message);
            }
        });

        // Ride status updates from driver
        socket.on('ride:update_status', (data) => {
            const { riderId, rideId, status } = data;
            io.to(`rider:${riderId}`).emit('ride:status_update', { rideId, status });
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};

module.exports = initializeSocket;
