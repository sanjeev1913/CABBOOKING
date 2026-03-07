import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useRide } from '../context/RideContext';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { estimateFare, requestRide, getCurrentRide } from '../services/rideService';
import { getNearbyDrivers } from '../services/driverService';
import { MapPin, Navigation, IndianRupee, Car, Bike, Truck, Clock, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';

const VEHICLE_ICONS = { BIKE: Bike, AUTO: Car, CAR: Car, SUV: Truck };
const VEHICLE_COLORS = { BIKE: 'text-yellow-400', AUTO: 'text-green-400', CAR: 'text-blue-400', SUV: 'text-purple-400' };

const DEFAULT_CENTER = [28.6139, 77.2090]; // New Delhi

const RiderDashboard = () => {
    const { user } = useAuth();
    const { on, off } = useSocket();
    const { currentRide, updateRide, updateStatus, clearRide } = useRide();
    const navigate = useNavigate();

    const [pickupMode, setPickupMode] = useState('pickup'); // 'pickup' | 'drop'
    const [pickup, setPickup] = useState(null);
    const [drop, setDrop] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState('CAR');
    const [estimates, setEstimates] = useState(null);
    const [distance, setDistance] = useState(null);
    const [estimating, setEstimating] = useState(false);
    const [booking, setBooking] = useState(false);
    const [nearbyDrivers, setNearbyDrivers] = useState([]);
    const [rideStatus, setRideStatus] = useState(null);
    const [acceptedDriver, setAcceptedDriver] = useState(null);
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

    // Load current ride on mount
    useEffect(() => {
        const loadCurrentRide = async () => {
            try {
                const res = await getCurrentRide();
                if (res.data.ride) {
                    updateRide(res.data.ride);
                    setRideStatus(res.data.ride.status);
                    setPickup(res.data.ride.pickupLocation);
                    setDrop(res.data.ride.dropLocation);
                }
            } catch (err) {
                console.error('Error loading current ride:', err);
            }
        };
        loadCurrentRide();

        // Try to get user location
        navigator.geolocation?.getCurrentPosition((pos) => {
            setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        });
    }, []);

    // Socket events
    useEffect(() => {
        const handleAccepted = (data) => {
            toast.success(`Driver ${data.driver?.name} accepted your ride!`);
            setRideStatus('accepted');
            setAcceptedDriver(data.driver);
            updateRide(data.ride);
        };
        const handleStatusUpdate = (data) => {
            setRideStatus(data.status);
            updateStatus(data.status);
            const msgs = {
                in_progress: '🚗 Your ride has started!',
                completed: '✅ Ride completed! Have a great day!',
                cancelled: '❌ Ride was cancelled',
            };
            if (msgs[data.status]) {
                toast[data.status === 'completed' ? 'success' : 'error'](msgs[data.status]);
            }
        };

        const unsubAccepted = on('ride:accepted', handleAccepted);
        const unsubStatus = on('ride:status_update', handleStatusUpdate);
        return () => {
            if (typeof unsubAccepted === 'function') unsubAccepted();
            if (typeof unsubStatus === 'function') unsubStatus();
        };
    }, [on, updateRide, updateStatus]);

    // Get fare estimate when both locations set
    useEffect(() => {
        if (!pickup || !drop) return;
        const fetchEstimate = async () => {
            setEstimating(true);
            try {
                const res = await estimateFare({ pickupLocation: pickup, dropLocation: drop });
                setEstimates(res.data.estimates);
                setDistance(res.data.distance);
            } catch (err) {
                toast.error('Could not get fare estimate');
            } finally {
                setEstimating(false);
            }
        };
        fetchEstimate();
        // Fetch nearby drivers
        getNearbyDrivers(pickup.lat, pickup.lng).then(res => setNearbyDrivers(res.data.drivers || [])).catch(() => { });
    }, [pickup, drop]);

    const handleMapClick = useCallback((latlng) => {
        const loc = {
            lat: latlng.lat,
            lng: latlng.lng,
            address: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
        };
        if (pickupMode === 'pickup') {
            setPickup(loc);
            setPickupMode('drop');
        } else {
            setDrop(loc);
        }
    }, [pickupMode]);

    const handleBookRide = async () => {
        if (!pickup || !drop) { toast.error('Please set pickup and drop locations'); return; }
        setBooking(true);
        try {
            const res = await requestRide({
                pickupLocation: pickup,
                dropLocation: drop,
                vehicleType: selectedVehicle,
            });
            updateRide(res.data.ride);
            setRideStatus('requested');
            toast.success('Ride requested! Looking for drivers...');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book ride');
        } finally {
            setBooking(false);
        }
    };

    const resetBooking = () => {
        setPickup(null);
        setDrop(null);
        setEstimates(null);
        setDistance(null);
        setRideStatus(null);
        setAcceptedDriver(null);
        clearRide();
    };

    const isActiveRide = rideStatus && rideStatus !== 'completed' && rideStatus !== 'cancelled';

    return (
        <div className="min-h-screen bg-dark-950">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Book a Ride</h1>
                        <p className="text-dark-400 text-sm">Hi {user?.name}, where are you going?</p>
                    </div>
                    <div className="flex items-center gap-2 bg-dark-800 rounded-xl px-3 py-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-dark-300">{nearbyDrivers.length} drivers nearby</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Left panel */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Active ride status */}
                        {isActiveRide && (
                            <div className="card border-primary-500/40 animate-fade-in">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-white">Active Ride</h3>
                                    <StatusBadge status={rideStatus} />
                                </div>

                                {rideStatus === 'requested' && (
                                    <div className="flex items-center gap-3 py-3">
                                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full spinner flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-white">Finding your driver</p>
                                            <p className="text-xs text-dark-400">Notifying nearby drivers...</p>
                                        </div>
                                    </div>
                                )}

                                {(rideStatus === 'accepted' || rideStatus === 'driver_arriving') && acceptedDriver && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl">
                                            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                                <Car className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{acceptedDriver.name}</p>
                                                <p className="text-xs text-dark-400">{acceptedDriver.vehicle} • {acceptedDriver.vehicleNumber}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-primary-400 font-medium">🚗 Driver is on the way!</p>
                                    </div>
                                )}

                                {rideStatus === 'in_progress' && (
                                    <div className="flex items-center gap-2 text-primary-400">
                                        <Navigation className="w-5 h-5" />
                                        <span className="text-sm font-medium">Ride in progress...</span>
                                    </div>
                                )}

                                <button
                                    onClick={resetBooking}
                                    className="mt-3 text-xs text-dark-400 hover:text-red-400 flex items-center gap-1"
                                >
                                    <X className="w-3.5 h-3.5" /> Cancel view
                                </button>
                            </div>
                        )}

                        {!isActiveRide && (
                            <>
                                {/* Location picker */}
                                <div className="card">
                                    <h3 className="font-semibold text-white mb-3">Set Locations</h3>

                                    {/* Mode toggle */}
                                    <div className="flex gap-2 mb-4">
                                        <button onClick={() => setPickupMode('pickup')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${pickupMode === 'pickup' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-dark-800 text-dark-400'
                                                }`}>
                                            <MapPin className="w-3.5 h-3.5" /> Set Pickup
                                        </button>
                                        <button onClick={() => setPickupMode('drop')}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${pickupMode === 'drop' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-dark-800 text-dark-400'
                                                }`}>
                                            <Navigation className="w-3.5 h-3.5" /> Set Drop
                                        </button>
                                    </div>

                                    <p className="text-xs text-dark-400 mb-3">
                                        Click on the map to set {pickupMode === 'pickup' ? 'pickup' : 'drop'} location
                                    </p>

                                    <div className="space-y-2">
                                        <div className={`flex items-center gap-2 p-2.5 rounded-lg ${pickup ? 'bg-green-500/10 border border-green-500/30' : 'bg-dark-800'}`}>
                                            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-dark-400">Pickup</p>
                                                <p className="text-sm text-white truncate">{pickup?.address || 'Not set'}</p>
                                            </div>
                                            {pickup && <button onClick={() => setPickup(null)} className="text-dark-500 hover:text-white ml-auto flex-shrink-0"><X className="w-3.5 h-3.5" /></button>}
                                        </div>
                                        <div className={`flex items-center gap-2 p-2.5 rounded-lg ${drop ? 'bg-red-500/10 border border-red-500/30' : 'bg-dark-800'}`}>
                                            <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-dark-400">Drop</p>
                                                <p className="text-sm text-white truncate">{drop?.address || 'Not set'}</p>
                                            </div>
                                            {drop && <button onClick={() => setDrop(null)} className="text-dark-500 hover:text-white ml-auto flex-shrink-0"><X className="w-3.5 h-3.5" /></button>}
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle selector & fare estimate */}
                                {pickup && drop && (
                                    <div className="card animate-slide-up">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-white">Choose Vehicle</h3>
                                            {distance && (
                                                <span className="text-xs text-dark-400 flex items-center gap-1">
                                                    <Navigation className="w-3 h-3" /> {distance} km
                                                </span>
                                            )}
                                        </div>

                                        {estimating ? (
                                            <div className="flex justify-center py-4"><LoadingSpinner size="sm" text="Calculating fares..." /></div>
                                        ) : estimates ? (
                                            <div className="space-y-2 mb-4">
                                                {Object.entries(estimates).map(([type, fare]) => {
                                                    const Icon = VEHICLE_ICONS[type] || Car;
                                                    const colorCls = VEHICLE_COLORS[type] || 'text-blue-400';
                                                    return (
                                                        <button key={type} onClick={() => setSelectedVehicle(type)}
                                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedVehicle === type
                                                                    ? 'bg-primary-500/20 border border-primary-500/50'
                                                                    : 'bg-dark-800 hover:bg-dark-700 border border-transparent'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Icon className={`w-5 h-5 ${colorCls}`} />
                                                                <span className="text-sm font-medium text-white">{type}</span>
                                                            </div>
                                                            <span className="text-sm font-bold text-green-400">₹{fare}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : null}

                                        <button onClick={handleBookRide} disabled={booking || !pickup || !drop}
                                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                                            {booking ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                                            ) : (
                                                <>
                                                    <Car className="w-4 h-4" />
                                                    Book {selectedVehicle} {estimates ? `• ₹${estimates[selectedVehicle]}` : ''}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Nearby drivers */}
                        {nearbyDrivers.length > 0 && (
                            <div className="card">
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary-400" /> Nearby Drivers
                                </h3>
                                <div className="space-y-2">
                                    {nearbyDrivers.slice(0, 3).map((driver) => (
                                        <div key={driver._id} className="flex items-center gap-3 p-2.5 bg-dark-800 rounded-xl">
                                            <div className="w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center">
                                                <Car className="w-4 h-4 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium">{driver.userId?.name || 'Driver'}</p>
                                                <p className="text-xs text-dark-400">{driver.vehicleType} • {driver.vehicleNumber}</p>
                                            </div>
                                            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-3">
                        <MapView
                            center={mapCenter}
                            zoom={13}
                            pickup={pickup}
                            drop={drop}
                            onMapClick={!isActiveRide ? handleMapClick : undefined}
                            height="600px"
                        />
                        {!isActiveRide && (
                            <p className="text-xs text-center text-dark-500 mt-2">
                                Tap on the map to set {pickupMode === 'pickup' ? '📍 pickup' : '🏁 drop'} location
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
