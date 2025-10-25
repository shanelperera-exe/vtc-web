import apiClient from './axios';
import { normalizeError } from './apiUtils';
import * as userApi from './userApi';

function unwrap(res) { return res?.data ?? null; }

// Map UI Checkout payload to backend CheckoutRequestDTO
function mapToCheckoutRequest(payload = {}) {
  // If caller already passed a payload shaped like the backend DTO (Checkout.jsx does this),
  // use it directly but normalize a few defaults (country, paymentMethod)
  if (payload && (payload.billingAddress || payload.shippingAddress || payload.paymentInfo || payload.deliveryMethod)) {
    const dto = { ...payload };
    const ba = dto.billingAddress || {};
    const sa = dto.shippingAddress || {};
    // Ensure billing has defaults
    dto.billingAddress = { ...ba, country: ba.country || 'Sri Lanka' };
    // If caller did not provide a shipping address, explicitly use billing address
    const shippingIsEmpty = !dto.shippingAddress || Object.keys(sa).length === 0;
    dto.shippingAddress = shippingIsEmpty
      ? { ...dto.billingAddress }
      : { ...sa, country: sa.country || 'Sri Lanka' };
    // Ensure paymentMethod is a backend enum name when caller used short names
    dto.paymentMethod = dto.paymentMethod || 'CASH_ON_DELIVERY';
    dto.deliveryMethod = dto.deliveryMethod || 'STANDARD_DELIVERY';
    return dto;
  }

  const billing = payload.billing || {};
  const delivery = payload.delivery || {};
  const payment = payload.payment || {};

  const billingAddress = {
    line1: billing.address1 || '',
    line2: billing.address2 || '',
    city: billing.city || '',
    state: billing.state || '',
    postalCode: billing.postal || '',
    country: billing.country || 'Sri Lanka',
  };

  // If not shipping to different, reuse billing address
  const shippingAddress = delivery.shipToDifferent
    ? {
        line1: delivery.shippingAddress || '',
        line2: delivery.shippingAddress2 || '',
        city: delivery.shippingCity || '',
        state: delivery.shippingState || '',
        postalCode: delivery.shippingPostal || '',
        country: 'Sri Lanka',
      }
    : { ...billingAddress };

  // Map delivery method to backend enum
  const deliveryMethod = (delivery.deliveryMethod || 'delivery') === 'pickup'
    ? 'IN_STORE_PICKUP'
    : 'STANDARD_DELIVERY';

  // Map payment method and info
  const paymentMethod = (payment.method || 'cod') === 'card' ? 'CARD' : 'CASH_ON_DELIVERY';
  let paymentInfo = undefined;
  if (paymentMethod === 'CARD') {
    const digits = String(payment.cardNumber || '').replace(/\D/g, '');
    const last4 = digits.slice(-4);
    let expMonth = null;
    let expYear = null;
    const m = String(payment.expiry || '').match(/^(\d{2})\/(\d{2})$/);
    if (m) {
      expMonth = parseInt(m[1], 10);
      expYear = 2000 + parseInt(m[2], 10);
    }
    // naive card type inference
    let cardType = undefined;
    if (/^4/.test(digits)) cardType = 'VISA';
    else if (/^(5[1-5])/.test(digits)) cardType = 'MASTERCARD';
    else if (/^3[47]/.test(digits)) cardType = 'AMEX';

    paymentInfo = {
      cardType,
      cardLast4: last4 || undefined,
      cardExpMonth: expMonth || undefined,
      cardExpYear: expYear || undefined,
    };
  }

  return {
    customerFirstName: billing.firstName || undefined,
    customerLastName: billing.lastName || undefined,
    customerEmail: billing.email || undefined,
    customerPhone: billing.phone || undefined,
    billingAddress,
    shippingAddress,
    deliveryMethod,
    paymentMethod,
    paymentInfo,
  };
}

