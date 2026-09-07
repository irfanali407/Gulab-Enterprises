import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Shield, CalendarDays, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.book'), path: '/book', icon: <CalendarDays className="w-4 h-4 mr-1 inline" /> },
    { name: t('nav.reviews'), path: '/reviews', icon: <Star className="w-4 h-4 mr-1 inline" /> },
    { name: 'FAQ', path: '/faq' },
  ];

  const toggleLanguage = () => changeLanguage(i18n.language === 'en' ? 'hi' : 'en');

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 p-2 rounded-lg text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight leading-none">
                  GULAB
                </span>
                <span className="text-xs text-primary-600 font-bold tracking-wider">
                  ENTERPRISES
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 hover:text-primary-600 font-medium transition duration-150 flex items-center"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}

            <button onClick={toggleLanguage} aria-label={t('nav.language')} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-extrabold text-primary-600 hover:bg-primary-50">
              {i18n.language === 'en' ? 'हिंदी' : 'EN'}
            </button>
            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center space-x-4">
                {user.isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center bg-slate-100 text-slate-700 hover:bg-primary-50 hover:text-primary-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                  >
                    <Shield className="w-4 h-4 mr-1 text-primary-600" />
                    {t('nav.admin')}
                  </Link>
                ) : (
                  <Link
                    to="/my-bookings"
                    className="text-slate-600 hover:text-primary-600 text-sm font-medium transition"
                  >
                    {t('nav.myBookings')}
                  </Link>
                )}
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <User className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-500 hover:text-red-700 font-medium text-sm transition"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-primary-600 font-medium text-sm transition"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-4">
            <button onClick={toggleLanguage} aria-label={t('nav.language')} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-extrabold text-primary-600">{i18n.language === 'en' ? 'हिंदी' : 'EN'}</button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-primary-600 focus:outline-none p-1"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-slate-700 hover:bg-slate-50 hover:text-primary-600 px-3 py-2 rounded-md font-medium text-base transition"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="pt-4 border-t border-slate-100 px-3 mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 mb-2">
                  <User className="w-5 h-5 text-primary-500" />
                  <span className="font-semibold">{user.name}</span>
                </div>
                {user.isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block bg-slate-100 text-slate-700 px-3 py-2 rounded-md text-base font-semibold hover:bg-primary-50 hover:text-primary-600 transition"
                  >
                    {t('nav.admin')}
                  </Link>
                ) : (
                  <Link
                    to="/my-bookings"
                    onClick={() => setIsOpen(false)}
                    className="block text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-md text-base font-medium transition"
                  >
                    {t('nav.myBookings')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center text-red-500 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium transition text-left"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2 px-3 mt-4">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-slate-700 hover:bg-slate-50 py-2 rounded-md font-medium text-base transition"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center bg-primary-600 text-white py-2 rounded-md font-semibold text-base hover:bg-primary-700 transition shadow-sm"
                >
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
