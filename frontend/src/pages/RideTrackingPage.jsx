import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useRide } from '../context/RideContext';
import { getCurrentRide } from '../services/rideService';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Car, Phone, MapPin, Navigation, IndianRupee, Clock, CheckCircle, ArrowLeft } from 'lucide-react';

const statusSteps = [
    { key: 'requested', label: 'Requested', icon: MapPin },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle },
    { key: 'in_progress', label: 'In Progress', icon: Navigation },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
];

const RideTrackingPage = () => {
    const { user } = useAuth();
    const { on, connected } = useSocket();
    const { currentRide, updateRide, updateStatus, driverLocation, updateDriverLocation, clearRide } = useRide();
    const navigate = useNavigate();

    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load current ride
    useEffect(() => {
        const loadRide = async () => {
            try {
                const { data } = await getCurrentRide();
                if (data.ride) {
                    setRide(data.ride);
                    updateRide(data.ride);
                } else {
                    toast('No active ride found', { icon: 'ℹ️' });
                    navigate(user?.role === 'RIDER' ? '/rider/dashboard' : '/driver/dashboard');
                }
            } catch (err) {
                toast.error('Failed to load ride');
            } finally {
                setLoading(false);
            }
        };
        loadRide();
    }, [navigate, user, updateRide]);

    // Listen for status updates
    useEffect(() => {
        if (!connected) return;

        const cleanupStatus = on('ride:status_update', (data) => {
            setRide((prev) => (prev ? { ...prev, status: data.status } : prev));
            updateStatus(data.status);
            if (data.status === 'completed') {
                toast.success(`Ride completed! Fare: ₹${data.fare || ride?.fare}`);
            } else {
                toast.success(`Ride status: ${data.status.replace('_', ' ')}`);
            }
        });

        const cleanupAccepted = on('ride:accepted', (data) => {
            setRide(data.ride);
            updateRide(data.ride);
            toast.success('A driver has accepted your ride!');
        });

        const cleanupDriverLoc = on('driver:location_update', (data) => {
            updateDriverLocation(data.lat, data.lng);
        });

        return () => {
            cleanupStatus?.();
            cleanupAccepted?.();
            cleanupDriverLoc?.();
        };
    }, [connected, on, updateStatus, updateRide, updateDriverLocation, ride?.fare]);

    const currentStatus = ride?.status || currentRide?.status;
    const currentStepIdx = statusSteps.findIndex((s) => s.key === currentStatus);

    if (loading) return <LoadingSpinner />;
    if (!ride) return null;

    const driverInfo = ride.driverId;
    const driverName = driverInfo?.userId?.name || 'Assigned Driver';
    const driverPhone = driverInfo?.userId?.phone || '—';

    return (
        <div className="min-h-screen bg-dark-950">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Ride Tracking</h1>
                        <p className="text-dark-400 text-sm">Live status updates</p>
                    </div>
                </div>

                {/* Map */}
                <div className="card p-0 overflow-hidden">
                    <MapView
                        center={
                            ride.pickupLocation
                                ? [ride.pickupLocation.lat, ride.pickupLocation.lng]
                                : [28.6139, 77.209]
                        }
                        zoom={13}
                        pickup={ride.pickupLocation}
                        drop={ride.dropLocation}
                        driverLocation={driverLocation}
                        height="350px"
                    />
                </div>

                {/* Status Timeline */}
                <div className="card">
                    <h2 className="text-sm font-semibold text-dark-300 mb-4">Ride Status</h2>
                    <div className="flex items-center justify-between">
                        {statusSteps.map((step, idx) => {
                            const StepIcon = step.icon;
                            const isActive = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            return (
                                <div key={step.key} className="flex flex-col items-center flex-1 relative">
                                    {idx > 0 && (
                                        <div
                                            className={`absolute top-4 -left-1/2 w-full h-0.5 ${idx <= currentStepIdx ? 'bg-primary-500' : 'bg-dark-700'
                                                }`}
                                        />
                                    )}
                                    <div
                                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCurrent
                                            ? 'bg-primary-500 shadow-lg shadow-primary-500/40 scale-110'
                                            : isActive
                                                ? 'bg-primary-500/30'
                                                : 'bg-dark-700'
                                            }`}
                                    >
                                        <StepIcon
                                            className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-dark-500'
                                                }`}
                                        />
                                    </div>
                                    <p
                                        className={`text-xs mt-2 font-medium text-center ${isCurrent ? 'text-primary-400' : isActive ? 'text-dark-300' : 'text-dark-500'
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ride Details */}
                    <div className="card">
                        <h3 className="text-sm font-semibold text-dark-300 mb-4">Ride Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-dark-500">Pickup</p>
                                    <p className="text-sm text-white">{ride.pickupLocation?.address || `${ride.pickupLocation?.lat?.toFixed(4)}, ${ride.pickupLocation?.lng?.toFixed(4)}`}</p>
                                </div>
                            </div>
                            <div className="ml-1 w-px h-3 bg-dark-600" />
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-dark-500">Drop</p>
                                    <p className="text-sm text-white">{ride.dropLocation?.address || `${ride.dropLocation?.lat?.toFixed(4)}, ${ride.dropLocation?.lng?.toFixed(4)}`}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-dark-700">
                            <div className="flex items-center gap-1.5 text-sm">
                                <Navigation className="w-3.5 h-3.5 text-primary-400" />
                                <span className="text-dark-300">{ride.distance?.toFixed(1)} km</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                                <IndianRupee className="w-3.5 h-3.5 text-green-400" />
                                <span className="font-semibold text-green-400">₹{ride.fare}</span>
                            </div>
                        </div>
                    </div>

                    {/* Driver Info */}
                    {driverInfo && (
                        <div className="card">
                            <h3 className="text-sm font-semibold text-dark-300 mb-4">Driver Info</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                                    <Car className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{driverName}</p>
                                    <p className="text-dark-400 text-sm flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {driverPhone}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-dark-800 rounded-xl px-3 py-2">
                                    <p className="text-xs text-dark-500">Vehicle</p>
                                    <p className="text-sm font-medium text-white">{driverInfo.vehicleType}</p>
                                </div>
                                <div className="bg-dark-800 rounded-xl px-3 py-2">
                                    <p className="text-xs text-dark-500">Number</p>
                                    <p className="text-sm font-medium text-white">{driverInfo.vehicleNumber}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Completed state action */}
                {currentStatus === 'completed' && (
                    <div className="card text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <h2 className="text-xl font-bold text-white mb-1">Ride Completed!</h2>
                        <p className="text-dark-400 text-sm mb-4">Thank you for riding with Chalte Chalo</p>
                        <p className="text-2xl font-bold text-green-400 mb-6">₹{ride.fare}</p>
                        <button
                            onClick={() => {
                                clearRide();
                                navigate(user?.role === 'RIDER' ? '/rider/dashboard' : '/driver/dashboard');
                            }}
                            className="btn-primary"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideTrackingPage;
