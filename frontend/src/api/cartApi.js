import apiClient from './axios';
import { normalizeError } from './apiUtils';

const BASE = '/api/cart';

function unwrap(res) {
	return res?.data ?? null;
}

export async function getCart() {
	try {
		const res = await apiClient.get(BASE);
		return unwrap(res);
	} catch (e) {
		throw normalizeError(e);
	}
}

export async function addItem(payload) {
	try {
		const res = await apiClient.post(`${BASE}/add`, payload);
		return unwrap(res);
	} catch (e) {
		throw normalizeError(e);
	}
}

export async function updateItem(cartItemId, payload) {
	try {
		const res = await apiClient.put(`${BASE}/item/${cartItemId}`, payload);
		return unwrap(res);
	} catch (e) {
		throw normalizeError(e);
	}
}

export async function removeItem(cartItemId) {
	try {
		await apiClient.delete(`${BASE}/item/${cartItemId}`);
	} catch (e) {
		throw normalizeError(e);
	}
}

export async function clearCart() {
	try {
		await apiClient.delete(`${BASE}/clear`);
	} catch (e) {
		throw normalizeError(e);
	}
}

export async function mergeLocal(items) {
	try {
		const res = await apiClient.post(`${BASE}/merge-local`, items ?? []);
		return unwrap(res);
	} catch (e) {
		throw normalizeError(e);
	}
}

export default {
	getCart,
	addItem,
	updateItem,
	removeItem,
	clearCart,
	mergeLocal,
};
