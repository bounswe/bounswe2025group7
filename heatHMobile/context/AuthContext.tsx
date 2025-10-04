import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { autoLoginService } from '@/services/autoLoginService';
import { authService } from '@/services/authService';
import { storage } from '@/utils/storage';

type AuthContextValue = {
  token: string | null;
  setToken: (t: string | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials?: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug token changes
  useEffect(() => {
    console.log('🔐 AuthContext - Token state changed:', token ? 'Present' : 'Null');
    console.log('🔐 AuthContext - Is authenticated:', !!token);
    console.log('🔐 AuthContext - Is loading:', isLoading);
  }, [token, isLoading]);

  // Auto-login on app start
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('🔐 AuthContext: Initializing authentication...');
        console.log('🔐 AuthContext: Component mounted, starting auth flow...');
        
        // First check if we already have a token (matches frontend pattern)
        const existingToken = await storage.getItem('accessToken');
        console.log('🔐 AuthContext: Checking for existing token:', !!existingToken);
        console.log('🔐 AuthContext: Token value:', existingToken ? existingToken.substring(0, 20) + '...' : 'null');
        
        if (existingToken) {
          console.log('🔐 AuthContext: Found existing token, validating it...');
          
          // Validate token by attempting to refresh (matches frontend pattern)
          try {
            await authService.refreshToken();
            console.log('🔐 AuthContext: Token validation successful');
            if (isMounted) {
              setToken(existingToken);
              setIsLoading(false);
            }
            return;
          } catch (refreshError) {
            console.log('🔐 AuthContext: Token validation failed, clearing tokens');
            await storage.removeItem('accessToken');
            await storage.removeItem('refreshToken');
            // Continue to auto-login below
          }
        }
        
        // If no existing token, attempt auto-login
        console.log('🔐 AuthContext: No existing token, attempting auto-login...');
        try {
          const result = await autoLoginService.autoLogin();
          console.log('🔐 AuthContext: Auto-login result:', result);
          
          if (result.success && result.token && isMounted) {
            console.log('🔐 AuthContext: Auto-login successful, setting token');
            setToken(result.token);
            console.log('🔐 AuthContext: Token set in state, user authenticated');
          } else {
            console.log('🔐 AuthContext: Auto-login failed:', result.error);
          }
        } catch (autoLoginError) {
          console.error('🔐 AuthContext: Auto-login threw error:', autoLoginError);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('🔐 AuthContext: Auth initialization complete, isLoading set to false');
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials?: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      console.log('🔐 AuthContext: Manual login attempt...');
      
      let result;
      if (credentials) {
        // Use provided credentials
        console.log('🔐 AuthContext: Using provided credentials');
        const response = await authService.login(credentials) as any;
        result = { success: true, token: response.accessToken };
      } else {
        // Use auto-login service
        console.log('🔐 AuthContext: Using auto-login service');
        result = await autoLoginService.autoLogin();
      }
      
      if (result.success && result.token) {
        console.log('🔐 AuthContext: Login successful, setting token:', result.token);
        setToken(result.token);
        console.log('🔐 AuthContext: Token set, authentication should be true');
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('🔐 AuthContext: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await autoLoginService.logout();
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextValue = {
    token,
    setToken,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}


