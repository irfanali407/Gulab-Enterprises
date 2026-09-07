import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';

// Providers
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import BookService from './pages/BookService';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOtp from './pages/VerifyOtp';
import MyBookings from './pages/MyBookings';
import Reviews from './pages/Reviews';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import ServicePage from './pages/ServicePage';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const PageVisitTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const page = location.pathname;

    if (page.startsWith('/admin')) {
      return;
    }

    axios.post('/api/analytics', { type: 'visit', page }).catch(() => {});
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <PageVisitTracker />
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            {/* Header Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/book" element={<BookService />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/services/:serviceSlug" element={<ServicePage />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* User Protected Routes */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminBookings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
