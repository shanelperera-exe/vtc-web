import apiClient from './axios';
import { normalizeError } from './apiUtils';

const BASE = '/api/users/me/addresses';

// Billing
export async function listBilling() {
  try {
    const res = await apiClient.get(`${BASE}/billing`);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}
export async function createBilling(dto) {
  try {
    const res = await apiClient.post(`${BASE}/billing`, dto);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}
export async function updateBilling(id, dto) {
  try {
    const res = await apiClient.put(`${BASE}/billing/${id}`, dto);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}
export async function deleteBilling(id) {
  try {
    await apiClient.delete(`${BASE}/billing/${id}`);
  } catch (e) { throw normalizeError(e); }
}

// Shipping
export async function listShipping() {
  try {
    const res = await apiClient.get(`${BASE}/shipping`);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}
export async function createShipping(dto) {
  try {
    const res = await apiClient.post(`${BASE}/shipping`, dto);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}
export async function updateShipping(id, dto) {
  try {
    const res = await apiClient.put(`${BASE}/shipping/${id}`, dto);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}
export async function deleteShipping(id) {
  try {
    await apiClient.delete(`${BASE}/shipping/${id}`);
  } catch (e) { throw normalizeError(e); }
}

export default {
  listBilling,
  createBilling,
  updateBilling,
  deleteBilling,
  listShipping,
  createShipping,
  updateShipping,
  deleteShipping,
};
