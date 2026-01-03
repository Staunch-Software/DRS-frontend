import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  // 1. If not logged in, kick to Login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but wrong role (e.g., Shore user trying to access Vessel page)
  if (user.role !== allowedRole) {
    // Redirect them to their own home page
    const correctHome = user.role === 'VESSEL' ? '/vessel' : '/shore';
    return <Navigate to={correctHome} replace />;
  }

  // 3. Access Granted
  return children;
};

export default ProtectedRoute;