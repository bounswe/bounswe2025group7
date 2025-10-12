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
  
  // Debug: Log authentication state changes
  useEffect(() => {
    console.log('AuthContext: Authentication state changed - token:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token', 'isAuthenticated:', isAuthenticated);
    
    // Debug: Decode token to see which user it belongs to
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('AuthContext: Token belongs to user:', payload.sub);
        console.log('AuthContext: Token issued at:', new Date(payload.iat * 1000));
        console.log('AuthContext: Token expires at:', new Date(payload.exp * 1000));
      } catch (e) {
        console.log('AuthContext: Could not decode token:', e);
      }
    }
    
    // Check if there's a mismatch between token state and actual stored token
    if (isAuthenticated && !token) {
      console.log('AuthContext: WARNING - isAuthenticated is true but token is null!');
    }
    if (!isAuthenticated && token) {
      console.log('AuthContext: WARNING - isAuthenticated is false but token exists!');
    }
  }, [token, isAuthenticated]);

  // Check for existing token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthContext: Checking for existing token on app start');
        const storedToken = await authService.getAccessToken();
        console.log('AuthContext: Existing token found:', storedToken ? 'Token exists' : 'No token');
        
        if (storedToken) {
          // Debug: Decode the existing token
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            console.log('AuthContext: Existing token is for user:', payload.sub);
            console.log('AuthContext: Existing token issued at:', new Date(payload.iat * 1000));
            console.log('AuthContext: Existing token expires at:', new Date(payload.exp * 1000));
            
            // Check if token is expired
            const now = new Date();
            const expDate = new Date(payload.exp * 1000);
            const isExpired = now > expDate;
            console.log('AuthContext: Token is expired:', isExpired);
            
            if (isExpired) {
              console.log('AuthContext: Token is expired, clearing stored tokens');
              await authService.logout();
              setToken(null);
            } else {
              console.log('AuthContext: Token is valid, setting in context');
              setToken(storedToken);
              await checkProfileSetup();
            }
          } catch (e) {
            console.log('AuthContext: Could not decode existing token:', e);
            console.log('AuthContext: Clearing invalid token');
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
      console.log('AuthContext: Attempting login with:', { username, password: '***' });
      
      // Debug: Check current token before login
      const currentToken = await authService.getAccessToken();
      console.log('AuthContext: Current token before login:', currentToken ? `Token exists (${currentToken.substring(0, 20)}...)` : 'No token');
      
      const result = await authService.login({ username, password });
      console.log('AuthContext: Login result:', result);
      
      const newToken = await authService.getAccessToken();
      console.log('AuthContext: Retrieved token after login:', newToken ? `Token exists (${newToken.substring(0, 20)}...)` : 'No token');
      
      // Debug: Decode new token to see username
      if (newToken) {
        try {
          const payload = JSON.parse(atob(newToken.split('.')[1]));
          console.log('AuthContext: New JWT payload:', payload);
          console.log('AuthContext: New username from JWT:', payload.sub);
        } catch (e) {
          console.log('AuthContext: Could not decode new JWT:', e);
        }
      }
      
      console.log('AuthContext: Setting token after login to:', newToken ? `Token exists (${newToken.substring(0, 20)}...)` : 'No token');
      
      // Debug: Decode the token being set
      if (newToken) {
        try {
          const payload = JSON.parse(atob(newToken.split('.')[1]));
          console.log('AuthContext: Token being set for user:', payload.sub);
          console.log('AuthContext: Token issued at:', new Date(payload.iat * 1000));
        } catch (e) {
          console.log('AuthContext: Could not decode token being set:', e);
        }
      }
      
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
      console.log('AuthContext: Logging out user');
      await authService.logout();
      console.log('AuthContext: Setting token to null after logout');
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


