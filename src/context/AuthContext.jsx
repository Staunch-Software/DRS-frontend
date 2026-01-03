import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 1. Check if user is already logged in (on page refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem('drs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 2. The Login Function (Hardcoded Logic)
  const login = (username, password) => {
    // --- VESSEL LOGIN SIMULATION ---
    if (username === 'chief' && password === '12345') {
      const userData = { 
        id: 'u1', 
        name: 'Chief Engineer', 
        role: 'VESSEL', // <--- Key differentiator
        vesselName: 'MT ALFA' 
      };
      setUser(userData);
      localStorage.setItem('drs_user', JSON.stringify(userData));
      return { success: true, role: 'VESSEL' };
    }

    // --- SHORE LOGIN SIMULATION ---
    if (username === 'manager' && password === '12345') {
      const userData = { 
        id: 'u2', 
        name: 'Technical Sup.', 
        role: 'SHORE', // <--- Key differentiator
        location: 'HQ London' 
      };
      setUser(userData);
      localStorage.setItem('drs_user', JSON.stringify(userData));
      return { success: true, role: 'SHORE' };
    }

    // --- FAILED LOGIN ---
    return { success: false, message: 'Invalid Credentials' };
  };

  // 3. Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('drs_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);