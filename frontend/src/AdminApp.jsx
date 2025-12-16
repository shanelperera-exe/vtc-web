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
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const previousViewport = viewportMeta?.getAttribute('content') || '';

    // Mark admin mode so we can tweak global styles (e.g., allow horizontal
    // scrolling and keep desktop-like font sizing on mobile).
    htmlEl?.classList.add('admin-mode');
    bodyEl?.classList.add('admin-mode');

    // Force a desktop-like layout width for admin on mobile by using a
    // wider virtual viewport. This makes Tailwind's responsive breakpoints
    // behave like on desktop, while the device can still scroll.
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=1280, initial-scale=1');
    }
    document.title = 'Admin | VTC';

    return () => {
      document.title = previous;
      htmlEl?.classList.remove('admin-mode');
      bodyEl?.classList.remove('admin-mode');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', previousViewport || 'width=device-width, initial-scale=1');
      }
    };
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
