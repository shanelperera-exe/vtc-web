const LOCAL_CART_KEY = 'vtc_guest_cart';
const LOCAL_CART_DISPLAY_KEY = 'vtc_guest_cart_display';

export function getLocalCart() {
	try {
		const raw = localStorage.getItem(LOCAL_CART_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

export function setLocalCart(items) {
	try {
		localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items ?? []));
	} catch {}
}

export function clearLocalCart() {
	try {
		localStorage.removeItem(LOCAL_CART_KEY);
	} catch {}
}

export async function mergeLocalCartToBackend(mergeFn) {
	const localItems = getLocalCart();
	if (!localItems.length) return null;
	const result = await mergeFn(localItems);
	clearLocalCart();
	return result;
}

export function hasLocalCartItems() {
	const items = getLocalCart();
	return Array.isArray(items) && items.length > 0;
}

// Display-only storage for guest UI rendering
export function getLocalDisplayCart() {
	try {
		const raw = localStorage.getItem(LOCAL_CART_DISPLAY_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

export function setLocalDisplayCart(items) {
	try {
		localStorage.setItem(LOCAL_CART_DISPLAY_KEY, JSON.stringify(items ?? []));
	} catch {}
}

export function clearLocalDisplayCart() {
	try {
		localStorage.removeItem(LOCAL_CART_DISPLAY_KEY);
	} catch {}
}
