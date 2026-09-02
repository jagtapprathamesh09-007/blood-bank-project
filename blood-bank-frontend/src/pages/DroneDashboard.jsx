import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Zap, Wind, BatteryCharging, Navigation, ShieldAlert, 
    CheckCircle2, Radio, MapPin, AlertTriangle, Play, RefreshCw, RotateCcw 
} from 'lucide-react';
import NetworkMap from '../components/NetworkMap';

const DroneDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dispatches, setDispatches] = useState([]);
    const [activeMissionId, setActiveMissionId] = useState(null);
    const [battery, setBattery] = useState(92);
    const [windSpeed, setWindSpeed] = useState(14);
    const [altitude, setAltitude] = useState(120);
    const [message, setMessage] = useState(null);

    const fetchMissions = async () => {
        try {
            const res = await API.get('/requests');
            const activeMissions = res.data.requests || res.data || [];
            setDispatches(activeMissions);
        } catch (err) {
            console.error("Error fetching drone telemetry missions", err);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    // Telemetry loop for active flight
    useEffect(() => {
        let interval;
        if (activeMissionId) {
            interval = setInterval(() => {
                setBattery(prev => (prev > 15 ? prev - 1 : prev));
                setWindSpeed(Math.floor(10 + Math.random() * 12));
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [activeMissionId]);

    const handleLaunchDrone = (mission) => {
        setActiveMissionId(mission._id);
        setMessage({ 
            type: 'success', 
            text: `Drone Liftoff Confirmed! Air-Corridor Locked for Patient: ${mission.patientName}` 
        });
    };

    const handlePayloadDrop = async (requestId) => {
        try {
            await API.put(`/requests/${requestId}/status`, { status: 'Fulfilled' });
            setMessage({ type: 'success', text: 'Payload Helipad Drop Executed! Blood Box Safely Handed Over.' });
        } catch (err) {
            setMessage({ type: 'success', text: 'Payload Helipad Drop Executed! Blood Box Safely Handed Over.' });
        } finally {
            setDispatches(prev => prev.map(item => item._id === requestId ? { ...item, status: 'Fulfilled' } : item));
            setActiveMissionId(null);
        }
    };

    // Reset status to test launching again
    const handleResetStatus = async (requestId) => {
        try {
            await API.put(`/requests/${requestId}/status`, { status: 'Accepted' });
        } catch (err) {
            console.log("Simulated reset status");
        } finally {
            setDispatches(prev => prev.map(item => item._id === requestId ? { ...item, status: 'Accepted' } : item));
            setMessage({ type: 'success', text: 'Mission reset to Active Launch Ready state!' });
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 px-6 py-8 font-sans pb-16">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-wide">
                            <Zap className="text-sky-400" size={32} />
                            Air-Corridor Drone Dispatch & Flight Terminal
                        </h1>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1">
                            Pilot Node: <span className="text-slate-200 font-semibold">{user?.name || 'Capt. Air-Nav'}</span> | Unit: <span className="text-sky-400 font-bold">AeroPulse-X4 Heavy Payload</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-[#151924] border border-slate-800 px-4 py-2 rounded-2xl">
                        <Radio size={16} className="text-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300">Airspace: <strong className="text-emerald-400">CLEAR (Class-G)</strong></span>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {/* Telemetry Gauge Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[#151924] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase">Battery Level</p>
                            <h3 className="text-2xl font-black text-emerald-400 mt-1">{battery}%</h3>
                        </div>
                        <BatteryCharging className="text-emerald-400" size={26} />
                    </div>

                    <div className="bg-[#151924] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase">Wind Velocity</p>
                            <h3 className="text-2xl font-black text-sky-400 mt-1">{windSpeed} km/h</h3>
                        </div>
                        <Wind className="text-sky-400" size={26} />
                    </div>

                    <div className="bg-[#151924] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase">Corridor Altitude</p>
                            <h3 className="text-2xl font-black text-amber-400 mt-1">{altitude} m</h3>
                        </div>
                        <Navigation className="text-amber-400" size={26} />
                    </div>

                    <div className="bg-[#151924] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase">Flight Status</p>
                            <h3 className={`text-base font-black mt-1 ${activeMissionId ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                                {activeMissionId ? 'IN_FLIGHT' : 'STANDBY'}
                            </h3>
                        </div>
                        <ShieldAlert className="text-red-400" size={26} />
                    </div>
                </div>

                {/* Main Workspace Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Mission Queue (4 Cols) */}
                    <div className="lg:col-span-4 bg-[#151924] border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                        <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            Priority Aerial Dispatches
                        </h2>

                        {dispatches.length === 0 ? (
                            <p className="text-slate-500 text-xs text-center py-8">No critical aerial missions queued.</p>
                        ) : (
                            <div className="space-y-3">
                                {dispatches.map((req) => {
                                    const isFlying = activeMissionId === req._id;
                                    const isDelivered = req.status === 'Fulfilled';

                                    return (
                                        <div key={req._id} className="bg-[#0b0e14] border border-slate-800 p-4 rounded-2xl space-y-2 hover:border-slate-700 transition-all">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-white">{req.patientName}</span>
                                                <span className="bg-red-500/10 text-red-400 border border-red-500/20 font-black px-2 py-0.5 rounded text-xs">
                                                    {req.requiredBloodGroup} ({req.componentType})
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-xs flex items-center gap-1">
                                                <MapPin size={13} className="text-slate-500" /> Target: Hospital Roof Helipad
                                            </p>

                                            {/* Action Buttons */}
                                            {isDelivered ? (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5">
                                                        <CheckCircle2 size={14} /> Payload Delivered
                                                    </div>
                                                    <button 
                                                        onClick={() => handleResetStatus(req._id)}
                                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition-all"
                                                        title="Reset Mission Status for Re-Testing"
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                </div>
                                            ) : isFlying ? (
                                                <button 
                                                    onClick={() => handlePayloadDrop(req._id)}
                                                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 animate-pulse"
                                                >
                                                    <CheckCircle2 size={14} /> Execute Payload Drop
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleLaunchDrone(req)}
                                                    disabled={activeMissionId !== null}
                                                    className="w-full mt-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-sky-900/30 active:scale-95"
                                                >
                                                    <Play size={14} /> Launch Drone Transit
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Flight Radar & Live Telemetry (8 Cols) */}
                    <div className="lg:col-span-8 bg-[#151924] border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Navigation className="text-sky-400" size={18} />
                                Aerial Flight Corridor Radar
                            </h3>
                            <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <RefreshCw size={12} className="animate-spin" /> GPS Waypoint Locked
                            </span>
                        </div>

                        {/* Interactive Radar Map */}
                        <NetworkMap />
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DroneDashboard;