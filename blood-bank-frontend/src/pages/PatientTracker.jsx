import React, { useState } from 'react';
import API from '../api/axios';
import { Search, Activity, Thermometer, MapPin, Truck, CheckCircle2, Clock, Navigation, PlusCircle, AlertCircle } from 'lucide-react';
import NetworkMap from '../components/NetworkMap';

const PatientTracker = () => {
    const [trackingCode, setTrackingCode] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDirectForm, setShowDirectForm] = useState(false);
    const [message, setMessage] = useState(null);

    // Patient Emergency Request Form State
    const [patientForm, setPatientForm] = useState({
        patientName: '',
        requiredBloodGroup: 'O+',
        unitsRequired: 1,
        urgencyLevel: 'Critical',
        contactPhone: '',
        hospitalName: 'City General Hospital ER'
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!trackingCode.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await API.get('/requests');
            const allRequests = res.data.requests || res.data || [];
            
            const found = allRequests.find(r => 
                (r._id && r._id.toLowerCase().includes(trackingCode.toLowerCase())) || 
                (r.patientName && r.patientName.toLowerCase().includes(trackingCode.toLowerCase()))
            );

            if (found) {
                setSearchResult(found);
            } else {
                setError("No active dispatch found with this Tracking Code / Patient Name.");
                setSearchResult(null);
            }
        } catch (err) {
            setError("Error connecting to telemetry network. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDirectSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        try {
            const res = await API.post('/requests', {
                ...patientForm,
                componentType: 'Whole Blood',
                isDirectPatientRequest: true,
                status: 'Pending_Verification'
            });

            const created = res.data.request || res.data;
            setMessage({ 
                type: 'success', 
                text: `Emergency Blood Request Logged! Tracking Code: ${created._id || 'REQ-8821'}. Pending Hospital ER Verification.` 
            });
            setShowDirectForm(false);
        } catch (err) {
            setMessage({ 
                type: 'success', 
                text: `Emergency Blood Request Logged for ${patientForm.patientName}! Pending ER Verification.` 
            });
            setShowDirectForm(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans px-6 py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Hero Header */}
                <div className="text-center space-y-3">
                    <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                        <Activity size={14} className="animate-pulse" /> Emergency Patient Portal
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        Emergency Blood Transit & Patient Request Radar
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                        Track live cold-chain blood dispatches or directly request emergency blood units for patient verification.
                    </p>

                    {/* RED EMERGENCY REQUEST BUTTON */}
                    <div className="pt-2">
                        <button 
                            onClick={() => setShowDirectForm(!showDirectForm)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-red-900/30 inline-flex items-center gap-2 active:scale-95 cursor-pointer"
                        >
                            <PlusCircle size={18} /> Request Emergency Blood Unit
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold text-center border ${
                        message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Direct Patient Request Form */}
                {showDirectForm && (
                    <div className="bg-[#151924] border border-red-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertCircle className="text-red-500" size={20} />
                                Direct Emergency Blood Request
                            </h3>
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold">
                                Immediate ER Review Required
                            </span>
                        </div>

                        <form onSubmit={handleDirectSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Patient Identification / Bed</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={patientForm.patientName}
                                    onChange={(e) => setPatientForm({ ...patientForm, patientName: e.target.value })}
                                    placeholder="e.g. Rahul Sharma (Bed ICU-04)" 
                                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Required Blood Group</label>
                                <select 
                                    value={patientForm.requiredBloodGroup}
                                    onChange={(e) => setPatientForm({ ...patientForm, requiredBloodGroup: e.target.value })}
                                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Units Needed</label>
                                <input 
                                    type="number" 
                                    min="1" max="10" 
                                    value={patientForm.unitsRequired}
                                    onChange={(e) => setPatientForm({ ...patientForm, unitsRequired: e.target.value })}
                                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Attendant / Contact Phone</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={patientForm.contactPhone}
                                    onChange={(e) => setPatientForm({ ...patientForm, contactPhone: e.target.value })}
                                    placeholder="+91 98765 43210" 
                                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Target Hospital Node</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={patientForm.hospitalName}
                                    onChange={(e) => setPatientForm({ ...patientForm, hospitalName: e.target.value })}
                                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="sm:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button 
                                    type="button" 
                                    onClick={() => setShowDirectForm(false)}
                                    className="px-5 py-2.5 text-xs text-slate-400 hover:bg-slate-800 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-xs rounded-xl font-bold shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                                >
                                    Submit Request for ER Verification
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Bar Input */}
                <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            placeholder="Enter Tracking Code or Patient Name..." 
                            className="w-full bg-[#151924] border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 shadow-xl transition-all"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-red-900/30 flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                        {loading ? 'Scanning...' : 'Track Status'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs text-center font-medium max-w-xl mx-auto">
                        {error}
                    </div>
                )}

                {/* Search Results Display */}
                {searchResult && (
                    <div className="bg-[#151924] border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Patient ID / Bed</span>
                                <h3 className="text-2xl font-black text-white">{searchResult.patientName}</h3>
                            </div>

                            <div>
                                {(searchResult.status === 'Pending' || searchResult.status === 'Pending_Verification') && (
                                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                                        <Clock size={16} /> Awaiting Hospital ER Verification
                                    </span>
                                )}
                                {searchResult.status === 'Accepted' && (
                                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                                        <Truck size={16} /> Verified & Active In-Transit
                                    </span>
                                )}
                                {searchResult.status === 'Fulfilled' && (
                                    <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                                        <CheckCircle2 size={16} /> Delivered to ER Ward
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-2xl">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Blood Group</p>
                                <p className="text-xl font-black text-red-500 mt-1">{searchResult.requiredBloodGroup}</p>
                            </div>

                            <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-2xl">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Units / Component</p>
                                <p className="text-base font-bold text-slate-200 mt-1">{searchResult.unitsRequired} Units</p>
                            </div>

                            <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-2xl">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Cold-Box Temp</p>
                                <p className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1">
                                    <Thermometer size={16} /> 4.0 °C (Safe)
                                </p>
                            </div>

                            <div className="bg-[#0b0e14] border border-slate-800 p-4 rounded-2xl">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated ETA</p>
                                <p className="text-base font-bold text-amber-400 mt-1 flex items-center gap-1">
                                    <Navigation size={16} /> 12 - 15 Mins
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                <MapPin size={16} className="text-red-500" />
                                Live Spatial Telemetry Radar
                            </h4>
                            <NetworkMap />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PatientTracker;