import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, ShieldAlert, MailCheck } from 'lucide-react';
import SEO from '../components/SEO';

const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!email || !/^\d{6}$/.test(otp)) {
      setStatus('error');
      setMessage('Enter a valid email and 6-digit verification code.');
      return;
    }

    setStatus('loading');
    try {
      const { data } = await axios.post('/api/auth/verify-otp', { email, otp });
      setStatus('success');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Unable to verify the code.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
      <SEO title="Verify Email | Gulab Enterprises" description="Verify your Gulab Enterprises account with the code sent to your email." path="/verify-otp" />
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
        {status === 'success' ? <CheckCircle className="w-12 h-12 mx-auto text-green-600" /> : <MailCheck className="w-12 h-12 mx-auto text-primary-600" />}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-800">Verify your email</h1>
          <p className="text-slate-500 text-sm">Enter the 6-digit code sent to your email. It expires in 5 minutes.</p>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-start text-left">
            <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {status === 'success' && <p className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-medium">{message}</p>}

        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <label htmlFor="verification-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <input id="verification-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-slate-500">Verification Code</label>
            <input id="otp" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <button type="submit" disabled={status === 'loading'} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition disabled:opacity-50">{status === 'loading' ? 'Verifying...' : 'Verify Email'}</button>
          </form>
        )}

        {status === 'success' && <button type="button" onClick={() => navigate('/login')} className="text-primary-600 font-bold hover:underline">Continue to sign in</button>}
        <p><Link to="/register" className="text-sm text-slate-500 hover:underline">Back to signup</Link></p>
      </div>
    </div>
  );
};

export default VerifyOtp;
