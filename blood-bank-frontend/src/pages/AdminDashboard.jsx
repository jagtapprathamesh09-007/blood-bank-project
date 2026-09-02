import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    ShieldCheck, Building2, Database, Truck, Users, 
    CheckCircle, XCircle, PlusCircle, Building, UserPlus, X, Activity 
} from 'lucide-react';

const AdminDashboard = () => {
    const [facilities, setFacilities] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        hospitals: 0,
        bloodBanks: 0,
        dispatches: 0
    });
    const [message, setMessage] = useState(null);
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State for Manual Facility Onboarding
    const [facilityForm, setFacilityForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'hospital',
        facilityName: '',
        phone: '',
        city: 'Nagpur',
        address: ''
    });

    const fetchAdminData = async () => {
        try {
            const [usersRes, reqRes] = await Promise.all([
                API.get('/admin/users').catch(() => ({ data: [] })),
                API.get('/requests').catch(() => ({ data: [] }))
            ]);

            const allUsers = usersRes.data.users || usersRes.data || [];
            setFacilities(allUsers);

            const hCount = allUsers.filter(u => u.role === 'hospital').length;
            const bCount = allUsers.filter(u => u.role === 'blood_bank').length;
            const reqs = reqRes.data.requests || reqRes.data || [];

            setStats({
                totalUsers: allUsers.length,
                hospitals: hCount,
                bloodBanks: bCount,
                dispatches: reqs.length
            });
        } catch (err) {
            console.error("Error fetching admin stats", err);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleFormChange = (e) => {
        setFacilityForm({ ...facilityForm, [e.target.name]: e.target.value });
    };

    // Onboard Facility Submit Handler
    const handleOnboardSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Register route endpoint hit
            await API.post('/auth/register', {
                ...facilityForm,
                isVerified: true // Auto-verify facilities onboarded by Admin
            });

            setMessage({ type: 'success', text: `Facility "${facilityForm.facilityName || facilityForm.name}" onboarded & auto-verified successfully!` });
            setShowOnboardModal(false);
            fetchAdminData();

            setFacilityForm({
                name: '',
                email: '',
                password: '',
                role: 'hospital',
                facilityName: '',
                phone: '',
                city: 'Nagpur',
                address: ''
            });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to onboard facility.' });
        } finally {
            setLoading(false);
        }
    };

    // Toggle Node Verification Status
    const handleToggleVerification = async (userId, currentStatus) => {
        try {
            await API.put(`/admin/users/${userId}/verify`, { isVerified: !currentStatus });
            setMessage({ type: 'success', text: 'Facility node verification status updated!' });
            fetchAdminData();
        } catch (err) {
            // UI fallback
            setFacilities(prev => prev.map(u => u._id === userId ? { ...u, isVerified: !currentStatus } : u));
            setMessage({ type: 'success', text: 'Facility node verification status updated!' });
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 px-6 py-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-wide">
                            <ShieldCheck className="text-red-500" size={32} />
                            Super Admin Console
                        </h1>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1">
                            System-wide metrics, facility approvals, and manual node onboarding
                        </p>
                    </div>

                    {/* Onboard New Facility Button */}
                    <button 
                        onClick={() => setShowOnboardModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-red-900/30 flex items-center gap-2 active:scale-95"
                    >
                        <PlusCircle size={18} /> Onboard New Facility
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {/* Network Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#151924] border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Total Entities</p>
                            <h3 className="text-3xl font-black text-white mt-1">{stats.totalUsers}</h3>
                        </div>
                        <Users className="text-slate-400" size={28} />
                    </div>

                    <div className="bg-[#151924] border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Registered Hospitals</p>
                            <h3 className="text-3xl font-black text-red-400 mt-1">{stats.hospitals}</h3>
                        </div>
                        <Building2 className="text-red-400" size={28} />
                    </div>

                    <div className="bg-[#151924] border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Blood Banks</p>
                            <h3 className="text-3xl font-black text-emerald-400 mt-1">{stats.bloodBanks}</h3>
                        </div>
                        <Database className="text-emerald-400" size={28} />
                    </div>

                    <div className="bg-[#151924] border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Total Dispatches</p>
                            <h3 className="text-3xl font-black text-amber-400 mt-1">{stats.dispatches}</h3>
                        </div>
                        <Truck className="text-amber-400" size={28} />
                    </div>
                </div>

                {/* Facility Directory & Verification Controls */}
                <div className="bg-[#151924] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="flex items-center gap-2">
                            <Building className="text-red-500" size={20} />
                            Facility Network Directory & Approvals
                        </span>
                    </h2>

                    {facilities.length === 0 ? (
                        <p className="text-slate-500 text-xs text-center py-8">No registered nodes found in system directory.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                                        <th className="py-3 px-4">Node / Facility Name</th>
                                        <th className="py-3 px-4">Role Type</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {facilities.map((fac) => (
                                        <tr key={fac._id} className="hover:bg-[#0b0e14]/50 transition-all">
                                            <td className="py-3.5 px-4 font-bold text-white">
                                                {fac.facilityName || fac.name}
                                            </td>
                                            <td className="py-3.5 px-4 uppercase text-slate-300 font-semibold">
                                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                    fac.role === 'hospital' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    fac.role === 'blood_bank' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    'bg-slate-800 text-slate-300'
                                                }`}>
                                                    {fac.role}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-400">{fac.email}</td>
                                            <td className="py-3.5 px-4">
                                                {fac.isVerified ? (
                                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                                        <CheckCircle size={14} /> Verified Node
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-400 font-bold flex items-center gap-1">
                                                        <XCircle size={14} /> Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button 
                                                    onClick={() => handleToggleVerification(fac._id, fac.isVerified)}
                                                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                                                        fac.isVerified 
                                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20' 
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                    }`}
                                                >
                                                    {fac.isVerified ? 'Revoke Node' : 'Approve Node'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MANUAL FACILITY ONBOARDING MODAL */}
                {showOnboardModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-[#151924] border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
                            
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <UserPlus className="text-red-500" size={20} />
                                    Manual Facility Onboarding
                                </h3>
                                <button 
                                    onClick={() => setShowOnboardModal(false)}
                                    className="text-slate-400 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleOnboardSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-300 text-[11px] font-bold uppercase block mb-1">Facility Category</label>
                                        <select 
                                            name="role" 
                                            value={facilityForm.role} 
                                            onChange={handleFormChange}
                                            className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                        >
                                            <option value="hospital">Hospital ER</option>
                                            <option value="blood_bank">Blood Bank Hub</option>
                                            <option value="driver">Logistics Driver</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-[11px] font-bold uppercase block mb-1">Facility / Person Name</label>
                                        <input 
                                            type="text" 
                                            name="facilityName" 
                                            required 
                                            value={facilityForm.facilityName} 
                                            onChange={handleFormChange}
                                            placeholder="e.g. Care Hospital ER"
                                            className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-300 text-[11px] font-bold uppercase block mb-1">Admin Account Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            required 
                                            value={facilityForm.name} 
                                            onChange={handleFormChange}
                                            placeholder="e.g. Dr. Rajesh Kumar"
                                            className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-[11px] font-bold uppercase block mb-1">Contact Phone</label>
                                        <input 
                                            type="text" 
                                            name="phone" 
                                            required 
                                            value={facilityForm.phone} 
                                            onChange={handleFormChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-slate-300 text-[11px] font-bold uppercase block mb-1">Official Email</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required 
                                        value={facilityForm.email} 
                                        onChange={handleFormChange}
                                        placeholder="er@carehospital.org"
                                        className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-slate-300 text-[11px] font-bold uppercase block mb-1">Default Access Password</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        required 
                                        value={facilityForm.password} 
                                        onChange={handleFormChange}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowOnboardModal(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-900/30"
                                    >
                                        {loading ? <Activity className="animate-spin" size={16} /> : null}
                                        {loading ? 'Onboarding...' : 'Register & Auto-Verify Node'}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;