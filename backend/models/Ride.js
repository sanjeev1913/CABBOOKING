const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null,
    },
    pickupLocation: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    dropLocation: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    distance: {
        type: Number, // in km
        default: 0,
    },
    fare: {
        type: Number, // in INR
        default: 0,
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'driver_arriving', 'in_progress', 'completed', 'cancelled'],
        default: 'requested',
    },
    vehicleType: {
        type: String,
        enum: ['BIKE', 'AUTO', 'CAR', 'SUV'],
        default: 'CAR',
    },
    completedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
