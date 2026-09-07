import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const emptyForm = { rating: 0, comment: '' };

export const ReviewStars = ({ value, onChange, interactive = false }) => (
  <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? () => onChange(star) : undefined}
        className={interactive ? 'rounded p-0.5 transition hover:scale-110' : 'p-0.5'}
        aria-label={interactive ? `Rate ${star} out of 5` : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <Star className={`h-5 w-5 ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      </button>
    ))}
  </div>
);

const ReviewSection = ({ booking, review, onReviewChange }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (review && editing) setForm({ rating: review.rating, comment: review.comment });
  }, [review, editing]);

  if (!review && booking.status !== 'Completed') return null;

  const isOwner = review && review.userId?._id === user?._id;
  const submitReview = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = review
        ? await axios.put(`/api/reviews/${review._id}`, form)
        : await axios.post('/api/reviews', { ...form, bookingId: booking._id });
      onReviewChange(data.data);
      setEditing(false);
      setForm(emptyForm);
      setMessage({ type: 'success', text: review ? `${t('common.reviewsTitle')} updated.` : 'Thanks for your review.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to save your review.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async () => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/reviews/${review._id}`);
      onReviewChange(null);
      setMessage({ type: 'success', text: `${t('common.reviewsTitle')} deleted.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Unable to delete your review.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-5 border-t border-slate-100 pt-5">
      {review && !editing ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ReviewStars value={review.rating} />
              <span className="text-sm font-bold text-slate-700">{review.userId?.name || 'Customer'}</span>
            </div>
            <time className="text-xs text-slate-400" dateTime={review.createdAt}>
              {new Date(review.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </time>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
          {isOwner && (
            <div className="mt-3 flex gap-2">
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button onClick={deleteReview} disabled={loading} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submitReview} className="space-y-3">
          <h4 className="text-sm font-extrabold text-slate-800">{review ? `${t('common.edit')} ${t('common.reviewsTitle')}` : 'How was your service?'}</h4>
          <ReviewStars value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} interactive />
          <textarea
            value={form.comment}
            onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
            placeholder="Share your experience"
            rows={3}
            required
            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading || !form.rating} className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? t('common.loading') : review ? t('common.save') : 'Submit review'}
            </button>
            {review && <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">{t('common.cancel')}</button>}
          </div>
        </form>
      )}
      {message.text && <p className={`mt-3 text-xs font-semibold ${message.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>{message.text}</p>}
    </section>
  );
};

export default ReviewSection;