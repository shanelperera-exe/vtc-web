import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listProducts, listProductsByCategory, searchProducts, createProduct, updateProduct, deleteProduct } from '../productApi';

export function useProducts(options = {}) {
  const { page = 0, size = 20, sort, categoryId, search, sku, status, stock } = options;
  const [data, setData] = useState([]);
  const [pageMeta, setPageMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (mounted.current) {
      setLoading(true);
      setError(null);
    }
    try {
      let p;
      if (categoryId) {
        p = await listProductsByCategory(categoryId, { page, size, sort, status, stock });
      } else if (search || sku) {
        p = await searchProducts({ name: search, sku, page, size, status, stock });
      } else {
        p = await listProducts({ page, size, sort, status, stock });
      }
      if (!mounted.current || requestId !== requestIdRef.current) return;
      setData(p.content || []);
      setPageMeta(p);
    } catch (e) {
      if (!mounted.current || requestId !== requestIdRef.current) return;
      setError(e);
    } finally {
      if (mounted.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [categoryId, search, sku, page, size, sort, status, stock]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  const create = useCallback(async (payload) => {
    const optimistic = { id: `temp-${Date.now()}`, ...payload };
    setData(d => [optimistic, ...d]);
    try {
      const created = await createProduct(payload);
      setData(d => d.map(p => p.id === optimistic.id ? created : p));
      return created;
    } catch (e) { setData(d => d.filter(p => p.id !== optimistic.id)); throw e; }
  }, []);

  const update = useCallback(async (id, payload, opts) => {
    const prev = data;
    setData(d => d.map(p => p.id === id ? { ...p, ...payload } : p));
    try {
      const updated = await updateProduct(id, payload, opts);
      setData(d => d.map(p => p.id === id ? updated : p));
      return updated;
    } catch (e) { setData(prev); throw e; }
  }, [data]);

  const remove = useCallback(async (id) => {
    const prev = data;
    setData(d => d.filter(p => p.id !== id));
    try { await deleteProduct(id); return true; } catch (e) { setData(prev); throw e; }
  }, [data]);

  return useMemo(() => ({ data, page: pageMeta, loading, error, reload: load, create, update, remove }), [data, pageMeta, loading, error, load, create, update, remove]);
}

export default useProducts;
