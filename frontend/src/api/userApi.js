import apiClient from './axios';
import { normalizeError } from './apiUtils';

const BASE = '/api/users/me';

export async function getMe() {
  try {
    const res = await apiClient.get(BASE);
    return res.data; // UserDto
  } catch (e) { throw normalizeError(e); }
}

export async function updateMe(payload) {
  try {
    const res = await apiClient.put(BASE, payload);
    return res.data; // UserDto
  } catch (e) { throw normalizeError(e); }
}

export async function changePassword(payload) {
  try {
    await apiClient.post(`${BASE}/change-password`, payload);
  } catch (e) { throw normalizeError(e); }
}

export default { getMe, updateMe, changePassword };
