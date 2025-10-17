import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import Loader from '@/components/ui/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isProfileSetup, isInitialized, checkProfileSetup } = useAuthContext();
  const [profileSetupChecked, setProfileSetupChecked] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  useEffect(() => {
    // Wait for initialization to complete
    if (!isInitialized || isLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      setProfileSetupChecked(true);
      setShouldRedirect('/auth/sign-in');
      return;
    }
    // Check profile setup status
    checkProfileSetup().then(() => {
      setProfileSetupChecked(true);
      // Don't check isProfileSetup here - wait for the next useEffect to handle the redirect
    }).catch((error) => {
      setProfileSetupChecked(true);
      setShouldRedirect('/auth/sign-in'); // Redirect to sign-in if profile setup check fails
    });
  }, [isInitialized, isLoading, isAuthenticated, checkProfileSetup, isProfileSetup]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(shouldRedirect);
    }
  }, [shouldRedirect]);

  // Handle redirect after profile setup check is complete and state is updated
  useEffect(() => {
    if (profileSetupChecked && isAuthenticated && !shouldRedirect) {
      if (!isProfileSetup) {
        setShouldRedirect('/profile/setup');
      }
    }
  }, [profileSetupChecked, isAuthenticated, isProfileSetup, shouldRedirect]);

  if (isLoading || !isInitialized || !profileSetupChecked) {
    return <Loader />;
  }

  if (!isAuthenticated || shouldRedirect === '/auth/sign-in') {
    return <Loader />;
  }

  if (!isProfileSetup || shouldRedirect === '/profile/setup') {
    return <Loader />;
  }

  return <>{children}</>;
}
