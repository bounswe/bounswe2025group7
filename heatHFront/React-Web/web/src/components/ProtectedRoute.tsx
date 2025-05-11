import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import interestFormService from '../services/interestFormService';

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = !!authService.getAccessToken();
  const [firstLoginChecked, setFirstLoginChecked] = useState(false);
  const [firstLogin, setFirstLogin] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setFirstLoginChecked(true);
      return;
    }
    // Check if initial profile setup is done
    interestFormService.checkFirstLogin()
      .then((hasSetup) => {
        setFirstLogin(hasSetup);
        setFirstLoginChecked(true);
      })
      .catch(() => {
        // On error, allow access
        setFirstLogin(true);
        setFirstLoginChecked(true);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  // If the initial profile setup was just completed, allow access
  if (sessionStorage.getItem('profileSetupDone') === 'true') {
    return <Outlet />;
  }
  // Wait until we know if profile has been setup
  if (!firstLoginChecked) {
    return null;
  }
  // If not setup, force to setup page unless already there
  if (!firstLogin && location.pathname !== '/profile/setup') {
    return <Navigate to="/profile/setup" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute; 