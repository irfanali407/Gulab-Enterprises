import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, MapPin, Phone, User, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const BookService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    serviceType: 'RO Service',
    date: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Extract service type query parameter if passed from home page click
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      const decodedType = decodeURIComponent(typeParam);
      const validTypes = [
        'RO Service',
        'Washing Machine Repair',
        'AC Service',
        'Refrigerator Repair',
        'Microwave Repair',
      ];
      if (validTypes.includes(decodedType)) {
        setFormData((prev) => ({ ...prev, serviceType: decodedType }));
      }
    }
    // Pre-populate name if user is logged in
    if (user) {
      setFormData((prev) => ({ ...prev, name: user.name }));
    }
  }, [searchParams, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError(t('booking.authRequired'));
      return;
    }

    const { name, phone, address, serviceType, date } = formData;
    if (!name || !phone || !address || !serviceType || !date) {
      setError(t('booking.required'));
      return;
    }

    // Verify date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError(t('booking.futureDate'));
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/bookings', { ...formData, language: i18n.language === 'hi' ? 'hi' : 'en' });
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to place booking. Please try again.');
      setLoading(false);
    }
  };

  // Get tomorrow's date string for min date boundary in calendar input
  const getMinDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <SEO
        title="Book Appliance Repair Service in Mirgunj | Gulab Enterprises"
        description="Schedule RO repair, AC service, washing machine, refrigerator, or geyser service in Mirgunj with Gulab Enterprises."
        path="/book"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {success ? (
          /* Success Screen */
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-accent-green rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800">{t('booking.success')}</h2>
              <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                {t('booking.successText')}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl max-w-md mx-auto text-left border border-slate-150 space-y-2 text-sm">
              <p className="text-slate-700">
                <span className="font-bold text-slate-500">{t('booking.serviceLabel')}</span> {formData.serviceType}
              </p>
              <p className="text-slate-700">
                <span className="font-bold text-slate-500">{t('booking.dateLabel')}</span>{' '}
                {new Date(formData.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {t('booking.status')} <span className="font-extrabold text-primary-600 bg-blue-50 px-2 py-0.5 rounded">{t('booking.pending')}</span>
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/my-bookings')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition duration-150 flex items-center justify-center text-sm shadow-sm"
              >
                {t('booking.myBookings')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    name: user ? user.name : '',
                    phone: '',
                    address: '',
                    serviceType: 'RO Service',
                    date: '',
                  });
                }}
                className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition duration-150 text-sm"
              >
                {t('booking.another')}
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white px-8 py-8 text-left">
              <h2 className="text-2xl font-extrabold">{t('booking.title')}</h2>
              <p className="text-primary-100 text-sm mt-1">
                {t('booking.subtitle')}
              </p>
            </div>

            <div className="p-8">
              {/* Not Logged In Banner */}
              {!user && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span>{t('booking.signIn')}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/login?redirect=book')}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs transition"
                    >
                      {t('booking.login')}
                    </button>
                    <button
                      onClick={() => navigate('/register?redirect=book')}
                      className="bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 px-3.5 py-1.5 rounded-lg font-bold text-xs transition"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm mb-6 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-1 text-left">
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('booking.name')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder={t('booking.namePlaceholder')}
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!user}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="space-y-1 text-left">
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('booking.phone')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-5 h-5" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      placeholder={t('booking.phonePlaceholder')}
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!user}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Service Type Dropdown */}
                <div className="space-y-1 text-left">
                  <label htmlFor="serviceType" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('booking.service')}
                  </label>
                  <select
                    name="serviceType"
                    id="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    disabled={!user}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-65"
                  >
                    <option value="RO Service">RO Water Purifier Service</option>
                    <option value="AC Service">Air Conditioner (AC) Service</option>
                    <option value="Washing Machine Repair">Washing Machine Repair</option>
                    <option value="Refrigerator Repair">Refrigerator Repair</option>
                    <option value="Microwave Repair">Microwave Repair</option>
                  </select>
                </div>

                {/* Preferred Date */}
                <div className="space-y-1 text-left">
                  <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('booking.date')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <CalendarDays className="w-5 h-5" />
                    </span>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      required
                      min={getMinDateStr()}
                      value={formData.date}
                      onChange={handleChange}
                      disabled={!user}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Service Address */}
                <div className="space-y-1 text-left">
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('booking.address')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </span>
                    <textarea
                      name="address"
                      id="address"
                      required
                      rows="3"
                      placeholder={t('booking.addressPlaceholder')}
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!user}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    ></textarea>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !user}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? t('booking.submitting') : t('booking.submit')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookService;