export async function checkout(payload) {
  try {
    // If caller didn't already provide backend-shaped address DTOs, try to
    // fetch the authenticated user's latest address data and use that so the
    // server receives the freshest snapshot.
    let effectivePayload = { ...(payload || {}) };

    const callerProvidedDto = effectivePayload && (effectivePayload.billingAddress || effectivePayload.shippingAddress || effectivePayload.paymentInfo || effectivePayload.deliveryMethod);
    if (!callerProvidedDto) {
      try {
        const user = await userApi.getMe();
        // Helper: convert different user address shapes into backend address DTO
        const toDto = (addr) => {
          if (!addr) return null;
          // addr may be a string, array, or object with various field names
          if (typeof addr === 'string') return { line1: addr };
          if (Array.isArray(addr)) return {
            line1: addr[0] || '',
            line2: addr[1] || '',
            city: addr[2] || '',
          };
          // object-ish
          return {
            company: addr.company || addr.org || addr.organization || undefined,
            line1: addr.line1 || addr.address1 || addr.address || addr.street || '',
            line2: addr.line2 || addr.address2 || '',
            city: addr.city || addr.town || addr.village || '',
            state: addr.state || addr.province || addr.region || '',
            district: addr.district || addr.county || '',
            postalCode: addr.postalCode || addr.postal || addr.postcode || addr.zip || '',
            country: addr.country || 'Sri Lanka',
          };
        };

        // Try several common places the backend might expose addresses
        const maybeBilling = user?.billingAddress || user?.defaultBilling || (Array.isArray(user?.addresses) && user.addresses.find(a => a.type && a.type.toLowerCase().includes('billing'))) || user?.address || null;
        const maybeShipping = user?.shippingAddress || user?.defaultShipping || (Array.isArray(user?.addresses) && user.addresses.find(a => a.type && a.type.toLowerCase().includes('shipping'))) || null;

        const billingDto = toDto(maybeBilling);
        const shippingDto = toDto(maybeShipping || maybeBilling);

        if (billingDto) effectivePayload.billingAddress = billingDto;
        if (shippingDto) effectivePayload.shippingAddress = shippingDto;
      } catch {
        // If fetching user fails (e.g. unauthenticated), fall back to provided payload
      }
    }

    const dto = mapToCheckoutRequest(effectivePayload);
    const res = await apiClient.post('/api/checkout', dto);
    return unwrap(res);
  } catch (e) {
    throw normalizeError(e);
  }
}

export async function listMyOrders(params = {}) {
  try {
    const res = await apiClient.get('/api/orders/me', { params });
    const data = unwrap(res);
    // Backend returns a Page<OrderDTO> for paginated responses. Prefer returning
    // the actual array of orders (content) to keep the frontend hooks simple.
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return data || [];
  } catch (e) {
    throw normalizeError(e);
  }
}

export async function listAllOrders(params = {}) {
  try {
    const res = await apiClient.get('/api/orders', { params });
    const data = unwrap(res);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return data || [];
  } catch (e) {
    throw normalizeError(e);
  }
}

export async function getOrder(id, { withItems = false } = {}) {
  try {
    const isOrderNumber = typeof id === 'string' && /^ORD\d{12}$/.test(id);
    const url = isOrderNumber
      ? (withItems ? `/api/orders/number/${id}/details` : `/api/orders/number/${id}`)
      : (withItems ? `/api/orders/${id}/details` : `/api/orders/${id}`);
    const res = await apiClient.get(url);
    return unwrap(res);
  } catch (e) {
    throw normalizeError(e);
  }
}

export async function updateStatus(id, newStatus) {
  try {
    const res = await apiClient.patch(`/api/orders/${id}/status`, { newStatus });
    return unwrap(res);
  } catch (e) {
    throw normalizeError(e);
  }
}

export async function cancelOrder(id) {
  try {
    const res = await apiClient.post(`/api/orders/${id}/cancel`);
    return unwrap(res);
  } catch (e) {
    throw normalizeError(e);
  }
}

export default { checkout, listMyOrders, listAllOrders, getOrder, updateStatus, cancelOrder };
