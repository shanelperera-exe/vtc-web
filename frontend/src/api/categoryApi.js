import apiClient from './axios';
import { normalizeError, mapPage, buildQuery, cacheGet, cacheSet, cacheInvalidate } from './apiUtils';

const BASE = '/api/categories';

/**
 * Fetch paged categories.
 * Returned Category shape (server DTO):
 * { id, name, description, status: 'active'|'inactive', catMainImg, catTileImage1, catTileImage2, carouselImg, productCount }
 */
export async function listCategories({ page = 0, size = 50, sort, status } = {}) {
	const key = `categories:list:${page}:${size}:${sort || ''}:${status || ''}`;
	const cached = cacheGet(key);
	if (cached) return cached;
	try {
		const qs = buildQuery({ page, size, sort, status });
		const res = await apiClient.get(`${BASE}${qs}`);
		const mapped = mapPage(res.data);
		cacheSet(key, mapped);
		return mapped;
	} catch (e) { throw normalizeError(e); }
}

export async function getCategory(id) {
	try {
		const res = await apiClient.get(`${BASE}/${id}`);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function createCategory(payload) {
	try {
		const res = await apiClient.post(BASE, payload);
		cacheInvalidate('categories:list');
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function updateCategory(id, payload) {
	try {
		const res = await apiClient.put(`${BASE}/${id}`, payload);
		cacheInvalidate('categories:list');
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function deleteCategory(id) {
	try {
		await apiClient.delete(`${BASE}/${id}`);
		cacheInvalidate('categories:list');
		return true;
	} catch (e) { throw normalizeError(e); }
}

// Upload a category image
/**
 * Upload a category image.
 * slot values (new naming only):
 *  - main     -> catMainImg
 *  - tile1    -> catTileImage1
 *  - tile2    -> catTileImage2
 *  - carousel -> carouselImg (dedicated carousel image)
 * If omitted defaults to 'main'. Legacy names (icon, carousel2, carousel-as-tile2) no longer accepted.
 */
export async function uploadCategoryImage(categoryId, file, slot = 'main') {
	try {
		const form = new FormData();
		form.append('file', file);
		if (slot) form.append('slot', slot);
		const res = await apiClient.post(`${BASE}/${categoryId}/image/upload`, form);
		cacheInvalidate('categories:list');
		return res.data; // { categoryId, slot, url, publicId, bytes, format }
	} catch (e) { throw normalizeError(e); }
}

export default {
	listCategories,
	getCategory,
	createCategory,
	updateCategory,
	deleteCategory,
	uploadCategoryImage,
};
