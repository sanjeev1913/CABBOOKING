import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRideHistory } from '../services/rideService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { History, Navigation, IndianRupee, Calendar, ChevronLeft, ChevronRight, Car } from 'lucide-react';

const RideHistoryPage = () => {
    const { user } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const { data } = await getRideHistory(page);
                setRides(data.rides);
                setTotalPages(data.pages);
                setTotal(data.total);
            } catch (err) {
                toast.error('Failed to load ride history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [page]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-dark-950">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                            <History className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Ride History</h1>
                            <p className="text-dark-400 text-sm">{total} total rides</p>
                        </div>
                    </div>
                </div>

                {/* Rides list */}
                {rides.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Car className="w-10 h-10 text-dark-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-dark-300 mb-1">No rides yet</h2>
                        <p className="text-dark-500 text-sm">Your ride history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rides.map((ride) => (
                            <div
                                key={ride._id}
                                className="card hover:border-dark-600 transition-colors animate-fade-in"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* Left: Route & details */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 mb-3">
                                            <StatusBadge status={ride.status} />
                                            <span className="text-xs text-dark-500">
                                                {formatDate(ride.createdAt)} at {formatTime(ride.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                                            <p className="text-sm text-white">
                                                {ride.pickupLocation?.address || `${ride.pickupLocation?.lat?.toFixed(4)}, ${ride.pickupLocation?.lng?.toFixed(4)}`}
                                            </p>
                                        </div>
                                        <div className="ml-1 w-px h-3 bg-dark-600" />
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                            <p className="text-sm text-white">
                                                {ride.dropLocation?.address || `${ride.dropLocation?.lat?.toFixed(4)}, ${ride.dropLocation?.lng?.toFixed(4)}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Stats */}
                                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                                        <div className="flex items-center gap-1.5 text-lg font-bold text-green-400">
                                            <IndianRupee className="w-4 h-4" />
                                            ₹{ride.fare}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-dark-400">
                                            <Navigation className="w-3.5 h-3.5" />
                                            {ride.distance?.toFixed(1)} km
                                        </div>
                                        {ride.vehicleType && (
                                            <span className="text-xs bg-dark-800 text-dark-400 px-2 py-0.5 rounded-full">
                                                {ride.vehicleType}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Driver/Rider info */}
                                {user?.role === 'RIDER' && ride.driverId && (
                                    <div className="mt-3 pt-3 border-t border-dark-700 flex items-center gap-2 text-sm text-dark-400">
                                        <Car className="w-3.5 h-3.5" />
                                        <span>Driver: {ride.driverId?.userId?.name || 'Assigned'}</span>
                                        {ride.driverId?.vehicleNumber && (
                                            <span className="text-dark-500">• {ride.driverId.vehicleNumber}</span>
                                        )}
                                    </div>
                                )}
                                {user?.role === 'DRIVER' && ride.riderId && (
                                    <div className="mt-3 pt-3 border-t border-dark-700 flex items-center gap-2 text-sm text-dark-400">
                                        <span>Rider: {ride.riderId.name || 'Unknown'}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-xl bg-dark-800 text-dark-300 hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-dark-300">
                            Page <span className="text-white font-semibold">{page}</span> of{' '}
                            <span className="text-white font-semibold">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-xl bg-dark-800 text-dark-300 hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideHistoryPage;
