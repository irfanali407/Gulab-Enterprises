import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, CalendarDays, Clock, AlertCircle, ArrowRight, LockKeyhole, Trash2, Eye, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    totalBookings: 0,
    todayVisitors: 0,
    todayBookings: 0,
  });
  const [serviceForm, setServiceForm] = useState({ slug: '', name: '', description: '', price: '' });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceMessage, setServiceMessage] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [savingService, setSavingService] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, servicesRes, analyticsRes] = await Promise.all([
          axios.get('/api/bookings'),
          axios.get('/api/services/admin'),
          axios.get('/api/analytics/stats'),
        ]);
        setBookings(bookingsRes.data);
        setServices(servicesRes.data);
        setAnalytics(analyticsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch administrative data. Make sure you are logged in as an Admin.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    setChangingPassword(true);
    try {
      const { data } = await axios.put('/api/admin/change-password', passwordForm);
      setPasswordMessage(data.message);
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (requestError) {
      setPasswordError(requestError.response?.data?.message || 'Unable to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const resetServiceForm = () => {
    setServiceForm({ slug: '', name: '', description: '', price: '' });
    setEditingServiceId(null);
  };

  const handleServiceSubmit = async (event) => {
    event.preventDefault();
    setServiceMessage('');
    setServiceError('');
    setSavingService(true);
    try {
      const payload = { ...serviceForm, price: Number(serviceForm.price) };
      const { data } = editingServiceId
        ? await axios.put(`/api/services/${editingServiceId}`, payload)
        : await axios.post('/api/services', payload);
      setServices((current) => editingServiceId
        ? current.map((service) => (service._id === data._id ? data : service))
        : [...current, data]);
      setServiceMessage(editingServiceId ? 'Service updated successfully.' : 'Service added successfully.');
      resetServiceForm();
    } catch (requestError) {
      setServiceError(requestError.response?.data?.message || 'Unable to save service');
    } finally {
      setSavingService(false);
    }
  };

  const editServicePrice = (service) => {
    setEditingServiceId(service._id);
    setServiceForm({
      slug: service.slug,
      name: service.name,
      description: service.description,
      price: service.price,
    });
    setServiceMessage('');
    setServiceError('');
  };

  const handleServiceDelete = async (service) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setServiceMessage('');
    setServiceError('');
    setDeletingServiceId(service._id);
    try {
      await axios.delete(`/api/services/${service._id}`);
      setServices((current) => current.filter((item) => item._id !== service._id));
      if (editingServiceId === service._id) {
        resetServiceForm();
      }
      setServiceMessage('Service deleted successfully.');
    } catch (requestError) {
      setServiceError(requestError.response?.data?.message || 'Unable to delete service');
    } finally {
      setDeletingServiceId(null);
    }
  };

  // Compute stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const inProgressBookings = bookings.filter((b) => b.status === 'In Progress').length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed').length;
  const conversionRate = analytics.totalVisitors > 0
    ? ((analytics.totalBookings / analytics.totalVisitors) * 100).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Section Header & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center">
              <Shield className="w-8 h-8 text-primary-600 mr-2" />
              Admin Portal
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Gulab Enterprises Mirgunj Control Center
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/bookings"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow"
            >
              Manage Bookings
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 border border-red-150 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Visitors</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{analytics.totalVisitors}</h3>
              <p className="text-xs text-slate-400 mt-1">{analytics.todayVisitors} today</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tracked Bookings</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{analytics.totalBookings}</h3>
              <p className="text-xs text-slate-400 mt-1">{analytics.todayBookings} today</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Conversion Rate</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{conversionRate}%</h3>
              <p className="text-xs text-slate-400 mt-1">Bookings / visitors</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Today Visitors</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{analytics.todayVisitors}</h3>
              <p className="text-xs text-slate-400 mt-1">Daily activity</p>
            </div>
          </div>
        </div>

        {/* Stats Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Total Bookings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalBookings}</h3>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{pendingBookings}</h3>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-650 text-indigo-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">{inProgressBookings}</h3>
            </div>
          </div>

        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Bookings List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-800">Recent Service Bookings</h2>
              <Link to="/admin/bookings" className="text-primary-600 hover:text-primary-850 text-sm font-bold flex items-center transition">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <p className="text-slate-400 py-6 text-center text-sm font-medium">No booking requests available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 font-bold">
                      <th className="py-3 px-1.5 uppercase text-xs">Customer</th>
                      <th className="py-3 px-1.5 uppercase text-xs">Service</th>
                      <th className="py-3 px-1.5 uppercase text-xs">Date</th>
                      <th className="py-3 px-1.5 uppercase text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3.5 px-1.5">
                          <p className="font-semibold text-slate-800">{booking.name}</p>
                          <p className="text-xs text-slate-400">{booking.phone}</p>
                        </td>
                        <td className="py-3.5 px-1.5 font-medium text-slate-700">{booking.serviceType}</td>
                        <td className="py-3.5 px-1.5 text-slate-500">
                          {new Date(booking.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-1.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            booking.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                            booking.status === 'Approved' ? 'bg-blue-50 text-blue-700' :
                            booking.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700' :
                            booking.status === 'Completed' ? 'bg-emerald-50 text-accent-green' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center mb-4">
                <LockKeyhole className="w-5 h-5 text-primary-600 mr-2" />
                Change Password
              </h3>
              {passwordMessage && <p className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-3 text-sm mb-4">{passwordMessage}</p>}
              {passwordError && <p className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm mb-4">{passwordError}</p>}
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Current password"
                  value={passwordForm.oldPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, oldPassword: event.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" disabled={changingPassword} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50">
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
            <div className="bg-gradient-to-br from-primary-750 from-primary-700 to-primary-850 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-lg font-extrabold mb-3">Service Management</h3>
              <p className="text-xs text-primary-100 leading-relaxed mb-6">
                Directly approve service queries, update dispatch statuses for technicians, and maintain records. Ensure customer complaints are addressed promptly.
              </p>
              <Link
                to="/admin/bookings"
                className="w-full bg-white text-primary-700 hover:bg-slate-100 py-3 rounded-xl text-center text-sm font-bold transition shadow-sm"
              >
                Launch Bookings Manager
              </Link>
            </div>

          </div>

        </div>

        <section className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6" aria-labelledby="service-management-title">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="service-management-title" className="text-xl font-extrabold text-slate-800">Manage Services & Prices</h2>
              <p className="text-sm text-slate-500">Add services or update the prices shown on the website.</p>
            </div>
            {editingServiceId && <button type="button" onClick={resetServiceForm} className="text-sm font-bold text-slate-500 hover:text-primary-600">Cancel editing</button>}
          </div>

          {serviceMessage && <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{serviceMessage}</p>}
          {serviceError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{serviceError}</p>}

          <form onSubmit={handleServiceSubmit} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input required disabled={Boolean(editingServiceId)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="Slug (for example: ac-repair)" value={serviceForm.slug} onChange={(event) => setServiceForm({ ...serviceForm, slug: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60" />
            <input required placeholder="Service name" value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input required min="0" step="1" type="number" placeholder="Starting price (₹)" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input required placeholder="Short service description" value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <button type="submit" disabled={savingService} className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50 md:col-span-2">{savingService ? 'Saving...' : editingServiceId ? 'Update Service' : 'Add Service'}</button>
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400"><th className="px-2 py-3">Service</th><th className="px-2 py-3">Price</th><th className="px-2 py-3 text-right">Actions</th></tr></thead>
              <tbody>{services.map((service) => <tr key={service._id} className="border-b border-slate-50"><td className="px-2 py-3"><p className="font-bold text-slate-800">{service.name}</p><p className="text-xs text-slate-400">{service.slug}</p></td><td className="px-2 py-3 font-semibold text-accent-green">Starting at ₹{service.price}</td><td className="px-2 py-3"><div className="flex items-center justify-end gap-3"><button type="button" onClick={() => editServicePrice(service)} className="font-bold text-primary-600 hover:text-primary-800">Edit</button><button type="button" onClick={() => handleServiceDelete(service)} disabled={deletingServiceId === service._id} aria-label={`Delete ${service.name}`} title="Delete service" className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;
