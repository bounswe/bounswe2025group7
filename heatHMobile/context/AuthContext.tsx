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
  
  // Keep effect in case we add side-effects later
  useEffect(() => {
  }, [token, isAuthenticated]);

  // Check for existing token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = await authService.getAccessToken();
        if (storedToken) {
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            const now = new Date();
            const expDate = new Date(payload.exp * 1000);
            const isExpired = now > expDate;
            if (isExpired) {
              await authService.logout();
              setToken(null);
            } else {
              setToken(storedToken);
              await checkProfileSetup();
            }
          } catch (e) {
            await authService.logout();
            setToken(null);
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const result = await authService.login({ username, password });
      const newToken = await authService.getAccessToken();
      setToken(newToken);
      await checkProfileSetup();
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const result = await authService.register({ username, password });
      const newToken = await authService.getAccessToken();
      setToken(newToken);
      setIsProfileSetup(false);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setToken(null);
    } catch (error) {
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
    if (!isAuthenticated) {
      setIsProfileSetup(false);
      return;
    }

    try {
      const formData = await interestFormService.getInterestForm();
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
      setIsProfileSetup(hasCompleteProfile);
    } catch (error) {
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


