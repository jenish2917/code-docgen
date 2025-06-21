import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../utils/auth';

/**
 * ProtectedRoute component that checks if user is logged in
 * Redirects to login page if not authenticated
 */
const ProtectedRoute = () => {
  const isLoggedIn = AuthService.isLoggedIn();
  
  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
