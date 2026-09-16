import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Lock, Save, ShieldAlert } from 'lucide-react';
import SEO from '../components/SEO';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
      <SEO title="Reset Password | Gulab Enterprises Mirgunj" description="Set a new password for your Gulab Enterprises account." path="/reset-password" />
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800">Reset Password</h2>
          <p className="text-slate-400 text-sm">Choose a new password for your account.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-start">
            <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-medium flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1 text-left">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                id="password"
                required
                minLength="8"
                maxLength="128"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                id="confirmPassword"
                required
                minLength="8"
                maxLength="128"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md disabled:opacity-50 text-sm flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:underline font-semibold inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
