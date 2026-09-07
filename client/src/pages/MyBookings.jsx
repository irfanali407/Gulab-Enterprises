import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Phone, User, Trash2, ShieldAlert } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';
import { useTranslation } from 'react-i18next';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { t } = useTranslation();

  const fetchMyBookings = async () => {
    try {
      const [{ data: bookingData }, { data: reviewData }] = await Promise.all([
        axios.get('/api/bookings/my'),
        axios.get('/api/reviews'),
      ]);
      setBookings(bookingData);
      setReviews(reviewData.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your bookings. Please try again.');
      setLoading(false);
    }
  };

  const updateReview = (bookingId, review) => {
    setReviews((current) => [
      ...current.filter((item) => item.bookingId !== bookingId),
      ...(review ? [review] : []),
    ]);
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setActionLoadingId(bookingId);
    try {
      await axios.delete(`/api/bookings/${bookingId}`);
      // Refresh list
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setActionLoadingId(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel booking.');
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-amber-50 text-amber-700 border border-amber-250 border-amber-200',
      Approved: 'bg-blue-50 text-blue-700 border border-blue-200',
      'In Progress': 'bg-indigo-50 text-indigo-755 text-indigo-600 border border-indigo-200',
      Completed: 'bg-emerald-50 text-accent-green border border-emerald-250 border-emerald-250',
      Cancelled: 'bg-red-50 text-red-700 border border-red-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badges[status] || 'bg-slate-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-8">{t('nav.myBookings')}</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 border border-red-150 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <p className="text-slate-400 font-medium text-lg">You have no booking requests yet.</p>
            <a
              href="/book"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition duration-150 text-sm shadow-sm"
            >
              Book First Service
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-3xl border border-slate-150 border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition duration-200 hover:shadow-md"
              >
                {/* Details */}
                <div className="space-y-4 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-extrabold text-slate-800">
                      {booking.serviceType}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <span>
                        {new Date(booking.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <span>{booking.name}</span>
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
                  <ReviewSection
                    booking={booking}
                    review={reviews.find((review) => review.bookingId === booking._id)}
                    onReviewChange={(review) => updateReview(booking._id, review)}
                  />
                </div>

                {/* Actions */}
                {booking.status === 'Pending' && (
                  <div className="shrink-0 flex items-center">
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={actionLoadingId === booking._id}
                      className="w-full md:w-auto flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-extrabold transition border border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      {actionLoadingId === booking._id ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
