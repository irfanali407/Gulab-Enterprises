import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, ArrowLeft, Search, Calendar, User, Phone, MapPin, Trash2, SlidersHorizontal } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering state
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings');
      setBookings(data);
      setFilteredBookings(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookings. Make sure you are signed in as Admin.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = bookings;

    if (statusFilter !== 'All') {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.phone.includes(query) ||
          b.address.toLowerCase().includes(query) ||
          b.serviceType.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(result);
  }, [searchQuery, statusFilter, bookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setActionLoadingId(bookingId);
    try {
      const { data } = await axios.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: data.status } : b))
      );
      setActionLoadingId(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update booking status.');
      setActionLoadingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to permanently delete this booking?')) {
      return;
    }

    setActionLoadingId(bookingId);
    try {
      await axios.delete(`/api/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setActionLoadingId(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete booking.');
      setActionLoadingId(null);
    }
  };

  const statusOptions = ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'];

  return (
    <div className="bg-slate-50 min-h-screen py-12 text-left">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Back Link & Header */}
        <div className="flex items-center space-x-2 mb-6">
          <Link to="/admin" className="text-slate-500 hover:text-primary-600 transition flex items-center text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center">
            <Shield className="w-8 h-8 text-primary-600 mr-2" />
            Manage Service Bookings
          </h1>
          <p className="text-slate-550 text-slate-400 text-sm mt-1">
            Track and process customer service requests
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 border border-red-150 font-medium">
            {error}
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full lg:max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search customer, phone, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>

          {/* Filter Status select tabs */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
            <div className="flex items-center text-slate-500 text-xs font-bold mr-1 uppercase">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" /> Filter Status:
            </div>
            {['All', ...statusOptions].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-650 hover:bg-slate-200 hover:text-slate-700 text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-250 border-slate-200 shadow-sm">
            <p className="text-slate-400 text-base font-semibold">No bookings match the filter criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition duration-150 hover:shadow-md"
              >
                {/* Details card */}
                <div className="flex-1 text-left space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-extrabold text-slate-800">
                      {booking.serviceType}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      booking.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                      booking.status === 'Approved' ? 'bg-blue-50 text-blue-700' :
                      booking.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700' :
                      booking.status === 'Completed' ? 'bg-emerald-50 text-accent-green' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-550 text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <span>
                        {new Date(booking.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <span>{booking.name} (Account: {booking.userId?.name || 'Unknown'})</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <span>{booking.phone}</span>
                    </div>
                    <div className="flex items-start sm:col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0 mt-0.5" />
                      <span>{booking.address}</span>
                    </div>
                  </div>
                </div>

                {/* Control Panel Actions */}
                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 lg:border-none pt-4 lg:pt-0">
                  <div className="flex flex-col text-left space-y-1 w-full sm:w-auto">
                    <label htmlFor={`status-${booking._id}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Update Status
                    </label>
                    <select
                      id={`status-${booking._id}`}
                      value={booking.status}
                      disabled={actionLoadingId === booking._id}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 focus:bg-white text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition cursor-pointer"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    disabled={actionLoadingId === booking._id}
                    className="mt-4 sm:mt-0 p-2.5 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 text-red-600 rounded-xl transition border border-red-100 self-end"
                    title="Delete booking"
                  >
                    <Trash2 className="w-4.5 h-4.5 w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
