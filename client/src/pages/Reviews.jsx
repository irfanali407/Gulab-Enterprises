import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, ChevronLeft, ChevronRight, Filter, Pencil, Star, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ReviewStars } from '../components/ReviewSection';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const services = [
  'RO Service',
  'Washing Machine Repair',
  'AC Service',
  'Refrigerator Repair',
  'Geyser Repair',
];

const emptyForm = { rating: 0, comment: '' };

const Reviews = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('bookingId');
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ serviceType: '', rating: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 8 };
      if (filters.rating) params.rating = filters.rating;
      if (filters.serviceType) params.serviceType = filters.serviceType;
      const { data } = await axios.get('/api/reviews', {
        params,
      });
      setReviews(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [filters.serviceType, filters.rating]);

  const isOwner = (review) => review.userId?._id === user?._id;

  const submitReview = async (event) => {
    event.preventDefault();
    setSubmitLoading(true);
    try {
      await axios.post('/api/reviews', { ...form, bookingId });
      setToast({ type: 'success', text: 'Review submitted successfully.' });
      setForm(emptyForm);
      window.history.replaceState({}, '', '/reviews');
      fetchReviews(1);
    } catch (requestError) {
      setToast({ type: 'error', text: requestError.response?.data?.message || 'Unable to submit review.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const startEditing = (review) => {
    setEditing(review);
    setForm({ rating: review.rating, comment: review.comment });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.put(`/api/reviews/${editing._id}`, form);
      setReviews((current) => current.map((review) => (review._id === editing._id ? data.data : review)));
      setEditing(null);
      setToast({ type: 'success', text: 'Review updated successfully.' });
    } catch (requestError) {
      setToast({ type: 'error', text: requestError.response?.data?.message || 'Unable to update review.' });
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/reviews/${deleteTarget._id}`);
      setDeleteTarget(null);
      setToast({ type: 'success', text: 'Review deleted successfully.' });
      fetchReviews(reviews.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page);
    } catch (requestError) {
      setDeleteTarget(null);
      setToast({ type: 'error', text: requestError.response?.data?.message || 'Unable to delete review.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-primary-600">Customer voice</p>
            <h1 className="text-3xl font-extrabold text-slate-800">{t('common.reviewsTitle')}</h1>
            <p className="mt-2 text-slate-500">{t('common.reviewsIntro')}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
            {pagination.total} {pagination.total === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600"><Filter className="h-4 w-4 text-primary-600" /> {t('common.filter')}</div>
          <select value={filters.serviceType} onChange={(event) => setFilters((current) => ({ ...current, serviceType: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-primary-500">
            <option value="">{t('common.all')} services</option>
            {services.map((service) => <option key={service} value={service}>{service}</option>)}
          </select>
          <select value={filters.rating} onChange={(event) => setFilters((current) => ({ ...current, rating: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-primary-500">
            <option value="">{t('common.all')} ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
          </select>
        </div>

        {bookingId && user && (
          <form onSubmit={submitReview} className="mb-6 rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-800">Rate Your Experience</h2>
            <p className="mt-1 text-sm text-slate-500">Share your feedback about this completed service.</p>
            <div className="mt-4"><ReviewStars value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} interactive /></div>
            <textarea required rows={3} value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Tell us about your experience" className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary-500" />
            <button type="submit" disabled={submitLoading || !form.rating} className="mt-3 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitLoading ? 'Submitting...' : 'Submit review'}</button>
          </form>
        )}
        {bookingId && !user && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Please sign in to submit your review.</div>}

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
        {loading ? (
          <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600" /></div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><Star className="mx-auto mb-3 h-9 w-9 text-amber-400" /><p className="font-bold text-slate-600">{t('common.noReviews')}</p></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 font-extrabold text-primary-700">{(review.userId?.name || 'C')[0].toUpperCase()}</div><div><p className="font-extrabold text-slate-800">{review.userId?.name || 'Customer'}</p><p className="text-xs text-slate-400">{review.serviceType}</p></div></div>
                  <ReviewStars value={review.rating} />
                </div>
                <p className="mt-4 leading-6 text-slate-600">{review.comment}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><time className="text-xs text-slate-400" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time><div className="flex gap-2">{isOwner(review) && <button onClick={() => startEditing(review)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600"><Pencil className="h-3.5 w-3.5" /> Edit</button>}{(isOwner(review) || user?.isAdmin) && <button onClick={() => setDeleteTarget(review)} className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>}</div></div>
              </article>
            ))}
          </div>
        )}

        {pagination.pages > 1 && <div className="mt-8 flex items-center justify-center gap-4"><button disabled={pagination.page <= 1 || loading} onClick={() => fetchReviews(pagination.page - 1)} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button><span className="text-sm font-bold text-slate-500">Page {pagination.page} of {pagination.pages}</span><button disabled={pagination.page >= pagination.pages || loading} onClick={() => fetchReviews(pagination.page + 1)} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button></div>}
      </div>

      {editing && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={saveEdit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-800">Edit review</h2><button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5 text-slate-400" /></button></div><ReviewStars value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} interactive /><textarea required rows={4} value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary-500" /><button className="mt-4 w-full rounded-xl bg-primary-600 py-3 text-sm font-extrabold text-white">Save changes</button></form></div>}
      {deleteTarget && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"><div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-extrabold text-slate-800">Delete this review?</h2><p className="mt-2 text-sm text-slate-500">This action cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button onClick={confirmDelete} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white">Delete</button></div></div></div>}
      {toast && <div role="status" className={`fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}><CheckCircle className="h-4 w-4" /> {toast.text}<button onClick={() => setToast(null)}><X className="h-4 w-4" /></button></div>}
    </div>
  );
};

export default Reviews;
