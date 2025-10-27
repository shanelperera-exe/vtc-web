// Shared API utility helpers

export function normalizeError(err) {
	if (!err) return { message: 'Unknown error' };
	if (typeof err === 'string') return { message: err };
	const axiosRes = err.response;
	if (axiosRes) {
		const data = axiosRes.data || {};
		// Spring validation / ApiError format fallback
		return {
			status: axiosRes.status,
			message: data.message || data.error || data.title || err.message || 'Request failed',
			availableStock: data.availableStock != null ? data.availableStock : null,
			details: data.errors || data.fieldErrors || data.details || data,
		};
	}
	return { message: err.message || 'Network error' };
}

// Map Spring Page<T> to a simpler client shape
export function mapPage(page) {
	if (!page || typeof page !== 'object') return { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0, first: true, last: true, numberOfElements: 0 };
	const {
		content = [],
		number = 0,
		size = content.length,
		totalPages = 1,
		totalElements = content.length,
		first = number === 0,
		last = number + 1 >= totalPages,
		numberOfElements = content.length
	} = page;
	return { content, page: number, size, totalPages, totalElements, first, last, numberOfElements };
}

export function buildQuery(params = {}) {
	const usp = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v === undefined || v === null || v === '') return;
		usp.append(k, String(v));
	});
	const s = usp.toString();
	return s ? `?${s}` : '';
}

// Simple in-memory cache (per session) for list endpoints
const _cache = new Map();
export function cacheGet(key) { return _cache.get(key); }
export function cacheSet(key, value) { _cache.set(key, value); return value; }
export function cacheInvalidate(prefix) {
	[..._cache.keys()].forEach(k => { if (!prefix || k.startsWith(prefix)) _cache.delete(k); });
}
