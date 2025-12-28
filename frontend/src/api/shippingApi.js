import apiClient from './axios';
import { normalizeError } from './apiUtils';

function unwrap(res) { return res?.data ?? null; }

export async function getShippingAmount() {
  try {
    const res = await apiClient.get('/api/shipping-config');
    return unwrap(res);
  } catch (e) {
    throw normalizeError(e);
  }
}

export default { getShippingAmount };
