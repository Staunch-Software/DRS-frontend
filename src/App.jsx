import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { startSyncEngine } from './services/SyncEngine';

// --- NEW IMPORTS (Updated Paths) ---
import Login from './features/auth/Login';
import VesselLayout from './features/vessel/VesselLayout';       // Changed Path
import VesselDashboard from './features/vessel/VesselDashboard'; // Changed Path
import CreateDefect from './features/vessel/CreateDefect';       // Changed Path
import ShoreDashboard from './features/shore/ShoreDashboard';    // Changed Path
import MyTasks from './features/vessel/MyTasks';
import VesselHistory from './features/vessel/VesselHistory';
import ShoreLayout from './features/shore/ShoreLayout';
import ShoreTasks from './features/shore/ShoreTasks';
import ShoreHistory from './features/shore/ShoreHistory';
import ShoreVesselData from './features/shore/ShoreVesselData';
import ShoreVesselView from './features/shore/ShoreVesselView';   // In case needed later

function App() {
  useEffect(() => {
    // This starts the background sync process once when the app mounts
    startSyncEngine();
  }, []);
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* --- VESSEL ROUTES --- */}
          {/* The Layout wraps all vessel pages */}
          <Route path="/vessel" element={
            <ProtectedRoute allowedRole="VESSEL">
              <VesselLayout />
            </ProtectedRoute>
          }>
            {/* Default Page (Dashboard) */}
            <Route index element={<VesselDashboard />} />

            {/* Other Pages */}
            <Route path="dashboard" element={<VesselDashboard />} />
            <Route path="create" element={<CreateDefect />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="history" element={<VesselHistory />} />
            {/* You can add 'tasks' here later */}
          </Route>

          <Route path="/shore" element={
            <ProtectedRoute allowedRole="SHORE">
              <ShoreLayout />
            </ProtectedRoute>
          }>
            {/* DASHBOARD ROUTE */}
            <Route index element={<ShoreDashboard />} />
            <Route path="dashboard" element={<ShoreDashboard />} />

            {/* TASKS ROUTE (This fixes the redirect) */}
            <Route path="tasks" element={<ShoreTasks />} />
            <Route path="history" element={<ShoreHistory />} />
            <Route path="vessels" element={<ShoreVesselData />} /> 

          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;