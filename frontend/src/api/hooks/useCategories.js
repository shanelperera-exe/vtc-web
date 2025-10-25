import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../categoryApi';

// Simple hook with local cache + optimistic updates
export function useCategories(options = {}) {
	const { page = 0, size = 50, sort, status } = options;
	const [data, setData] = useState([]);
	const [pageMeta, setPageMeta] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	 const mounted = useRef(false);

	const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const p = await listCategories({ page, size, sort, status });
			if (!mounted.current) return;
			// p.content items already include carouselImg, catMainImg, etc.
			// Optionally derive a unified primaryImage for UI fallbacks (not used yet):
			// const content = (p.content || []).map(c => ({ ...c, primaryImage: c.carouselImg || c.catMainImg || c.catTileImage1 || c.catTileImage2 }));
			setData(p.content || []);
			setPageMeta(p);
		} catch (e) {
			if (!mounted.current) return;
			setError(e);
		} finally { if (mounted.current) setLoading(false); }
	}, [page, size, sort]);

	 useEffect(() => {
	 	mounted.current = true;
	 	load();
	 	return () => { mounted.current = false; };
	 }, [load]);

	const create = useCallback(async (payload) => {
		const optimistic = { id: `temp-${Date.now()}`, ...payload };
		setData(d => [optimistic, ...d]);
		try {
			const created = await createCategory(payload);
			setData(d => d.map(c => c.id === optimistic.id ? created : c));
			return created;
		} catch (e) {
			setData(d => d.filter(c => c.id !== optimistic.id));
			throw e;
		}
	}, []);

	const update = useCallback(async (id, payload) => {
		const prev = data;
		setData(d => d.map(c => c.id === id ? { ...c, ...payload } : c));
		try {
			const updated = await updateCategory(id, payload);
			setData(d => d.map(c => c.id === id ? updated : c));
			return updated;
		} catch (e) {
			setData(prev); throw e;
		}
	}, [data]);

	const remove = useCallback(async (id) => {
		const prev = data;
		setData(d => d.filter(c => c.id !== id));
		try { await deleteCategory(id); return true; } catch (e) { setData(prev); throw e; }
	}, [data]);

	return useMemo(() => ({ data, page: pageMeta, loading, error, reload: load, create, update, remove }), [data, pageMeta, loading, error, load, create, update, remove]);
}

export default useCategories;
