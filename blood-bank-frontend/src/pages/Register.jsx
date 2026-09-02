import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, Lock, Mail, User, Phone, Building, ArrowLeft } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'hospital',
        facilityName: '',
        contactNumber: '',
        bloodGroup: 'N/A',
        longitude: 79.0882,
        latitude: 21.1458
    });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (roleValue) => {
        setFormData({ ...formData, role: roleValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await register(formData);
            if (user.role === 'hospital') navigate('/hospital-dashboard');
            else if (user.role === 'blood_bank') navigate('/bloodbank-dashboard');
            else if (user.role === 'donor') navigate('/donor-dashboard');
            else if (user.role === 'driver') navigate('/driver-dashboard');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#6b0312] via-[#3d0208] to-[#1a0003] text-white flex flex-col justify-center items-center px-4 py-8 relative font-sans overflow-hidden">
            
            {/* Top Left Link */}
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-red-200/90 hover:text-white font-medium transition-colors">
                <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="max-w-xl w-full space-y-4 relative z-10">
                
                {/* Header Icon & Titles */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff0055] to-[#e60033] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(255,0,85,0.6)] border border-white/20">
                        <Droplet className="text-white fill-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-wide">Create Account</h1>
                    <p className="text-xs text-red-200/80">Join the Blood Bank Management System</p>

                    {/* Figma Style Role Selector Pills */}
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {[
                            { id: 'hospital', label: 'Hospital / ER' },
                            { id: 'blood_bank', label: 'Blood Bank' },
                            { id: 'donor', label: 'Donor' },
                            { id: 'driver', label: 'Driver' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleRoleSelect(item.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    formData.role === item.id 
                                        ? 'bg-[#ff0000] text-white shadow-md shadow-red-900/50 border border-red-400' 
                                        : 'bg-white/10 text-red-200/70 hover:text-white border border-white/5'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Glassmorphic Form Card */}
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 p-7 rounded-3xl shadow-2xl space-y-4">
                    
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                        <Droplet className="text-[#ff0055] fill-[#ff0055]" size={18} />
                        <h2 className="text-sm font-bold text-white capitalize">
                            {formData.role.replace('_', ' ')} Registration
                        </h2>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-xl text-xs font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        
                        {/* Row 1: Full Name & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div>
                                <label className="text-xs font-medium text-red-100/90 block mb-1">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3 text-red-200/60" size={16} />
                                    <input 
                                        type="text" 
                                        name="name" 
                                        required 
                                        value={formData.name} 
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-red-200/40 focus:outline-none focus:border-red-400 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-red-100/90 block mb-1">Email Address *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3 text-red-200/60" size={16} />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required 
                                        value={formData.email} 
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-red-200/40 focus:outline-none focus:border-red-400 transition-all"
                                        placeholder="org@domain.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Password & Contact Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div>
                                <label className="text-xs font-medium text-red-100/90 block mb-1">Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3 text-red-200/60" size={16} />
                                    <input 
                                        type="password" 
                                        name="password" 
                                        required 
                                        value={formData.password} 
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-red-200/40 focus:outline-none focus:border-red-400 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-red-100/90 block mb-1">Contact Phone *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3 text-red-200/60" size={16} />
                                    <input 
                                        type="text" 
                                        name="contactNumber" 
                                        required 
                                        value={formData.contactNumber} 
                                        onChange={handleChange}
                                        className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-red-200/40 focus:outline-none focus:border-red-400 transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Field: Blood Group vs Facility Name */}
                        <div>
                            {formData.role === 'donor' ? (
                                <div>
                                    <label className="text-xs font-medium text-red-100/90 block mb-1">Blood Group *</label>
                                    <select 
                                        name="bloodGroup" 
                                        value={formData.bloodGroup} 
                                        onChange={handleChange}
                                        className="w-full bg-[#3d0208] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-400"
                                    >
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-medium text-red-100/90 block mb-1">Facility / Org Name *</label>
                                    <div className="relative">
                                        <Building className="absolute left-3.5 top-3 text-red-200/60" size={16} />
                                        <input 
                                            type="text" 
                                            name="facilityName" 
                                            value={formData.facilityName} 
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-red-200/40 focus:outline-none focus:border-red-400 transition-all"
                                            placeholder="City Hospital ER"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full bg-[#ff0055] hover:bg-[#e0004c] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-pink-900/50 mt-2 active:scale-[0.99]"
                        >
                            Complete Registration
                        </button>
                    </form>

                    <p className="text-center text-xs text-red-200/70 pt-2">
                        Already registered? <Link to="/login" className="text-white font-bold hover:underline">Sign In</Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Register;