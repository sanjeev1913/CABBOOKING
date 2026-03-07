import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';
import { Car, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!formData.email) errs.email = 'Email is required';
        if (!formData.password) errs.password = 'Password is required';
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            const res = await loginService(formData);
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate(res.data.user.role === 'DRIVER' ? '/driver/dashboard' : '/rider/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-dark-900 via-dark-950 to-black items-center justify-center relative overflow-hidden">
                <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="relative text-center px-12">
                    <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                        <Car className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Welcome to Chalte Chalo</h2>
                    <p className="text-dark-400 text-lg">Your reliable ride-sharing platform</p>
                </div>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
                            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                                <Car className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Chalte Chalo</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
                        <p className="text-dark-400">Don't have an account?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Sign up</Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`input-field pr-12 ${errors.password ? 'border-red-500' : ''}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    {/* Demo accounts hint */}
                    <div className="mt-6 p-4 bg-dark-800 rounded-xl border border-dark-700">
                        <p className="text-xs font-medium text-dark-400 mb-2">Quick demo:</p>
                        <p className="text-xs text-dark-500">Register as Rider or Driver to explore all features</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
