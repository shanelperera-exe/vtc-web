import apiClient from './axios';
import { normalizeError } from './apiUtils';

const BASE = '/api/wishlist';

export async function getWishlist() {
  try {
    const res = await apiClient.get(BASE);
    return res.data; // { items: [{productId, productName, imageUrl, sku, price, id}] }
  } catch (e) { throw normalizeError(e); }
}

export async function addToWishlist(productId) {
  if (!productId) throw new Error('productId is required');
  try {
    const res = await apiClient.post(`${BASE}/add/${productId}`);
    return res.data; // WishlistItemDTO
  } catch (e) { throw normalizeError(e); }
}

export async function removeFromWishlist(productId) {
  if (!productId) throw new Error('productId is required');
  try {
    // backend expects /remove/{productId}
    await apiClient.delete(`${BASE}/remove/${productId}`);
    return true;
  } catch (e) { throw normalizeError(e); }
}

export async function clearWishlist() {
  try {
    await apiClient.delete(`${BASE}/clear`);
    return true;
  } catch (e) { throw normalizeError(e); }
}

export async function mergeLocalWishlist(productIds = []) {
  try {
    const res = await apiClient.post(`${BASE}/merge-local`, productIds);
    return res.data;
  } catch (e) { throw normalizeError(e); }
}

export default { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, mergeLocalWishlist };
