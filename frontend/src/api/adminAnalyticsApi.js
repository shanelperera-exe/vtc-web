import apiClient from './axios';
import { normalizeError } from './apiUtils';

function unwrap(res) { return res?.data ?? null; }

export async function getAdminDashboardAnalytics(params = {}) {
  try {
    const res = await apiClient.get('/api/admin/analytics/dashboard', { params });
    return unwrap(res);
  } catch (e) {
    throw normalizeError(e);
  }
}

export async function getAdminSalesAnalytics(params = {}) {
  try {
    const res = await apiClient.get('/api/admin/analytics/sales', { params });
    return unwrap(res);
  } catch (e) {
    throw normalizeError(e);
  }
}

export default { getAdminDashboardAnalytics, getAdminSalesAnalytics };
