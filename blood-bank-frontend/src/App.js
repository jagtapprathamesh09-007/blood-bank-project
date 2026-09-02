import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import HospitalDashboard from './pages/HospitalDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';
import DonorDashboard from './pages/DonorDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientTracker from './pages/PatientTracker';
import DroneDashboard from './pages/DroneDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
            <Route path="/bloodbank-dashboard" element={<BloodBankDashboard />} />
            <Route path="/donor-dashboard" element={<DonorDashboard />} />
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/track" element={<PatientTracker />} />
            <Route path="/drone-dashboard" element={<DroneDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;