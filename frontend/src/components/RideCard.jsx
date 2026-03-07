import { MapPin, Navigation, Clock, IndianRupee, User, Phone } from 'lucide-react';
import StatusBadge from './StatusBadge';

const RideCard = ({ ride, onAccept, onStart, onComplete, isDriver = false }) => {
    const formatTime = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const riderName = ride.riderId?.name || 'Rider';
    const riderPhone = ride.riderId?.phone || '—';

    return (
        <div className="card animate-slide-up hover:border-dark-600 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{riderName}</p>
                        {riderPhone !== '—' && (
                            <p className="text-xs text-dark-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {riderPhone}
                            </p>
                        )}
                    </div>
                </div>
                <StatusBadge status={ride.status} />
            </div>

            {/* Route */}
            <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-dark-400">Pickup</p>
                        <p className="text-sm text-white">{ride.pickupLocation?.address}</p>
                    </div>
                </div>
                <div className="ml-1 w-px h-4 bg-dark-600" />
                <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-dark-400">Drop</p>
                        <p className="text-sm text-white">{ride.dropLocation?.address}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 py-3 border-y border-dark-700 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-dark-300">
                    <Navigation className="w-3.5 h-3.5 text-primary-400" />
                    <span>{ride.distance?.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-dark-300">
                    <IndianRupee className="w-3.5 h-3.5 text-green-400" />
                    <span className="font-semibold text-green-400">₹{ride.fare}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-dark-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(ride.createdAt)}</span>
                </div>
            </div>

            {/* Action buttons */}
            {isDriver && (
                <div className="flex gap-2">
                    {ride.status === 'requested' && onAccept && (
                        <button
                            onClick={() => onAccept(ride._id)}
                            className="flex-1 btn-primary py-2 text-sm"
                        >
                            Accept Ride
                        </button>
                    )}
                    {ride.status === 'accepted' && onStart && (
                        <button
                            onClick={() => onStart(ride._id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
                        >
                            Start Ride
                        </button>
                    )}
                    {ride.status === 'in_progress' && onComplete && (
                        <button
                            onClick={() => onComplete(ride._id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
                        >
                            Complete Ride
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RideCard;
