import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Check if user's role is in the allowed list
  // allowedRoles might be ['SHORE', 'ADMIN']
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If Admin tries to go to /vessel, or Crew tries to go to /shore -> Block them
    return <div className="p-10 text-center text-red-500">Access Denied: You do not have permission to view this page.</div>;
  }

  return children;
};

export default ProtectedRoute;