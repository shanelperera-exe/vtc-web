import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/ui/Notification';
import LoadingOverlay from './components/ui/LoadingOverlay';
import AdminRoutes from './admin/routes/AdminRoutes';

// Admin-only application shell. Mounted when hostname is admin.* or pathname starts with /admin
export default function AdminApp() {
  useEffect(() => {
    const previous = document.title;
    document.title = 'Admin | VTC';
    return () => { document.title = previous; };
  }, []);
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <LoadingOverlay />
          <AdminRoutes />
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}
