import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from '../AdminPanel';
import RequireAdmin from '../components/layout/RequireAdmin';
import AdminDashboard from '../pages/AdminDashboard';
import PlaceholderSection from '../components/sections/PlaceholderSection';
import CategoryManagement from '../pages/CategoryManagement';
import AdminOrders from '../pages/AdminOrders';
import AdminOrderDetails from '../pages/AdminOrderDetails';
import AdminUsers from '../pages/AdminUsers';
import AdminUserDetails from '../pages/AdminUserDetails';
import AllProductsManager from '../pages/AllProductsManager';
import CategoryProductManager from '../pages/CategoryProductManager';
import AdminSettings from '../pages/AdminSettings';
import AdminLogin from '../../pages/AdminLogin';
import ProductStats from '../pages/ProductStats';
import SalesAnalyticsSalesOnly from '../pages/SalesAnalyticsSalesOnly';
import AdminAnalytics from '../pages/AdminAnalytics';

/**
 * Encapsulated admin routing segment. Mount inside main App router like:
 * <Route element={<AdminRoutes />} /> or directly use <AdminRoutes /> under an existing <Routes>.
 * This keeps admin-specific nested route structure centralized.
 */
export default function AdminRoutes() {
  return (
    <Routes>
      {/* Public admin login route (no admin guard) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<RequireAdmin />}> {/* guard all admin routes */}
        <Route path="/admin" element={<AdminPanel />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sales" element={<SalesAnalyticsSalesOnly />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:orderNumber" element={<AdminOrderDetails />} />
          <Route path="products" element={<AllProductsManager />} />
          <Route path="products/:sku/stats" element={<ProductStats />} />
          <Route path="products/:categorySlug" element={<CategoryProductManager />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userCode" element={<AdminUserDetails />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
