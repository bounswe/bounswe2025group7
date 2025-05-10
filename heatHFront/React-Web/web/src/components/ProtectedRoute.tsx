import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = !!authService.getAccessToken();
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute; 