import apiClient, { getStorageKeysForApp } from './axios';
import { normalizeError } from './apiUtils';

const BASE = '/api';

export async function listReviewsByProduct(productId) {
  if (!productId) throw new Error('productId required');
  try {
    const res = await apiClient.get(`${BASE}/products/${productId}/reviews`);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}

export async function createReview(productId, payload) {
  if (!productId) throw new Error('productId required');
  try {
    // Ensure payload contains productId (backend validates this field)
    const body = { productId, ...(payload || {}) };
    // Attach token from localStorage explicitly if present (some flows may not have axios interceptor configured)
    let opts = {};
    try {
      const { tokenKey, legacyTokenKey } = getStorageKeysForApp();
      const stored = typeof window !== 'undefined' ? (localStorage.getItem(tokenKey) || localStorage.getItem(legacyTokenKey)) : null;
      if (stored) opts = { headers: { Authorization: `Bearer ${stored}` } };
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('createReview request', { url: `${BASE}/products/${productId}/reviews`, body, hasToken: !!stored });
      }
    } catch (err) {
      // ignore storage errors
    }
    const res = await apiClient.post(`${BASE}/products/${productId}/reviews`, body, opts);
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('createReview response', res && res.data);
    }
    return res.data;
  } catch (e) { throw normalizeError(e); }
}

export async function deleteReview(id) {
  if (!id) throw new Error('id required');
  try {
    await apiClient.delete(`${BASE}/reviews/${id}`);
    return true;
  } catch (e) { throw normalizeError(e); }
}

export default { listReviewsByProduct, createReview, deleteReview };
