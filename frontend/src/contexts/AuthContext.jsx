import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fonction pour vérifier l'accès actif (répétable)
  const hasActiveAccess = useCallback(() => {
    if (!user) return false;
    if (user.subscription_status === 'active') return true;
    if (user.subscription_status === 'trial' && user.days_left_on_trial > 0) return true;
    if (user.has_active_access) return true;
    return false;
  }, [user]);

  const logout = () => {
    apiService.removeToken();
    localStorage.removeItem('verse_user');
    localStorage.removeItem('verse_auth_role');
    localStorage.removeItem('verse_subscription');
    setUser(null);
    navigate('/');
  };

  const checkAuth = async () => {
    try {
      const data = await apiService.getMe();
      setUser(data.user);
      localStorage.setItem('verse_user', JSON.stringify(data.user));
    } catch (err) {
      logout();
    }
  };

  const login = async (email, password) => {
    const data = await apiService.ownerLogin(email, password);
    setUser(data.user);
    localStorage.setItem('verse_user', JSON.stringify(data.user));
    localStorage.setItem('verse_auth_role', data.role);
    return data;
  };

  const register = async (name, email, phone, password) => {
    const data = await apiService.ownerRegister(name, email, phone, password);
    setUser(data.user);
    localStorage.setItem('verse_user', JSON.stringify(data.user));
    localStorage.setItem('verse_auth_role', data.role);
    return data;
  };

  // Check subscription status from API on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('verse_user');
      const storedToken = localStorage.getItem('verse_auth_token');
      
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const data = await apiService.getMe();
          setUser(data.user);
          localStorage.setItem('verse_user', JSON.stringify(data.user));
        } catch (err) {
          logout();
        }
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      checkAuth,
      isAuthenticated: !!user,
      hasActiveAccess: hasActiveAccess()
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
