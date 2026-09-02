import React, { useState, useEffect, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  HeartHandshake,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Activity,
  Download,
} from "lucide-react";
import { downloadDonationCertificate } from "../utils/generateCertificate";

const DonorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [eligibility, setEligibility] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    bloodBankId: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    timeSlot: "10:00 AM - 11:00 AM",
    notes: "Regular voluntary donation",
  });

  const fetchData = async () => {
    try {
      const [eligRes, appRes, banksRes] = await Promise.all([
        API.get("/donors/eligibility"),
        API.get("/donors/appointments"),
        API.get("/auth/blood-banks"),
      ]);

      setEligibility(eligRes.data);
      setAppointments(appRes.data.appointments || []);

      const banks = banksRes.data.bloodBanks || [];
      setBloodBanks(banks);

      if (banks.length > 0) {
        setBookingData((prev) => ({
          ...prev,
          bloodBankId: prev.bloodBankId || banks[0]._id,
        }));
      }
    } catch (err) {
      console.error("Error fetching donor dashboard data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();

    if (!bookingData.bloodBankId) {
      setMessage({
        type: "error",
        text: "No registered Blood Bank found. Please register a Blood Bank account first!",
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await API.post("/donors/book-slot", bookingData);
      setMessage({
        type: "success",
        text: "Donation Appointment Slot Booked Successfully!",
      });
      fetchData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to book slot",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 px-6 py-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-wide">
              <HeartHandshake
                className="text-red-500 animate-pulse"
                size={32}
              />
              Donor Portal & Lifecycle Tracking
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Welcome back,{" "}
              <span className="text-slate-200 font-semibold">{user?.name}</span>{" "}
              | Blood Group:{" "}
              <span className="text-red-400 font-extrabold">
                {user?.bloodGroup || "O+"}
              </span>
            </p>
          </div>
        </div>

        {/* Eligibility Banner */}
        {eligibility && (
          <div
            className={`p-6 rounded-3xl border flex items-center justify-between ${eligibility.isEligible ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"}`}
          >
            <div className="flex items-center gap-4">
              {eligibility.isEligible ? (
                <CheckCircle2 size={36} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={36} className="text-amber-400 shrink-0" />
              )}
              <div>
                <h2 className="text-lg font-bold text-white">
                  {eligibility.isEligible
                    ? "You are Eligible to Donate Blood!"
                    : "Donation Cooldown Active"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {eligibility.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Appointment Form */}
          <div className="bg-[#151924] border border-slate-800 p-6 rounded-3xl shadow-xl h-fit space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Calendar className="text-red-500" size={20} />
              Schedule Donation Slot
            </h2>

            {message && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold ${message.type === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleBookSlot} className="space-y-4">
              <div>
                <label className="text-slate-300 text-xs font-medium uppercase block mb-1">
                  Select Blood Bank Facility
                </label>
                {bloodBanks.length > 0 ? (
                  <select
                    name="bloodBankId"
                    value={bookingData.bloodBankId}
                    onChange={handleChange}
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="">-- Choose Blood Bank Facility --</option>
                    {bloodBanks.map((bank) => (
                      <option key={bank._id} value={bank._id}>
                        {bank.facilityName
                          ? `${bank.facilityName} (${bank.name})`
                          : bank.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                    No Blood Bank account registered in system yet. Register a
                    Blood Bank account first.
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 text-xs font-medium uppercase block mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  required
                  value={bookingData.appointmentDate}
                  onChange={handleChange}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>

              <div>
                <label className="text-slate-300 text-xs font-medium uppercase block mb-1">
                  Time Slot
                </label>
                <select
                  name="timeSlot"
                  value={bookingData.timeSlot}
                  onChange={handleChange}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                >
                  <option value="09:00 AM - 10:00 AM">
                    09:00 AM - 10:00 AM
                  </option>
                  <option value="10:00 AM - 11:00 AM">
                    10:00 AM - 11:00 AM
                  </option>
                  <option value="11:00 AM - 12:00 PM">
                    11:00 AM - 12:00 PM
                  </option>
                  <option value="02:00 PM - 03:00 PM">
                    02:00 PM - 03:00 PM
                  </option>
                  <option value="04:00 PM - 05:00 PM">
                    04:00 PM - 05:00 PM
                  </option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-xs font-medium uppercase block mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={bookingData.notes}
                  onChange={handleChange}
                  placeholder="Any health remarks..."
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  bloodBanks.length === 0 ||
                  (eligibility && !eligibility.isEligible)
                }
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-red-900/30 mt-2 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading ? (
                  <Activity className="animate-spin" size={16} />
                ) : null}
                {loading ? "Confirming..." : "Confirm Slot Booking"}
              </button>
            </form>
          </div>

          {/* Scheduled Appointments History */}
          <div className="lg:col-span-2 bg-[#151924] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Clock className="text-red-500" size={20} />
              Your Booked Donation Appointments
            </h2>

            {appointments.length === 0 ? (
              <p className="text-slate-500 text-xs sm:text-sm text-center py-8">
                No past or upcoming donation appointments found.
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.map((app) => (
                  <div
                    key={app._id}
                    className="bg-[#0b0e14] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm">
                          {app.bloodBank?.facilityName ||
                            app.bloodBank?.name ||
                            "Regional Blood Center"}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Date:{" "}
                          <span className="text-slate-200 font-medium">
                            {new Date(app.appointmentDate).toLocaleDateString()}
                          </span>{" "}
                          | Slot:{" "}
                          <span className="text-slate-200 font-medium">
                            {app.timeSlot}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          app.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {app.status}
                      </span>

                      {app.status === "Completed" && (
                        <button
                          onClick={() =>
                            downloadDonationCertificate(
                              user?.name || "Donor",
                              user?.bloodGroup || "O+",
                              app.appointmentDate,
                              app.bloodBank?.facilityName || "Regional Center",
                            )
                          }
                          className="bg-[#151924] hover:bg-slate-800 text-red-400 border border-red-500/30 font-bold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 active:scale-95"
                          title="Download Official Certificate"
                        >
                          <Download size={14} /> Certificate
                        </button>
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
  );
};

export default DonorDashboard;
