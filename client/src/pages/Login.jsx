import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract where to redirect after login (default is /)
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      navigate(`/${redirect}`, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('booking.required'));
      return;
    }

    setLoading(true);
    const result = await login(email, password);

    if (result.success) {
      navigate(`/${redirect}`, { replace: true });
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
      <SEO title="Sign In | Gulab Enterprises Mirgunj" description="Sign in to manage your Gulab Enterprises service bookings in Mirgunj." path="/login" />
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800">{t('auth.signIn')}</h2>
          <p className="text-slate-550 text-slate-400 text-sm">
            Access your bookings and purchases at Gulab Enterprises
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-start">
            <ShieldAlert className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-1 text-left">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('auth.email')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                id="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 text-left">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('auth.password')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                id="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center justify-center"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline font-semibold">
            Forgot Password?
          </Link>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500">
            {t('auth.newUser')}{' '}
            <Link
              to={`/register${redirect ? `?redirect=${redirect}` : ''}`}
              className="text-primary-600 hover:underline font-bold"
            >
              {t('auth.signUpHere')}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
