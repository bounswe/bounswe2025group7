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
    console.log('ProtectedRoute: Checking authentication and profile setup');
    console.log('ProtectedRoute: isInitialized:', isInitialized);
    console.log('ProtectedRoute: isLoading:', isLoading);
    console.log('ProtectedRoute: isAuthenticated:', isAuthenticated);
    
    // Wait for initialization to complete
    if (!isInitialized || isLoading) {
      console.log('ProtectedRoute: Waiting for initialization to complete');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to sign-in');
      setProfileSetupChecked(true);
      setShouldRedirect('/auth/sign-in');
      return;
    }

    console.log('ProtectedRoute: User authenticated, checking profile setup');
    // Check profile setup status
    checkProfileSetup().then(() => {
      console.log('ProtectedRoute: Profile setup check completed, waiting for state update');
      setProfileSetupChecked(true);
      // Don't check isProfileSetup here - wait for the next useEffect to handle the redirect
    }).catch((error) => {
      console.log('ProtectedRoute: Profile setup check failed:', error);
      console.log('ProtectedRoute: Profile setup check failed, redirecting to sign-in (token likely invalid)');
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
      console.log('ProtectedRoute: Profile setup check completed, checking final status');
      console.log('ProtectedRoute: Final isProfileSetup status:', isProfileSetup);
      
      if (!isProfileSetup) {
        console.log('ProtectedRoute: Profile setup not completed, redirecting to setup');
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
