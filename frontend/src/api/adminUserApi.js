import apiClient from './axios';
import { normalizeError } from './apiUtils';

const ADMIN_BASE = '/api/admin/users';

export async function listUsers({ page = 0, size = 50 } = {}) {
  try {
    const res = await apiClient.get(ADMIN_BASE, { params: { page, size } });
    return res.data; // Page<UserDto>
  } catch (e) { throw normalizeError(e); }
}

export async function getUser(id) {
  try {
    const res = await apiClient.get(`${ADMIN_BASE}/${id}`);
    return res.data; // UserDto
  } catch (e) { throw normalizeError(e); }
}

export async function getUserByCode(userCode) {
  try {
    const res = await apiClient.get(`${ADMIN_BASE}/code/${encodeURIComponent(userCode)}`);
    return res.data; // UserDto
  } catch (e) { throw normalizeError(e); }
}

export async function updateRoles(id, roles) {
  try {
    const res = await apiClient.put(`${ADMIN_BASE}/${id}/roles`, roles);
    return res.data; // UserDto
  } catch (e) { throw normalizeError(e); }
}

export async function updateStatus(id, enabled) {
  try {
    const res = await apiClient.put(`${ADMIN_BASE}/${id}/status`, { enabled });
    return res.data; // UserDto
  } catch (e) { throw normalizeError(e); }
}

export async function getUserOrders(id, { page = 0, size = 50 } = {}) {
  try {
    const res = await apiClient.get(`${ADMIN_BASE}/${id}/orders`, { params: { page, size } });
    return res.data; // Page<OrderDTO>
  } catch (e) { throw normalizeError(e); }
}

export async function getUserOrdersByCode(userCode, { page = 0, size = 50 } = {}) {
  try {
    const res = await apiClient.get(`${ADMIN_BASE}/code/${encodeURIComponent(userCode)}/orders`, { params: { page, size } });
    return res.data; // Page<OrderDTO>
  } catch (e) { throw normalizeError(e); }
}

export async function deleteUser(id) {
  try {
    await apiClient.delete(`${ADMIN_BASE}/${id}`);
  } catch (e) { throw normalizeError(e); }
}

export async function getUserBillingAddresses(id) {
  try {
    const res = await apiClient.get(`${ADMIN_BASE}/${id}/addresses/billing`);
    return res.data; // BillingAddressDTO[]
  } catch (e) { throw normalizeError(e); }
}

export async function getUserShippingAddresses(id) {
  try {
    const res = await apiClient.get(`${ADMIN_BASE}/${id}/addresses/shipping`);
    return res.data; // ShippingAddressDTO[]
  } catch (e) { throw normalizeError(e); }
}

export default { listUsers, getUser, getUserByCode, updateRoles, updateStatus, getUserOrders, getUserOrdersByCode, deleteUser, getUserBillingAddresses, getUserShippingAddresses };
