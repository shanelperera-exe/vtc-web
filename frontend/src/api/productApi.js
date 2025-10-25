import apiClient from './axios';
import { normalizeError, mapPage, buildQuery, cacheGet, cacheSet, cacheInvalidate } from './apiUtils';

const BASE = '/api/products';

export async function listProducts({ page = 0, size = 20, sort, status, stock } = {}) {
	const key = `products:list:${page}:${size}:${sort || ''}:${status || ''}`;
	const cached = cacheGet(key);
	if (cached) return cached;
	try {
		const qs = buildQuery({ page, size, sort, status, stock });
		const res = await apiClient.get(`${BASE}${qs}`);
		const mapped = mapPage(res.data);
		cacheSet(key, mapped);
		return mapped;
	} catch (e) { throw normalizeError(e); }
}

export async function listProductsByCategory(categoryId, { page = 0, size = 20, sort, status, stock } = {}) {
	try {
		const qs = buildQuery({ page, size, sort, status, stock });
		const res = await apiClient.get(`${BASE}/by-category/${categoryId}${qs}`);
		return mapPage(res.data);
	} catch (e) { throw normalizeError(e); }
}

export async function searchProducts({ name, sku, page = 0, size = 20, status, stock } = {}) {
	try {
		const qs = buildQuery({ name, sku, page, size, status, stock });
		const res = await apiClient.get(`${BASE}/search${qs}`);
		return mapPage(res.data);
	} catch (e) { throw normalizeError(e); }
}

export async function getProduct(id) {
	try {
		const res = await apiClient.get(`${BASE}/${id}`);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function getProductDetails(id) {
	try {
		const res = await apiClient.get(`${BASE}/${id}/details`);
		return res.data; // may be null (404) -> axios throw
	} catch (e) { throw normalizeError(e); }
}

export async function previewNextSku(categoryId) {
	if (categoryId === undefined || categoryId === null) throw new Error('categoryId required');
	try {
		const res = await apiClient.get(`${BASE}/next-sku?categoryId=${encodeURIComponent(categoryId)}`);
		return res.data?.sku;
	} catch (e) { throw normalizeError(e); }
}

// Aggregated stats by SKU
export async function getProductStatsBySku(sku, { days = 90 } = {}) {
	if (!sku) throw new Error('SKU required');
	try {
		const res = await apiClient.get(`${BASE}/by-sku/${encodeURIComponent(sku)}/stats?days=${encodeURIComponent(days)}`);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function createProduct(payload) {
	try {
		const res = await apiClient.post(BASE, payload);
		cacheInvalidate('products:list');
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

// Create full product (base + images + variations) atomically
export async function createProductFull(payload) {
	try {
		const res = await apiClient.post(`${BASE}/add`, payload);
		cacheInvalidate('products:list');
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function updateProduct(id, payload, { newCategoryId } = {}) {
	try {
		const qs = buildQuery({ newCategoryId });
		const res = await apiClient.put(`${BASE}/${id}${qs}`, payload);
		cacheInvalidate('products:list');
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

// Update status only (more reliable, dedicated endpoint)
export async function updateProductStatus(id, status) {
	try {
		const res = await apiClient.put(`${BASE}/${id}/status`, { status });
		cacheInvalidate('products:list');
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function deleteProduct(id) {
	try {
		await apiClient.delete(`${BASE}/${id}`);
		cacheInvalidate('products:list');
		return true;
	} catch (e) { throw normalizeError(e); }
}

// Upload a product image via backend-proxied Cloudinary flow (legacy, kept for compatibility)
export async function uploadProductImage(productId, file, { type } = {}) {
	if (!productId) throw new Error('productId required');
	if (!file) throw new Error('file required');
	try {
		const form = new FormData();
		form.append('file', file);
		if (type) form.append('type', type);
		const res = await apiClient.post(`${BASE}/${productId}/images/upload`, form);
		return res.data; // {id,url,type,publicId,...}
	} catch (e) { throw normalizeError(e); }
}

// Sync product images (primary + gallery) in one call. Accepts URLs or data URIs.
export async function syncProductImages(productId, { primaryImage, secondaryImages = [] } = {}) {
	if (!productId) throw new Error('productId required');
	try {
		const payload = {
			primaryImage: primaryImage || null,
			secondaryImages: Array.isArray(secondaryImages) ? secondaryImages : []
		};
		const res = await apiClient.post(`${BASE}/${productId}/images/sync`, payload);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function uploadVariationImage(productId, variationId, file, { type } = {}) {
	if (!productId || !variationId) throw new Error('productId and variationId required');
	if (!file) throw new Error('file required');
	try {
		const form = new FormData();
		form.append('file', file);
		if (type) form.append('type', type);
		const res = await apiClient.post(`${BASE}/${productId}/variations/${variationId}/images/upload`, form);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

// Variation CRUD
export async function listVariations(productId, { page = 0, size = 50 } = {}) {
	if (!productId) throw new Error('productId required');
	try {
		const qs = buildQuery({ page, size });
		const res = await apiClient.get(`${BASE}/${productId}/variations${qs}`);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function listAllVariations(productId) {
	if (!productId) throw new Error('productId required');
	try {
		const res = await apiClient.get(`${BASE}/${productId}/variations/all`);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function createVariation(productId, payload) {
	if (!productId) throw new Error('productId required');
	try {
		const res = await apiClient.post(`${BASE}/${productId}/variations`, payload);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function updateVariation(productId, id, payload) {
	if (!productId || !id) throw new Error('productId and id required');
	try {
		const res = await apiClient.put(`${BASE}/${productId}/variations/${id}`, payload);
		return res.data;
	} catch (e) { throw normalizeError(e); }
}

export async function deleteVariation(productId, id) {
	if (!productId || !id) throw new Error('productId and id required');
	try {
		await apiClient.delete(`${BASE}/${productId}/variations/${id}`);
		return true;
	} catch (e) { throw normalizeError(e); }
}

export default {
	listProducts,
	listProductsByCategory,
	searchProducts,
	getProduct,
	getProductDetails,
	previewNextSku,
	getProductStatsBySku,
	createProduct,
    createProductFull,
	updateProduct,
  updateProductStatus,
	deleteProduct,
	uploadProductImage,
	syncProductImages,
	uploadVariationImage,
  listVariations,
  listAllVariations,
  createVariation,
  updateVariation,
  deleteVariation,
};
