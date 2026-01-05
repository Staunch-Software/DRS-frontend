import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// --- IMPORTS ---
import Login from './features/auth/Login';

// Vessel Imports
import VesselLayout from './features/vessel/VesselLayout';
import VesselDashboard from './features/vessel/VesselDashboard';
import CreateDefect from './features/vessel/CreateDefect';
import MyTasks from './features/vessel/MyTasks';
import VesselHistory from './features/vessel/VesselHistory';

// Shore Imports
import ShoreLayout from './features/shore/ShoreLayout';
import ShoreDashboard from './features/shore/ShoreDashboard';
import ShoreTasks from './features/shore/ShoreTasks';
import ShoreHistory from './features/shore/ShoreHistory';
import ShoreVesselData from './features/shore/ShoreVesselData';
import AdminUserPanel from './features/shore/AdminUserPanel'; // <--- 1. IMPORT THIS

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* VESSEL ROUTES */}
          <Route path="/vessel" element={
            <ProtectedRoute allowedRole="VESSEL">
              <VesselLayout />
            </ProtectedRoute>
          }>
            <Route index element={<VesselDashboard />} />
            <Route path="dashboard" element={<VesselDashboard />} />
            <Route path="create" element={<CreateDefect />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="history" element={<VesselHistory />} />
          </Route>

          {/* SHORE ROUTES */}
          <Route path="/shore" element={
            <ProtectedRoute allowedRole="SHORE">
              <ShoreLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ShoreDashboard />} />
            <Route path="dashboard" element={<ShoreDashboard />} />
            <Route path="vessels" element={<ShoreVesselData />} />
            <Route path="tasks" element={<ShoreTasks />} />
            <Route path="history" element={<ShoreHistory />} />
            
            {/* 2. ADD THIS ROUTE */}
            <Route path="admin/users" element={<AdminUserPanel />} />
            
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;