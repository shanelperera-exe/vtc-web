import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getProduct } from '../api/productApi';

// Redirects /product-id/:id -> /product/:sku (or stays on id if sku missing)
export default function LegacyProductRedirect() {
  const { id } = useParams();
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try {
        const p = await getProduct(id);
        const sku = p?.sku;
        if (active) setTarget(`/product/${sku || id}`);
      } catch (_E) {
        if (active) setTarget(`/product/${id}`);
      } finally {
        if (active) setLoading(false);
      }
    }
    if (id) run();
    return () => { active = false; };
  }, [id]);

  if (loading) return null;
  return <Navigate to={target} replace />;
}
