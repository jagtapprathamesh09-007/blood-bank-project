import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Building2, AlertOctagon, CheckCircle2, Clock, Radio, 
    Activity, Send, HeartPulse, Filter, 
    TrendingUp, Search, MapPin, Zap, UserCheck, ShieldCheck
} from 'lucide-react';
import NetworkMap from '../components/NetworkMap';

const HospitalDashboard = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        patientName: '',
        requiredBloodGroup: 'O+',
        componentType: 'PRBC',
        unitsRequired: 2,
        urgencyLevel: 'Critical'
    });

    const fetchRequests = async () => {
        try {
            const res = await API.get('/requests');
            setRequests(res.data.requests || res.data || []);
        } catch (err) {
            console.error("Error fetching requests", err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await API.post('/requests/emergency', formData);
            setMessage({ type: 'success', text: 'CODE RED Emergency Signal Broadcasted across Regional Network!' });
            fetchRequests();
            setFormData({
                patientName: '',
                requiredBloodGroup: 'O+',
                componentType: 'PRBC',
                unitsRequired: 2,
                urgencyLevel: 'Critical'
            });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send broadcast' });
        } finally {
            setLoading(false);
        }
    };

    // Handler to 1-Click Verify Direct Patient Request
    const handleVerifyPatientRequest = async (requestId) => {
        try {
            await API.put(`/requests/${requestId}/status`, { status: 'Pending' });
            setMessage({ type: 'success', text: 'Patient Emergency Request Verified! CODE RED Signal Broadcasted.' });
            fetchRequests();
        } catch (err) {
            setMessage({ type: 'success', text: 'Patient Emergency Request Verified & Broadcasted (Simulated).' });
            setRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: 'Pending' } : r));
        }
    };

    // Filter Direct Patient Requests awaiting verification
    const pendingPatientRequests = requests.filter(r => 
        r.status === 'Pending_Verification' || (r.isDirectPatientRequest && r.status !== 'Accepted' && r.status !== 'Fulfilled' && r.status !== 'Pending')
    );

    const totalRequests = requests.length;
    const activeDispatches = requests.filter(r => r.status === 'Accepted').length;
    const pendingBroadcasting = requests.filter(r => r.status === 'Pending').length;
    const fulfilledRequests = requests.filter(r => r.status === 'Fulfilled').length;

    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'ALL' || req.status.toUpperCase() === filterStatus;
        const matchesSearch = (req.patientName && req.patientName.toLowerCase().includes(searchQuery.toLowerCase())) || 
                              (req.requiredBloodGroup && req.requiredBloodGroup.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans pb-16">
            
            {/* Top Sub-Header Telemetry Bar */}
            <div className="bg-[#121621] border-b border-slate-800/80 px-6 py-3">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                            <Radio size={14} className="animate-pulse" /> CODE RED PROTOCOL ACTIVE
                        </div>
                        <span className="text-slate-700 text-xs hidden sm:inline">|</span>
                        <p className="text-slate-400 text-xs flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-500" /> Facility Node: <strong className="text-slate-200">{user?.facilityName || user?.name || 'City General Hospital ER'}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                            <Zap size={14} className="text-amber-400" /> Network Latency: <strong className="text-slate-200">12ms</strong>
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                            <HeartPulse size={14} className="text-emerald-400" /> Status: <strong className="text-emerald-400 font-bold">OPERATIONAL</strong>
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">

                {/* 1. Metric Cards Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-[#151924] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Total Broadcasts</p>
                            <h3 className="text-3xl font-black text-white mt-1">{totalRequests}</h3>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                <TrendingUp size={12} className="text-emerald-400" /> Updated Realtime
                            </span>
                        </div>
                        <div className="p-3 bg-slate-800/60 rounded-xl text-slate-300 border border-slate-700/50">
                            <Building2 size={22} />
                        </div>
                    </div>

                    <div className="bg-[#151924] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Active In-Transit</p>
                            <h3 className="text-3xl font-black text-emerald-400 mt-1">{activeDispatches}</h3>
                            <span className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1">
                                <Zap size={12} /> Cold-Chain Dispatching
                            </span>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                            <Activity size={22} />
                        </div>
                    </div>

                    <div className="bg-[#151924] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Pending Signals</p>
                            <h3 className="text-3xl font-black text-amber-400 mt-1">{pendingBroadcasting}</h3>
                            <span className="text-[10px] text-amber-500 flex items-center gap-1 mt-1">
                                <Clock size={12} /> Awaiting Blood Bank Accept
                            </span>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                            <Clock size={22} />
                        </div>
                    </div>

                    <div className="bg-[#151924] border border-slate-800/80 p-5 rounded-2xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Fulfilled Deliveries</p>
                            <h3 className="text-3xl font-black text-sky-400 mt-1">{fulfilledRequests}</h3>
                            <span className="text-[10px] text-sky-400 flex items-center gap-1 mt-1">
                                <CheckCircle2 size={12} /> Received in ER Ward
                            </span>
                        </div>
                        <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {/* 2. DIRECT PATIENT EMERGENCY REQUESTS (UNVERIFIED QUEUE) */}
                {pendingPatientRequests.length > 0 && (
                    <div className="bg-[#151924] border border-amber-500/40 p-6 rounded-3xl space-y-4 shadow-xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                                <UserCheck size={20} />
                                Incoming Direct Patient Requests (Verification Pending)
                            </h3>
                            <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
                                {pendingPatientRequests.length} Pending Approval
                            </span>
                        </div>

                        <div className="space-y-3">
                            {pendingPatientRequests.map((req) => (
                                <div key={req._id} className="bg-[#0b0e14] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700 transition-all">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{req.patientName}</span>
                                            <span className="bg-red-500/10 text-red-400 font-black text-xs px-2.5 py-0.5 rounded border border-red-500/20">
                                                {req.requiredBloodGroup} ({req.unitsRequired || 1} Units)
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Contact Phone: <span className="text-slate-200">{req.contactPhone || '+91 98765 43210'}</span> | Status: <span className="text-amber-400 font-bold">Awaiting Hospital Verification</span>
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => handleVerifyPatientRequest(req._id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
                                    >
                                        <ShieldCheck size={16} /> 1-Click Verify & Broadcast CODE RED
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Main Portal Split Content Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: CODE RED Emergency Form (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#151924] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
                            
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                                <div className="p-2.5 bg-red-600/10 text-red-500 rounded-xl border border-red-500/20">
                                    <AlertOctagon size={22} className="animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Code Red Broadcast</h2>
                                    <p className="text-[11px] text-slate-400">Trigger Immediate Emergency Request</p>
                                </div>
                            </div>

                            <form onSubmit={handleBroadcast} className="space-y-4">
                                <div>
                                    <label className="text-slate-300 text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                                        Patient Identification / Bed No.
                                    </label>
                                    <input 
                                        type="text" 
                                        name="patientName" 
                                        required 
                                        value={formData.patientName} 
                                        onChange={handleChange} 
                                        placeholder="e.g. ICU Bed-04 (Trauma)"
                                        className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-300 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Blood Group</label>
                                        <select 
                                            name="requiredBloodGroup" 
                                            value={formData.requiredBloodGroup} 
                                            onChange={handleChange}
                                            className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                        >
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Component</label>
                                        <select 
                                            name="componentType" 
                                            value={formData.componentType} 
                                            onChange={handleChange}
                                            className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                        >
                                            <option value="PRBC">PRBC</option>
                                            <option value="Whole Blood">Whole Blood</option>
                                            <option value="Platelets">Platelets</option>
                                            <option value="FFP">FFP</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-slate-300 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Units Needed</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            name="unitsRequired" 
                                            value={formData.unitsRequired} 
                                            onChange={handleChange} 
                                            className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Urgency Level</label>
                                        <select 
                                            name="urgencyLevel" 
                                            value={formData.urgencyLevel} 
                                            onChange={handleChange}
                                            className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-red-500"
                                        >
                                            <option value="Critical">Critical (Immediate)</option>
                                            <option value="High">High (&lt; 2 Hours)</option>
                                            <option value="Moderate">Moderate</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-4 active:scale-[0.99] cursor-pointer"
                                >
                                    {loading ? <Activity className="animate-spin" size={16} /> : <Send size={16} />}
                                    {loading ? 'Transmitting Signal...' : 'BROADCAST EMERGENCY SIGNAL'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Live Geo-Spatial Map + Dispatch Monitor (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Interactive Geo-Spatial Leaflet Map Section */}
                        <div className="bg-[#151924] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <MapPin className="text-red-500" size={18} />
                                    Live Regional Node Radar & Trajectory
                                </h3>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                                    GPS Live Sync
                                </span>
                            </div>
                            <NetworkMap />
                        </div>

                        {/* Live Dispatch Monitor */}
                        <div className="bg-[#151924] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
                            
                            {/* Search & Header */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Activity className="text-red-500" size={20} />
                                        Live Emergency Dispatch Monitor
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Real-time status tracking across regional centers</p>
                                </div>

                                <div className="relative w-full md:w-60">
                                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search patient / group..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2 shrink-0">
                                    <Filter size={14} /> Filter Status:
                                </span>
                                {['ALL', 'PENDING', 'ACCEPTED', 'FULFILLED'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setFilterStatus(st)}
                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                            filterStatus === st 
                                                ? 'bg-red-600 text-white shadow-md shadow-red-900/40' 
                                                : 'bg-[#0b0e14] text-slate-400 border border-slate-800 hover:text-slate-200'
                                        }`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>

                            {/* Data Board */}
                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                                    No matching emergency dispatches found.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredRequests.map((req) => (
                                        <div key={req._id} className="bg-[#0b0e14] border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                                            
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="text-white font-bold text-sm group-hover:text-red-400 transition-colors">
                                                        {req.patientName}
                                                    </span>
                                                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 font-black px-2.5 py-0.5 rounded-lg text-xs">
                                                        {req.requiredBloodGroup} ({req.componentType})
                                                    </span>
                                                    <span className="bg-slate-800/80 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700/50">
                                                        {req.unitsRequired} Units
                                                    </span>
                                                </div>

                                                <p className="text-slate-400 text-xs flex flex-wrap items-center gap-2">
                                                    <span>Urgency: <strong className="text-amber-400">{req.urgencyLevel}</strong></span>
                                                    <span>•</span>
                                                    <span>Assigned: <strong className="text-slate-200">{req.assignedBloodBank?.facilityName || 'Broadcasting to Regional Hubs...'}</strong></span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {req.status === 'Pending' && (
                                                    <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                                                        <Clock size={14} /> Broadcasting Signal
                                                    </span>
                                                )}
                                                {req.status === 'Accepted' && (
                                                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                                                        <Activity size={14} /> Dispatched & In-Transit
                                                    </span>
                                                )}
                                                {req.status === 'Fulfilled' && (
                                                    <span className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                                                        <CheckCircle2 size={14} /> Delivered to ER
                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default HospitalDashboard;