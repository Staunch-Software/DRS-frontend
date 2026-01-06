import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // Uses your axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check persistence on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('drs_user');
    const storedToken = localStorage.getItem('drs_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. REAL LOGIN FUNCTION
  const login = async (email, password) => {
    try {
      // API CALL
      const response = await api.post('/login/access-token', {
        username: email,
        password: password
      });

      const data = response.data;

      // Create User Object for App
      const userData = {
        id: data.id,
        name: data.full_name,
        email: data.email,
        role: data.role,             // 'ADMIN' or 'USER'
        job_title: data.job_title,   // 'Chief Engineer' etc
        assignedVessels: data.assigned_vessels // ['9832913', ...]
      };

      // Save Data
      setUser(userData);
      localStorage.setItem('drs_user', JSON.stringify(userData));
      localStorage.setItem('drs_token', data.access_token);

      return { success: true, role: data.role };

    } catch (error) {
      console.error("Login Failed:", error);
      const msg = error.response?.data?.detail || "Connection Error";
      return { success: false, message: msg };
    }
  };

  // 3. Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('drs_user');
    localStorage.removeItem('drs_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);