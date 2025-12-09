import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setRefreshToken(storedRefreshToken);

        // Optionally verify token by fetching current user
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          // Token invalid, clear auth
          clearAuth();
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success) {
        const { user: userData, token: authToken, refreshToken: refresh } = response.data;

        // Update state
        setUser(userData);
        setToken(authToken);
        setRefreshToken(refresh);

        // Persist to localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (refresh) {
          localStorage.setItem('refreshToken', refresh);
        }

        return { success: true, data: userData };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.register(email, password, name);

      if (response.success) {
        const { user: userData, token: authToken, refreshToken: refresh } = response.data;

        // Update state
        setUser(userData);
        setToken(authToken);
        setRefreshToken(refresh);

        // Persist to localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (refresh) {
          localStorage.setItem('refreshToken', refresh);
        }

        return { success: true, data: userData };
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Clear state and localStorage regardless of API result
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isAuthenticated = Boolean(user && token);

  const value = {
    user,
    token,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    clearAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;

