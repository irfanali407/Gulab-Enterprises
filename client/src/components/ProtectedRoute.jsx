import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-screen bg-slate-50">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect them to login page
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    // Redirect them to homepage if they are not an admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
