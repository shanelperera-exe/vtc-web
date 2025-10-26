
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import orderApi from '../orderApi';

export function useOrders({ orderId, orderNumber, admin = false, initialData } = {}) {
  const [orders, setOrders] = useState(() => initialData || []);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(false);

  const toAddressLines = (addr) => {
    if (!addr) return [];
    const { company, line1, line2, city, state, postalCode, country } = addr || {};
    const cityLine = [city, postalCode].filter(Boolean).join(' ');
    return [company, line1, line2, cityLine, country].filter(Boolean);
  };

  const prettyDelivery = (method) => {
    if (!method) return undefined;
    const m = String(method).toUpperCase();
    if (m === 'IN_STORE_PICKUP') return 'Local pickup';
    if (m === 'STANDARD_DELIVERY') return 'Standard delivery';
    return method;
  };

  const toYY = (year) => {
    if (!year) return '';
    const y = String(year);
    return y.length === 4 ? y.slice(2) : y;
    
  };

  const transformOrder = (o) => {
    if (!o) return o;
    const toLocalParts = (dt) => {
      if (!dt) return null;
      const d = new Date(dt);
      if (Number.isNaN(d.getTime())) return null;
      const date = d.toLocaleDateString();
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return { date, time };
    };
    const placedAt = o.placedAt ? new Date(o.placedAt) : null;
    const placed = placedAt ? placedAt.toLocaleDateString() : undefined;
    const placedTime = placedAt ? `${String(placedAt.getHours()).padStart(2, '0')}:${String(placedAt.getMinutes()).padStart(2, '0')}` : undefined;
    const statusTimes = {
      placed: toLocalParts(o.placedAt) || undefined,
      processing: toLocalParts(o.processingStartedAt) || undefined,
      shipped: toLocalParts(o.shippedAt) || undefined,
      delivered: toLocalParts(o.deliveredAt) || undefined,
      cancelled: toLocalParts(o.cancelledAt) || undefined,
    };
    const paymentInfo = o.paymentInfo || {};
    const billing = {
      address: toAddressLines(o.billingAddress),
      payment: o.paymentMethod === 'CARD'
        ? {
            type: paymentInfo.cardType ? String(paymentInfo.cardType) : 'Card',
            cardType: paymentInfo.cardType,
            last4: paymentInfo.cardLast4 || '****',
            cardLast4: paymentInfo.cardLast4 || '****',
            cardExpMonth: paymentInfo.cardExpMonth,
            cardExpYear: paymentInfo.cardExpYear,
            expires: paymentInfo.cardExpMonth && paymentInfo.cardExpYear
              ? `${String(paymentInfo.cardExpMonth).padStart(2, '0')} / ${toYY(paymentInfo.cardExpYear)}`
              : undefined,
          }
        : { type: 'Cash on Delivery', last4: '----', expires: undefined },
      summary: {
        subtotal: Number(o.subtotal ?? 0),
        shipping: Number(o.shippingFee ?? 0),
        tax: Number(o.taxTotal ?? 0),
        total: Number(o.total ?? 0),
      },
    };
    return {
      ...o,
      placed,
      placedTime,
      statusTimes,
      address: toAddressLines(o.shippingAddress),
      deliveryMethod: prettyDelivery(o.deliveryMethod),
      billing,
    };
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (orderId != null || orderNumber != null) {
        // Load single order by id or orderNumber
        const key = orderNumber != null ? orderNumber : orderId;
        const o = await orderApi.getOrder(key, { withItems: true });
        if (mounted.current) setOrder(transformOrder(o));
      } else {
        // Load list of orders
        const list = admin ? await orderApi.listAllOrders() : await orderApi.listMyOrders();
        if (mounted.current) setOrders((list || []).map(transformOrder));
      }
    } catch (e) {
      if (mounted.current) setError(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [orderId, orderNumber, admin]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  // Memoize order for list view
  const orderFromList = useMemo(() => {
    if (orderId == null && orderNumber == null) return null;
    if (orderNumber != null) return orders.find(o => String(o.orderNumber) === String(orderNumber)) || null;
    return orders.find(o => String(o.id) === String(orderId)) || null;
  }, [orders, orderId, orderNumber]);

  return {
    orders,
    order: order || orderFromList,
    setOrders,
    loading,
    error,
    reload: load,
  };
}

export default useOrders;
