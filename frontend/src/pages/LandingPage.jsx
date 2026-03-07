import { Link } from 'react-router-dom';
import { Car, Shield, Zap, Clock, Star, ArrowRight, MapPin, Users } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-dark-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background gradient blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                    <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-1.5 mb-6">
                        <Zap className="w-3.5 h-3.5 text-primary-400" />
                        <span className="text-sm text-primary-400 font-medium">Fast. Safe. Reliable.</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        Your Ride,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                            Your Way
                        </span>
                    </h1>
                    <p className="text-xl text-dark-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Book a cab in seconds. Track in real-time. Arrive safely.
                        Chalte Chalo connects riders with trusted drivers near you.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register?role=RIDER" className="btn-primary text-lg flex items-center justify-center gap-2 group">
                            Book a Ride
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/register?role=DRIVER" className="btn-secondary text-lg flex items-center justify-center gap-2">
                            <Car className="w-5 h-5" />
                            Drive with Us
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                        {[
                            { label: 'Rides Completed', value: '10K+' },
                            { label: 'Active Drivers', value: '500+' },
                            { label: 'Cities', value: '25+' },
                        ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                                <p className="text-2xl font-bold text-white">{value}</p>
                                <p className="text-sm text-dark-400 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-3">How Chalte Chalo Works</h2>
                    <p className="text-dark-400">Simple steps to get you moving</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { step: '01', icon: MapPin, title: 'Set Your Location', desc: 'Enter your pickup point and destination on the map' },
                        { step: '02', icon: Car, title: 'Match with Driver', desc: 'Nearby drivers get notified in real-time' },
                        { step: '03', icon: Star, title: 'Enjoy Your Ride', desc: 'Track your trip live and pay seamlessly' },
                    ].map(({ step, icon: Icon, title, desc }) => (
                        <div key={step} className="card group hover:border-primary-500/50 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl font-black text-primary-500/20 group-hover:text-primary-500/40 transition-colors">{step}</div>
                                <div>
                                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center mb-3">
                                        <Icon className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                                    <p className="text-dark-400 text-sm">{desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Rider card */}
                    <div className="card bg-gradient-to-br from-dark-900 to-dark-950 border-primary-500/20 hover:border-primary-500/40 transition-all">
                        <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-primary-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">For Riders</h3>
                        <ul className="space-y-2 mb-6 text-dark-300">
                            {['Real-time ride tracking', 'Fare estimate before booking', 'Multiple vehicle types', 'Ride history & receipts', 'Safe & verified drivers'].map(feat => (
                                <li key={feat} className="flex items-center gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <Link to="/register?role=RIDER" className="btn-primary inline-flex items-center gap-2">
                            Ride Now <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Driver card */}
                    <div className="card bg-gradient-to-br from-dark-900 to-dark-950 border-blue-500/20 hover:border-blue-500/40 transition-all">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                            <Car className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">For Drivers</h3>
                        <ul className="space-y-2 mb-6 text-dark-300">
                            {['Flexible working hours', 'Real-time ride requests', 'Track your earnings', 'Go online / offline anytime', 'Navigation assistance'].map(feat => (
                                <li key={feat} className="flex items-center gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <Link to="/register?role=DRIVER" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors inline-flex items-center gap-2">
                            Start Driving <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features strip */}
            <section className="border-y border-dark-700 py-8">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { icon: Shield, text: 'Safe & Verified' },
                        { icon: Zap, text: 'Instant Booking' },
                        { icon: Clock, text: '24/7 Available' },
                        { icon: Star, text: 'Top Rated' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                                <Icon className="w-5 h-5 text-primary-400" />
                            </div>
                            <p className="text-sm font-medium text-dark-300">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
                <p className="text-dark-400 mb-8">Join thousands of riders and drivers on Chalte Chalo</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register" className="btn-primary text-lg">Create Free Account</Link>
                    <Link to="/login" className="btn-outline text-lg">Sign In</Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-dark-700 py-6 text-center text-dark-500 text-sm">
                <p>© 2024 Chalte Chalo. Built with ❤️ using MERN Stack.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
