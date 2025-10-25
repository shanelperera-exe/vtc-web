// Simple localStorage-backed wishlist utility
// Item shape we store: { id, sku, name, image, price }
// Keying strategy: unique key is sku || id

const STORAGE_KEY = 'vtc_wishlist';
const CUSTOM_EVENT = 'vtc_wishlist:changed';

function safeWindow() {
	try { return typeof window !== 'undefined' ? window : null; } catch { return null; }
}

function getKey(itemOrKey) {
	if (itemOrKey == null) return null;
	if (typeof itemOrKey === 'string' || typeof itemOrKey === 'number') return String(itemOrKey);
	const sku = itemOrKey.sku ?? itemOrKey.SKU ?? itemOrKey.skuCode;
	const id = itemOrKey.id ?? itemOrKey.productId;
	return String(sku ?? id ?? '');
}

function read() {
	const w = safeWindow();
	if (!w) return [];
	try {
		const raw = w.localStorage.getItem(STORAGE_KEY);
		const list = raw ? JSON.parse(raw) : [];
		if (Array.isArray(list)) return list;
		return [];
	} catch { return []; }
}

function write(list) {
	const w = safeWindow();
	if (!w) return;
	try {
		const arr = Array.isArray(list) ? list : [];
		w.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
		// Notify same-tab listeners
		w.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: { size: arr.length } }));
	} catch { /* ignore */ }
}

export function list() { return read(); }

export function has(itemOrKey) {
	const key = getKey(itemOrKey);
	if (!key) return false;
	return read().some(p => getKey(p) === key);
}

export function add(item) {
	const key = getKey(item);
	if (!key) return list();
	const current = read();
	if (current.some(p => getKey(p) === key)) return current;
	const normalized = {
		id: item.id ?? item.productId ?? null,
		sku: item.sku ?? item.SKU ?? item.skuCode ?? null,
		name: item.name ?? item.title ?? 'Product',
		image: item.image ?? item.primaryImageUrl ?? (Array.isArray(item.imageUrls) ? item.imageUrls[0] : null) ?? '',
		price: Number(item.price ?? item.basePrice ?? 0) || 0,
	};
	const next = [normalized, ...current]; // newest first
	write(next);

	// Fire-and-forget backend sync when user is authenticated.
	// We detect a stored access token (user_token or legacy vtc_access_token) and if present
	// attempt to POST to the backend wishlist endpoint so the server records it.
	try {
		const token = (typeof window !== 'undefined') ? (localStorage.getItem('user_token') || localStorage.getItem('vtc_access_token')) : null;
		if (token && normalized.id) {
			// dynamic import to avoid bundling axios twice; rely on apiClient which attaches token from storage
			import('../api/wishlistApi').then(mod => {
				mod.addToWishlist(Number(normalized.id)).catch(() => {/* ignore sync failures */});
			}).catch(() => {/* ignore import failures */});
		}
	} catch (e) { /* ignore */ }
	return next;
}

export function remove(itemOrKey) {
	const key = getKey(itemOrKey);
	const current = read();
	const next = current.filter(p => getKey(p) !== key);
	write(next);
	return next;
}

// Attempt backend removal when authenticated (non-blocking)
export function removeWithSync(itemOrKey) {
	const key = getKey(itemOrKey);
	const curr = read();
	const matched = curr.find(p => getKey(p) === key);
	const next = curr.filter(p => getKey(p) !== key);
	write(next);
	try {
		const token = (typeof window !== 'undefined') ? (localStorage.getItem('user_token') || localStorage.getItem('vtc_access_token')) : null;
		if (token && matched && matched.id) {
			import('../api/wishlistApi').then(mod => {
				mod.removeFromWishlist(Number(matched.id)).catch(() => {/* ignore */});
			}).catch(() => {/* ignore */});
		}
	} catch (e) { /* ignore */ }
	return next;
}

export function toggle(item) {
	return has(item) ? removeWithSync(item) : add(item);
}

export function clear() { write([]); }

// Overwrite entire wishlist with provided items (already in our normalized shape)
export function setAll(items = []) {
	const arr = Array.isArray(items) ? items : [];
	write(arr.map((it) => ({
		id: it.id ?? it.productId ?? null,
		sku: it.sku ?? null,
		name: it.name ?? it.productName ?? 'Product',
		image: it.image ?? it.imageUrl ?? '',
		price: Number(it.price ?? 0) || 0,
	})));
}

// Normalize server DTO item -> local shape
function normalizeFromServer(dto) {
	if (!dto) return null;
	return {
		id: dto.productId ?? dto.id ?? null,
		sku: dto.sku ?? null,
		name: dto.productName ?? dto.name ?? 'Product',
		image: dto.imageUrl ?? dto.image ?? '',
		price: Number(dto.price ?? 0) || 0,
	};
}

// Replace local storage using server response { items: [...] }
export function rehydrateFromServer(response) {
	try {
		const items = Array.isArray(response?.items) ? response.items : [];
		const normalized = items.map(normalizeFromServer).filter(Boolean);
		setAll(normalized);
		return normalized;
	} catch {
		return list();
	}
}

// Convenience: fetch server wishlist and rehydrate local storage
export async function fetchAndRehydrateFromServer() {
	try {
		const token = (typeof window !== 'undefined') ? (localStorage.getItem('user_token') || localStorage.getItem('vtc_access_token')) : null;
		if (!token) return list();
		const mod = await import('../api/wishlistApi');
		const resp = await mod.getWishlist();
		return rehydrateFromServer(resp);
	} catch {
		return list();
	}
}

// Subscribe to wishlist changes in this tab and cross-tab
export function subscribe(listener) {
	const w = safeWindow();
	if (!w) return () => {};
	const onStorage = (e) => { if (e.key === STORAGE_KEY) listener(list()); };
	const onCustom = () => listener(list());
	w.addEventListener('storage', onStorage);
	w.addEventListener(CUSTOM_EVENT, onCustom);
	// Return unsubscribe that removes both listeners
	return () => {
		try { w.removeEventListener('storage', onStorage); } catch { /* noop */ }
		try { w.removeEventListener(CUSTOM_EVENT, onCustom); } catch { /* noop */ }
	};
}

export default { list, add, remove, toggle, has, clear, subscribe, replaceAll };

// Replace entire wishlist with provided items (normalizes shape) and notify listeners
export function replaceAll(items = []) {
	const normalized = (Array.isArray(items) ? items : []).map((item) => ({
		id: item?.id ?? item?.productId ?? null,
		sku: item?.sku ?? item?.SKU ?? item?.skuCode ?? null,
		name: item?.name ?? item?.productName ?? 'Product',
		image: item?.image ?? item?.imageUrl ?? item?.primaryImageUrl ?? (Array.isArray(item?.imageUrls) ? item.imageUrls[0] : null) ?? '',
		price: Number(item?.price ?? item?.basePrice ?? 0) || 0,
	}));
	write(normalized);
	return normalized;
}

