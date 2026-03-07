import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Menu, X, LogOut, User, History, Home } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { isAuthenticated, user, logout, isRider, isDriver } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = isRider
        ? [
            { to: '/rider/dashboard', label: 'Dashboard', icon: Home },
            { to: '/rider/history', label: 'History', icon: History },
        ]
        : isDriver
            ? [
                { to: '/driver/dashboard', label: 'Dashboard', icon: Home },
                { to: '/rider/history', label: 'Trips', icon: History },
            ]
            : [];

    return (
        <nav className="sticky top-0 z-50 bg-dark-950/90 backdrop-blur-md border-b border-dark-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center group-hover:bg-primary-400 transition-colors">
                            <Car className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">Chalte Chalo</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname === to
                                    ? 'text-primary-400'
                                    : 'text-dark-300 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 bg-dark-800 rounded-xl px-3 py-1.5">
                                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-white">{user?.name}</p>
                                        <p className="text-xs text-dark-400">{user?.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-sm text-dark-300 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:block">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Log in</Link>
                                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Sign up</Link>
                            </div>
                        )}
                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 text-dark-300 hover:text-white"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden py-3 border-t border-dark-700 animate-fade-in">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className="flex items-center gap-2 px-2 py-2.5 text-dark-300 hover:text-white text-sm"
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
