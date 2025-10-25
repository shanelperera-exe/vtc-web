// Central axios instance configuration
// Uses Vite env variable VITE_API_BASE_URL or falls back to localhost:8080
// Adds basic request/response interceptors for logging and error normalization.

import axios from 'axios';

// Determine which app is running (user or admin) based on subdomain or path)
// - admin app if hostname starts with 'admin.' OR a forced env flag OR pathname begins with '/admin'
export function getAppMode() {
	try {
		const forced = import.meta?.env?.VITE_FORCE_APP_MODE;
		if (forced === 'admin' || forced === 'user') return forced;
		const { hostname, pathname } = window.location || {};
		if (hostname && /^admin\./i.test(hostname)) return 'admin';
		if (pathname && pathname.startsWith('/admin')) return 'admin';
	} catch {}
	return 'user';
}

// Storage key helpers (explicit names per requirements)
export function getStorageKeysForApp(mode = getAppMode()) {
	const isAdmin = mode === 'admin';
	return {
		tokenKey: isAdmin ? 'admin_token' : 'user_token',
		userKey: isAdmin ? 'admin_user' : 'user_user',
		// legacy fallbacks for backward compatibility
		legacyTokenKey: 'vtc_access_token',
		legacyUserKey: 'vtc_user',
	};
}

function getTokenFromStorage(preferredKey, legacyKey) {
	try {
		const t = localStorage.getItem(preferredKey);
		if (t) return t;
		// fallback to legacy key to avoid breaking existing logins during rollout
		return localStorage.getItem(legacyKey) || null;
	} catch {
		return null;
	}
}

function setTokenInStorage(preferredKey, value) {
	try {
		if (value) localStorage.setItem(preferredKey, value);
		else localStorage.removeItem(preferredKey);
	} catch {}
}

function removeTokenInStorage(preferredKey) {
	try { localStorage.removeItem(preferredKey); } catch {}
}

const baseURL = import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';

export const apiClient = axios.create({
	baseURL,
	timeout: 60000, // increased to allow large image uploads
	withCredentials: true // allow sending cookies for refresh token rotation
});

// Request interceptor (can attach auth tokens here later)
apiClient.interceptors.request.use((config) => {
	// Let the browser set multipart boundaries automatically.
	// Only apply JSON content-type when payload is plain object and not FormData.
	const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
	if (!isFormData) {
		config.headers = {
			...(config.headers || {}),
			'Content-Type': config.headers?.['Content-Type'] || 'application/json',
			Accept: 'application/json'
		};
	}
	// Attach access token if present, selecting the correct storage key
	const mode = getAppMode();
	const { tokenKey, legacyTokenKey } = getStorageKeysForApp(mode);
	const isAdminEndpoint = (config.url || '').startsWith('/api/admin');
	// if calling admin endpoints from a mixed app, enforce admin key
	const effectiveTokenKey = isAdminEndpoint ? getStorageKeysForApp('admin').tokenKey : tokenKey;
	const token = getTokenFromStorage(effectiveTokenKey, legacyTokenKey);
	if (token && !config.headers['Authorization']) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

// Response interceptor for uniform error shape
// Basic retry for certain transient failures (network timeout) on upload endpoints only
let isRefreshing = false;
let refreshWaitQueue = [];

function queueRefreshRequest() {
  return new Promise((resolve, reject) => {
    refreshWaitQueue.push({ resolve, reject });
  });
}

function flushRefreshQueue(error, token) {
  refreshWaitQueue.forEach(p => {
    if (error) p.reject(error); else p.resolve(token);
  });
  refreshWaitQueue = [];
}

apiClient.interceptors.response.use(
	(res) => res,
	async (error) => {
		const config = error.config;
		if (!config) return Promise.reject(error);
		const status = error.response?.status;
		// Do not attempt to refresh if the failing request is the refresh endpoint itself
		const isAuthRefreshCall = (config.url || '').includes('/api/auth/refresh');
		// Basic retry for uploads
		const isUpload = /\/image\/upload$/.test(config.url || "");
		if (isUpload) {
			config.__retryCount = config.__retryCount || 0;
			if (config.__retryCount < 2 && (error.code === 'ECONNABORTED' || error.message?.includes('timeout'))) {
				config.__retryCount += 1;
				return apiClient(config);
			}
		}
		// Handle 401 with one-time refresh attempt
		if (status === 401 && !config.__isRetryAuth && !isAuthRefreshCall) {
			config.__isRetryAuth = true;
			try {
				if (!isRefreshing) {
					isRefreshing = true;
					const refreshRes = await apiClient.post('/api/auth/refresh');
					const newToken = refreshRes.data?.accessToken;
					if (newToken) {
						// store into the correct key depending on the original request
						const isAdminReq = (config.url || '').startsWith('/api/admin');
						const { tokenKey } = getStorageKeysForApp(isAdminReq ? 'admin' : getAppMode());
						setTokenInStorage(tokenKey, newToken);
						// Notify interested contexts (e.g., cart) to rehydrate silently
						try { window.dispatchEvent(new CustomEvent('vtc:cart:rehydrate')); } catch {}
						flushRefreshQueue(null, newToken);
					} else {
						flushRefreshQueue(new Error('No access token from refresh'));
					}
				} else {
					const newToken = await queueRefreshRequest();
					config.headers['Authorization'] = `Bearer ${newToken}`;
					return apiClient(config);
				}
			} catch (refreshErr) {
				flushRefreshQueue(refreshErr);
				const { tokenKey } = getStorageKeysForApp();
				removeTokenInStorage(tokenKey);
				return Promise.reject(refreshErr);
			} finally {
				isRefreshing = false;
			}
			const { tokenKey, legacyTokenKey } = getStorageKeysForApp();
			const token = getTokenFromStorage(tokenKey, legacyTokenKey);
			if (token) {
				config.headers['Authorization'] = `Bearer ${token}`;
				return apiClient(config);
			}
		}
		return Promise.reject(error);
	}
);

export function getBaseUrl() { return baseURL; }

export default apiClient;
