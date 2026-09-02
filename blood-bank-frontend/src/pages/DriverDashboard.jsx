import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Truck, Navigation, CheckCircle2, MapPin, Thermometer, 
    FileText, ShieldCheck, Lock, AlertTriangle 
} from 'lucide-react';
import { downloadGatePassInvoice } from '../utils/generateGatePass';
import NetworkMap from '../components/NetworkMap';

const DriverDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dispatches, setDispatches] = useState([]);
    const [temperature, setTemperature] = useState(4.0); // Default safe cold-chain temp
    const [message, setMessage] = useState(null);

    // Safety threshold check (2°C - 6°C is safe for blood cold-chain)
    const isBreached = temperature > 6.0 || temperature < 2.0;

    const fetchDispatches = async () => {
        try {
            const res = await API.get('/requests');
            const activeTasks = (res.data.requests || []).filter(
                r => r.status === 'Accepted' || r.status === 'Fulfilled'
            );
            setDispatches(activeTasks);
        } catch (err) {
            console.error("Error fetching driver dispatches", err);
        }
    };

    useEffect(() => {
        fetchDispatches();
    }, []);

    const handleUpdateStatus = async (requestId, newStatus) => {
        if (isBreached && newStatus === 'Fulfilled') {
            setMessage({ 
                type: 'error', 
                text: `CRITICAL SAFETY LOCK: Container temperature is at ${temperature.toFixed(1)}°C. Spoilage risk detected. Handover locked.` 
            });
            return;
        }

        try {
            await API.put(`/requests/${requestId}/status`, { status: newStatus });
            setMessage({ type: 'success', text: `Emergency Dispatch marked as ${newStatus}!` });
            fetchDispatches();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update delivery status' });
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 px-6 py-8 font-sans pb-16">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-wide">
                            <Truck className="text-amber-400" size={32} />
                            Logistics & Cold-Chain Delivery Control
                        </h1>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1">
                            Driver: <span className="text-slate-200 font-semibold">{user?.name || 'Logistics Commander'}</span> | Unit: <span className="text-amber-400 font-bold">MH-31-EMG-108</span>
                        </p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {/* TEMPERATURE SENSOR & TELEMETRY CONTROL PANEL */}
                <div className={`p-6 rounded-3xl border transition-all shadow-xl space-y-4 ${
                    isBreached ? 'bg-red-950/20 border-red-500/50' : 'bg-[#151924] border-slate-800'
                }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                <Thermometer size={14} className={isBreached ? "text-red-400" : "text-emerald-400"} />
                                Cold-Box Sensor Telemetry
                            </span>
                            <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                                Sensor Reading: 
                                <span className={isBreached ? "text-red-400 font-black animate-pulse" : "text-emerald-400 font-black"}>
                                    {temperature.toFixed(1)} °C
                                </span>
                            </h3>
                        </div>

                        {/* Safety Lock Badge */}
                        <div>
                            {isBreached ? (
                                <span className="bg-red-500/20 border border-red-500 text-red-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                                    <Lock size={16} /> SPOILAGE BREACH: DELIVERY AUTO-LOCKED
                                </span>
                            ) : (
                                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                                    <ShieldCheck size={16} /> Optimal Safe Range (2.0°C - 6.0°C)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Sensor Slider Simulation */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                            <span>2.0 °C (Frozen Safe)</span>
                            <span className="text-amber-400">Simulate Live Temperature Sensor</span>
                            <span>10.0 °C (Spoiled)</span>
                        </div>
                        <input 
                            type="range" 
                            min="2.0" 
                            max="10.0" 
                            step="0.5" 
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full accent-red-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                        />
                    </div>
                </div>

                {/* Main Workspace Grid Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Dispatches List Column (5 Cols) */}
                    <div className="lg:col-span-5 bg-[#151924] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
                        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                            <Navigation className="text-amber-400" size={18} />
                            Active Vehicle Dispatches
                        </h2>

                        {dispatches.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs sm:text-sm">
                                No active transit dispatches assigned.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dispatches.map((task) => (
                                    <div key={task._id} className="bg-[#0b0e14] border border-slate-800 p-4 rounded-2xl space-y-3 hover:border-slate-700 transition-all">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">{task.patientName}</span>
                                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 font-black px-2.5 py-0.5 rounded text-xs">
                                                {task.requiredBloodGroup} ({task.unitsRequired} Units)
                                            </span>
                                        </div>

                                        <p className="text-slate-400 text-xs flex items-center gap-1.5">
                                            <MapPin size={13} className="text-red-400" /> ER Ward | Urgency: <span className="text-amber-400 font-bold">{task.urgencyLevel}</span>
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <button 
                                                onClick={() => downloadGatePassInvoice({
                                                    dispatchId: task._id,
                                                    patientName: task.patientName,
                                                    bloodGroup: task.requiredBloodGroup,
                                                    units: task.unitsRequired,
                                                    hospitalName: task.hospital?.facilityName || "Emergency Ward Node",
                                                    driverName: user?.name || "Fleet Unit-04",
                                                    temperature: `${temperature.toFixed(1)}°C`
                                                })}
                                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <FileText size={14} /> Gate Pass
                                            </button>

                                            {task.status === 'Accepted' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(task._id, 'Fulfilled')}
                                                    disabled={isBreached}
                                                    className={`flex-1 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                                                        isBreached 
                                                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800' 
                                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30'
                                                    }`}
                                                >
                                                    <CheckCircle2 size={14} /> {isBreached ? 'Locked' : 'Handover'}
                                                </button>
                                            )}

                                            {task.status === 'Fulfilled' && (
                                                <span className="flex-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1">
                                                    <CheckCircle2 size={14} /> Delivered
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Spatial Telemetry Radar Map Column (7 Cols) */}
                    <div className="lg:col-span-7 bg-[#151924] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                            <Truck className="text-amber-400" size={18} />
                            Live Fleet Spatial Radar
                        </h3>
                        <NetworkMap />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DriverDashboard;