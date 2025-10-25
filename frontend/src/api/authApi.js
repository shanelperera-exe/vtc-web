import apiClient from './axios';
import { normalizeError } from './apiUtils';

const BASE = '/api/auth';

export async function login({ email, password }) {
  try {
    const res = await apiClient.post(`${BASE}/login`, { email, password });
    return res.data; // { accessToken, tokenType, expiresInSeconds, user }
  } catch (e) { throw normalizeError(e); }
}

export async function register(payload) {
  try {
    const res = await apiClient.post(`${BASE}/register`, payload);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}

export async function refresh(token) {
  try {
    // Prefer cookie; token param fallback for non-cookie strategy
    const url = token ? `${BASE}/refresh?token=${encodeURIComponent(token)}` : `${BASE}/refresh`;
    const res = await apiClient.post(url);
    return res.data; // { accessToken, tokenType, expiresInSeconds }
  } catch (e) { throw normalizeError(e); }
}

export async function logout() {
  try {
    await apiClient.post(`${BASE}/logout`);
  } catch (e) { throw normalizeError(e); }
}

export async function me() {
  try {
    const res = await apiClient.get(`${BASE}/me`);
    return res.data; // user dto
  } catch (e) { throw normalizeError(e); }
}

export async function forgotPassword(email) {
  try {
    await apiClient.post(`${BASE}/forgot-password`, { email });
  } catch (e) { throw normalizeError(e); }
}

export async function resetPassword({ token, newPassword }) {
  try {
    await apiClient.post(`${BASE}/reset-password`, { token, newPassword });
  } catch (e) { throw normalizeError(e); }
}

export default { login, register, refresh, logout, me, forgotPassword, resetPassword };
