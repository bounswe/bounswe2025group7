import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import interestFormService from '../services/interestFormService';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileSetup: boolean;
  isInitialized: boolean;
  setToken: (t: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkProfileSetup: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileSetup, setIsProfileSetup] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthenticated = !!token;

  // Check for existing token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthContext: Checking for existing token on app start');
        const storedToken = await authService.getAccessToken();
        console.log('AuthContext: Existing token found:', storedToken ? 'Token exists' : 'No token');
        
        if (storedToken) {
          // Try to refresh the token to ensure it's still valid
          try {
            console.log('AuthContext: Attempting to refresh token');
            await authService.refreshToken();
            const refreshedToken = await authService.getAccessToken();
            setToken(refreshedToken);
            console.log('AuthContext: Token refreshed and set in context');
          } catch (refreshError) {
            console.log('AuthContext: Token refresh failed, clearing stored tokens');
            await authService.logout();
            setToken(null);
          }
        }
      } catch (error) {
        console.error('AuthContext: Error checking existing token:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('AuthContext: Initial auth check completed');
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login with:', { username, password: '***' });
      const result = await authService.login({ username, password });
      console.log('Login result:', result);
      const newToken = await authService.getAccessToken();
      console.log('Retrieved token:', newToken ? 'Token exists' : 'No token');
      setToken(newToken);
      
      // Check profile setup after successful login
      await checkProfileSetup();
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      console.log('Attempting registration with:', { username, password: '***' });
      const result = await authService.register({ username, password });
      console.log('Registration result:', result);
      const newToken = await authService.getAccessToken();
      console.log('Retrieved token after registration:', newToken ? 'Token exists' : 'No token');
      setToken(newToken);
      
      // New users need to complete profile setup
      setIsProfileSetup(false);
    } catch (error) {
      console.error('Registration error in context:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setToken(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshToken = async () => {
    try {
      await authService.refreshToken();
      const newToken = await authService.getAccessToken();
      setToken(newToken);
    } catch (error) {
      await logout();
      throw error;
    }
  };

  const checkProfileSetup = async () => {
    console.log('AuthContext: Checking profile setup, isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('AuthContext: User not authenticated, setting profile setup to false');
      setIsProfileSetup(false);
      return;
    }

    try {
      console.log('AuthContext: Getting form data to check if profile is complete');
      const formData = await interestFormService.getInterestForm();
      console.log('AuthContext: Form data retrieved:', formData);
      
      // Check if the form has meaningful data (not just null values or empty strings)
      const hasCompleteProfile = formData && 
        (formData as any).name && 
        (formData as any).name.trim() !== '' &&
        (formData as any).surname && 
        (formData as any).surname.trim() !== '' &&
        (formData as any).height && 
        (formData as any).height > 0 &&
        (formData as any).weight && 
        (formData as any).weight > 0 &&
        (formData as any).dateOfBirth && 
        (formData as any).gender && 
        (formData as any).gender.trim() !== '';
      
      console.log('AuthContext: Profile is complete:', hasCompleteProfile);
      console.log('AuthContext: Field details:', {
        name: (formData as any)?.name,
        surname: (formData as any)?.surname,
        height: (formData as any)?.height,
        weight: (formData as any)?.weight,
        dateOfBirth: (formData as any)?.dateOfBirth,
        gender: (formData as any)?.gender
      });
      
      setIsProfileSetup(hasCompleteProfile);
    } catch (error) {
      console.error('AuthContext: Profile setup check failed:', error);
      // If we can't get the form data, assume profile is not complete
      setIsProfileSetup(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        isAuthenticated, 
        isLoading, 
        isProfileSetup,
        isInitialized,
        setToken, 
        login, 
        register, 
        logout, 
        refreshToken,
        checkProfileSetup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}


