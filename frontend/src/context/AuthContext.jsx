import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartvote_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smartvote_token');
      const storedUser = localStorage.getItem('smartvote_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh user data in background
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('smartvote_user', JSON.stringify(res.data.data));
          }
        } catch (e) {
          console.warn('Session expired or invalid:', e.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('smartvote_token', newToken);
    localStorage.setItem('smartvote_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smartvote_token');
    localStorage.removeItem('smartvote_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('smartvote_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isVoter = user?.role === 'ROLE_VOTER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAdmin,
        isVoter,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
