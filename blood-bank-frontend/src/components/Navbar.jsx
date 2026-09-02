import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, ShieldAlert, UserCheck, Truck, Building2, Database, HeartPulse } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'hospital':
                return { label: 'Hospital ER', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: Building2 };
            case 'blood_bank':
                return { label: 'Blood Bank', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Database };
            case 'donor':
                return { label: 'Voluntary Donor', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: UserCheck };
            case 'driver':
                return { label: 'Logistics Fleet', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Truck };
            default:
                return { label: 'User', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: ShieldAlert };
        }
    };

    const roleBadge = user ? getRoleBadge(user.role) : null;
    const BadgeIcon = roleBadge?.icon;

    return (
        <header className="sticky top-0 z-50 bg-[#121621] border-b border-slate-800/80 transition-all font-sans">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-3.5 group">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
                        <HeartPulse size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                            LifeLine <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Pulse</span>
                        </span>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                            Emergency Network
                        </p>
                    </div>
                </Link>

                {/* Right Action / Profile Bar */}
                {user ? (
                    <div className="flex items-center gap-4">
                        {/* Live Status Indicator */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b0e14] border border-slate-800 text-xs text-slate-300">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="font-medium text-slate-300">Network Active</span>
                        </div>

                        {/* User Role Pill */}
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${roleBadge.color}`}>
                            {BadgeIcon && <BadgeIcon size={14} />}
                            <span>{roleBadge.label}</span>
                        </div>

                        {/* User Name */}
                        <div className="hidden md:block text-right">
                            <p className="text-xs font-bold text-slate-200">{user.facilityName || user.name}</p>
                            <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0b0e14] hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-all"
                            title="Sign Out"
                        >
                            <LogOut size={15} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/25 transition-all"
                        >
                            Join Network
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;