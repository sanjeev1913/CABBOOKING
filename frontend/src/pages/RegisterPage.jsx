import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerService } from '../services/authService';
import { Car, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [role, setRole] = useState('RIDER');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '',
        vehicleType: 'CAR', vehicleNumber: '', licenseNumber: '',
    });

    useEffect(() => {
        const urlRole = searchParams.get('role');
        if (urlRole === 'DRIVER') setRole('DRIVER');
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.email) errs.email = 'Email is required';
        if (!formData.password || formData.password.length < 6) errs.password = 'Password must be 6+ characters';
        if (role === 'DRIVER') {
            if (!formData.vehicleNumber) errs.vehicleNumber = 'Vehicle number is required';
            if (!formData.licenseNumber) errs.licenseNumber = 'License number is required';
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            const payload = { ...formData, role };
            if (role !== 'DRIVER') {
                delete payload.vehicleType;
                delete payload.vehicleNumber;
                delete payload.licenseNumber;
            }
            const res = await registerService(payload);
            login(res.data.user, res.data.token);
            toast.success(`Welcome to Chalte Chalo, ${res.data.user.name}!`);
            navigate(role === 'DRIVER' ? '/driver/dashboard' : '/rider/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-dark-900 via-dark-950 to-black items-center justify-center relative overflow-hidden">
                <div className="absolute top-20 right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="relative text-center px-12">
                    <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                        <Car className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Join Chalte Chalo</h2>
                    <p className="text-dark-400 text-lg">Start your journey today</p>
                </div>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-md">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
                        <p className="text-dark-400">Already have one?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex bg-dark-800 rounded-xl p-1 mb-6 border border-dark-700">
                        {['RIDER', 'DRIVER'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === r ? 'bg-primary-500 text-white shadow' : 'text-dark-400 hover:text-white'
                                    }`}
                            >
                                {r === 'RIDER' ? <User className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                                {r}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Full Name</label>
                                <input name="name" value={formData.name} onChange={handleChange}
                                    className={`input-field ${errors.name ? 'border-red-500' : ''}`} placeholder="John Doe" />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="label">Phone</label>
                                <input name="phone" value={formData.phone} onChange={handleChange}
                                    className="input-field" placeholder="+91 98XXXXXX01" type="tel" />
                            </div>
                        </div>

                        <div>
                            <label className="label">Email Address</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange}
                                className={`input-field ${errors.email ? 'border-red-500' : ''}`} placeholder="you@example.com" />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                                    onChange={handleChange} className={`input-field pr-12 ${errors.password ? 'border-red-500' : ''}`}
                                    placeholder="Min. 6 characters" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Driver-only fields */}
                        {role === 'DRIVER' && (
                            <div className="space-y-4 p-4 bg-dark-800 rounded-xl border border-dark-700 animate-fade-in">
                                <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">Vehicle Details</p>
                                <div>
                                    <label className="label">Vehicle Type</label>
                                    <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}
                                        className="input-field">
                                        {['BIKE', 'AUTO', 'CAR', 'SUV'].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Vehicle Number</label>
                                        <input name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange}
                                            className={`input-field ${errors.vehicleNumber ? 'border-red-500' : ''}`}
                                            placeholder="DL-01-XY-1234" />
                                        {errors.vehicleNumber && <p className="text-red-400 text-xs mt-1">{errors.vehicleNumber}</p>}
                                    </div>
                                    <div>
                                        <label className="label">License Number</label>
                                        <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange}
                                            className={`input-field ${errors.licenseNumber ? 'border-red-500' : ''}`}
                                            placeholder="DL-XXXXXX" />
                                        {errors.licenseNumber && <p className="text-red-400 text-xs mt-1">{errors.licenseNumber}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
