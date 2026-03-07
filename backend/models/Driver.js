const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    vehicleType: {
        type: String,
        enum: ['BIKE', 'AUTO', 'CAR', 'SUV'],
        default: 'CAR',
    },
    vehicleNumber: {
        type: String,
        required: true,
        trim: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        trim: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },
    totalEarnings: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
