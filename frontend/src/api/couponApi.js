import apiClient from './axios';
import { normalizeError } from './apiUtils';

async function applyCoupon({ code, subtotal }) {
  try {
    const res = await apiClient.post('/api/coupons/apply', { code, subtotal });
    return res.data;
  } catch (e) {
    throw normalizeError(e);
  }
}

export default { applyCoupon };
