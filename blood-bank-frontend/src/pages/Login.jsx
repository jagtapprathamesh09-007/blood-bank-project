import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Phone, ArrowLeft, Droplet, FileText } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [loginMethod, setLoginMethod] = useState('email');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        // Call AuthContext's login function directly with email & password!
        const userData = await login(formData.email, formData.password);

        const userRole = userData.role;
        if (userRole === 'hospital') navigate('/hospital-dashboard');
        else if (userRole === 'blood_bank') navigate('/bloodbank-dashboard');
        else if (userRole === 'donor') navigate('/donor-dashboard');
        else if (userRole === 'driver') navigate('/driver-dashboard');
        else if (userRole === 'drone_pilot') navigate('/drone-dashboard');
        else navigate('/');

    } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#6b0312] via-[#3d0208] to-[#1a0003] text-white flex flex-col justify-center items-center px-4 py-8 relative font-sans overflow-hidden">
            
            {/* Top Left Back Link */}
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-red-200/90 hover:text-white font-medium transition-colors">
                <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="max-w-md w-full space-y-4 relative z-10">
                
                {/* Header Icon & Titles */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff0055] to-[#e60033] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(255,0,85,0.6)] border border-white/20">
                        <Droplet className="text-white fill-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-wide">Welcome Back</h1>
                    <p className="text-xs text-red-200/80">Login to Blood Bank Management System</p>
                </div>

                {/* Form Glass Card */}
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-7 rounded-3xl shadow-2xl space-y-4">
                    
                    {/* Email / Phone Toggle */}
                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                        <button
                            type="button"
                            onClick={() => setLoginMethod('email')}
                            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                                loginMethod === 'email' ? 'bg-[#ff0000] text-white shadow-md' : 'text-red-200/60 hover:text-white'
                            }`}
                        >
                            <Mail size={14} /> Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMethod('phone')}
                            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                                loginMethod === 'phone' ? 'bg-[#ff0000] text-white shadow-md' : 'text-red-200/60 hover:text-white'
                            }`}
                        >
                            <Phone size={14} /> Phone
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-xl text-xs font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        
                        <div>
                            <label className="text-xs font-medium text-red-100/90 block mb-1.5">
                                {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 text-red-200/60" size={16} />
                                <input
                                    type={loginMethod === 'email' ? 'email' : 'text'}
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={loginMethod === 'email' ? 'your@email.com' : '+1234567890'}
                                    className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-red-200/40 focus:outline-none focus:border-red-400 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-red-100/90 block mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 text-red-200/60" size={16} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-red-200/40 focus:outline-none focus:border-red-400 transition-all"
                                />
                            </div>
                        </div>

                        <div className="text-right">
                            <a href="#forgot" className="text-xs text-red-200/80 hover:text-white transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Pinkish-Red CTA Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff0055] hover:bg-[#e0004c] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-pink-900/50 active:scale-[0.99]"
                        >
                            {loading ? 'Authenticating...' : 'Login'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-red-200/70 pt-1">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-white font-bold hover:underline">
                            Sign up here
                        </Link>
                    </p>

                    {/* Screenshot-Matched Demo Accounts Box */}
                    <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl space-y-1.5 text-[11px] text-red-200/80">
                        <p className="font-bold text-white flex items-center gap-1.5">
                            <FileText size={13} className="text-red-300" /> Demo Accounts:
                        </p>
                        <p className="pl-4">• Admin: <span className="text-slate-300">admin@bloodbank.gov</span></p>
                        <p className="pl-4">• Donor: <span className="text-slate-300">john.doe@example.com</span></p>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Login;