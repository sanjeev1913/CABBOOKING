import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useRide } from '../context/RideContext';
import { getDriverProfile, toggleDriverStatus, updateLocation } from '../services/driverService';
import { acceptRide, startRide, completeRide, getCurrentRide } from '../services/rideService';
import RideCard from '../components/RideCard';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { Power, MapPin, Navigation, IndianRupee, Clock, Wifi, WifiOff } from 'lucide-react';

const DriverDashboard = () => {
    const { user } = useAuth();
    const { on, joinDriverRoom, connected } = useSocket();
    const { currentRide, updateRide, clearRide } = useRide();

    const [driverProfile, setDriverProfile] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [rideRequests, setRideRequests] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [myLocation, setMyLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    // Load driver profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await getDriverProfile();
                setDriverProfile(data.driver);
                setIsOnline(data.driver.isOnline);
                if (data.driver.currentLocation?.coordinates) {
                    const [lng, lat] = data.driver.currentLocation.coordinates;
                    setMyLocation({ lat, lng });
                }
            } catch (err) {
                toast.error('Failed to load driver profile');
            }
        };

        const loadCurrentRide = async () => {
            try {
                const { data } = await getCurrentRide();
                if (data.ride) {
                    setActiveRide(data.ride);
                    updateRide(data.ride);
                }
            } catch (err) {
                console.error('Failed to load current ride:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
        loadCurrentRide();
    }, [updateRide]);

    // Get browser geolocation
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => console.warn('Geolocation denied')
        );
    }, []);

    // Join driver socket room
    useEffect(() => {
        if (driverProfile?._id && connected) {
            joinDriverRoom(driverProfile._id);
        }
    }, [driverProfile, connected, joinDriverRoom]);

    // Listen for ride requests via socket
    useEffect(() => {
        if (!connected) return;
        const cleanup = on('ride:new_request', (data) => {
            toast('🚗 New ride request!', { icon: '📍', duration: 5000 });
            setRideRequests((prev) => {
                const exists = prev.find((r) => r._id === data.ride._id);
                return exists ? prev : [data.ride, ...prev];
            });
        });
        return cleanup;
    }, [connected, on]);

    // Toggle online/offline
    const handleToggle = async () => {
        setToggling(true);
        try {
            const newStatus = !isOnline;
            await toggleDriverStatus(newStatus, myLocation);
            setIsOnline(newStatus);
            toast.success(newStatus ? 'You are now online!' : 'You are now offline');
        } catch (err) {
            toast.error('Failed to toggle status');
        } finally {
            setToggling(false);
        }
    };

    // Accept ride
    const handleAccept = async (rideId) => {
        try {
            const { data } = await acceptRide(rideId);
            setActiveRide(data.ride);
            updateRide(data.ride);
            setRideRequests((prev) => prev.filter((r) => r._id !== rideId));
            toast.success('Ride accepted!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept ride');
        }
    };

    // Start ride
    const handleStart = async (rideId) => {
        try {
            const { data } = await startRide(rideId);
            setActiveRide(data.ride);
            updateRide(data.ride);
            toast.success('Ride started!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start ride');
        }
    };

    // Complete ride
    const handleComplete = async (rideId) => {
        try {
            const { data } = await completeRide(rideId);
            toast.success(`Ride completed! Earned ₹${data.ride.fare}`);
            setActiveRide(null);
            clearRide();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete ride');
        }
    };

    // Update location periodically
    useEffect(() => {
        if (!isOnline || !navigator.geolocation) return;
        const interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setMyLocation(loc);
                    try {
                        await updateLocation(loc.lat, loc.lng);
                    } catch (e) { /* silent */ }
                },
                () => { }
            );
        }, 15000);
        return () => clearInterval(interval);
    }, [isOnline]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-dark-950">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Driver Dashboard</h1>
                        <p className="text-dark-400 text-sm mt-1">
                            Hello, {user?.name} 👋 {driverProfile?.vehicleType && `• ${driverProfile.vehicleType}`}
                        </p>
                    </div>

                    {/* Status Toggle */}
                    <button
                        onClick={handleToggle}
                        disabled={toggling}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 active:scale-95 ${isOnline
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                : 'bg-dark-800 text-dark-400 border border-dark-600 hover:bg-dark-700'
                            }`}
                    >
                        <div className={`relative ${isOnline ? 'animate-pulse' : ''}`}>
                            <Power className="w-5 h-5" />
                        </div>
                        <span>{toggling ? 'Switching...' : isOnline ? 'Online' : 'Offline'}</span>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-dark-500'}`} />
                    </button>
                </div>

                {/* Connection indicator */}
                <div className="flex items-center gap-2 text-xs text-dark-400">
                    {connected ? (
                        <><Wifi className="w-3.5 h-3.5 text-green-400" /> <span className="text-green-400">Connected</span></>
                    ) : (
                        <><WifiOff className="w-3.5 h-3.5 text-red-400" /> <span className="text-red-400">Disconnected</span></>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map */}
                    <div className="card p-0 overflow-hidden">
                        <MapView
                            center={myLocation ? [myLocation.lat, myLocation.lng] : [28.6139, 77.209]}
                            zoom={14}
                            pickup={activeRide?.pickupLocation}
                            drop={activeRide?.dropLocation}
                            driverLocation={myLocation}
                            height="400px"
                        />
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-4">
                        {/* Active Ride */}
                        {activeRide && (
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Navigation className="w-4 h-4 text-primary-400" />
                                    Active Ride
                                </h2>
                                <RideCard
                                    ride={activeRide}
                                    isDriver={true}
                                    onStart={handleStart}
                                    onComplete={handleComplete}
                                />
                            </div>
                        )}

                        {/* Incoming Requests */}
                        {!activeRide && isOnline && (
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-400" />
                                    Incoming Requests
                                    {rideRequests.length > 0 && (
                                        <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            {rideRequests.length}
                                        </span>
                                    )}
                                </h2>
                                {rideRequests.length === 0 ? (
                                    <div className="card text-center py-12">
                                        <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Clock className="w-8 h-8 text-dark-500" />
                                        </div>
                                        <p className="text-dark-400 text-sm">Waiting for ride requests...</p>
                                        <p className="text-dark-500 text-xs mt-1">New requests will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {rideRequests.map((ride) => (
                                            <RideCard
                                                key={ride._id}
                                                ride={ride}
                                                isDriver={true}
                                                onAccept={handleAccept}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Offline message */}
                        {!isOnline && !activeRide && (
                            <div className="card text-center py-12">
                                <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Power className="w-8 h-8 text-dark-500" />
                                </div>
                                <p className="text-dark-300 font-medium">You are offline</p>
                                <p className="text-dark-500 text-sm mt-1">Go online to start receiving ride requests</p>
                            </div>
                        )}

                        {/* Driver Stats Card */}
                        {driverProfile && (
                            <div className="card">
                                <h3 className="text-sm font-semibold text-dark-300 mb-3">Your Vehicle</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-dark-500">Type</p>
                                        <p className="text-sm font-medium text-white">{driverProfile.vehicleType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dark-500">Number</p>
                                        <p className="text-sm font-medium text-white">{driverProfile.vehicleNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dark-500">License</p>
                                        <p className="text-sm font-medium text-white">{driverProfile.licenseNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dark-500">Earnings</p>
                                        <p className="text-sm font-semibold text-green-400">₹{driverProfile.totalEarnings || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
