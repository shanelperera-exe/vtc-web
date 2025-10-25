import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import authApi from '../api/authApi';
import cartApi from '../api/cartApi';
import wishlistApi from '../api/wishlistApi';
import * as wishlist from '../utils/wishlist';
import { getAppMode } from '../api/axios';
import { useNotifications } from '../components/ui/notificationsContext';
import { mergeLocalCartToBackend, hasLocalCartItems } from '../store/cartLocalStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [lastAction, setLastAction] = useState(null); // 'login' | 'register' | null
  // Notification provider is mounted above AuthProvider in both apps
  const notifier = useNotifications();

  const syncGuestCart = useCallback(async () => {
    if (!notifier) return;
    if (getAppMode() === 'admin') return;
    if (!hasLocalCartItems()) return;
    try {
      const result = await mergeLocalCartToBackend(cartApi.mergeLocal);
      // After a successful merge, ask cart to rehydrate from backend
      try { window.dispatchEvent(new Event('vtc:cart:rehydrate')); } catch { }
      if (!result) return;
      const failures = Array.isArray(result.mergeFailures) ? result.mergeFailures : [];
      const syncedCount = Array.isArray(result.items) ? result.items.length : 0;
      if (failures.length) {
        failures.forEach((failure) => {
          const reason = failure?.reason || 'Item unavailable';
          notifier.notify({ type: 'warning', text: reason, duration: 6000 });
        });
        if (syncedCount > 0) {
          notifier.notify({ type: 'info', text: 'Available items from your saved cart were added to your account.' });
        }
      } else if (syncedCount > 0) {
        notifier.notify({ type: 'success', text: 'Your saved cart has been synced.' });
      }
    } catch (e) {
      notifier.notify({ type: 'error', text: 'Unable to sync your saved cart right now.' });
    }
  }, [notifier]);

  const syncGuestWishlist = useCallback(async () => {
    if (!notifier) return;
    if (getAppMode() === 'admin') return;
    try {
      // read local wishlist ids
      const raw = localStorage.getItem('vtc_wishlist');
      const list = raw ? JSON.parse(raw) : [];
      const ids = Array.isArray(list) ? list.map(i => i.id).filter(Boolean) : [];
      if (!ids.length) return;
      const resp = await wishlistApi.mergeLocalWishlist(ids);
      // clear local wishlist after successful merge (quietly)
      try { localStorage.removeItem('vtc_wishlist'); } catch { }
      try { window.dispatchEvent(new CustomEvent('vtc:wishlist:rehydrate')); } catch { }
    } catch (e) {
      // notify only on error
      notifier.notify({ type: 'error', text: 'Unable to sync your saved wishlist right now.' });
    }
  }, [notifier]);

  // Load existing token & profile
  useEffect(() => {
    let ignore = false;
    const init = async () => {
      const mode = getAppMode();
      const tokenKey = mode === 'admin' ? 'admin_token' : 'user_token';
      const userKey = mode === 'admin' ? 'admin_user' : 'user_user';
      // Hydrate from localStorage first for immediate role checks
      try {
        const raw = localStorage.getItem(userKey) || localStorage.getItem('vtc_user');
        const u = JSON.parse(raw || 'null');
        if (u && !ignore) setUser(u);
      } catch { }
      let token = localStorage.getItem(tokenKey) || localStorage.getItem('vtc_access_token');
      try {
        if (!token) {
          // Try to get a new access token via refresh cookie (silent login)
          const r = await authApi.refresh();
          if (r?.accessToken) {
            token = r.accessToken;
            try { localStorage.setItem(tokenKey, token); } catch { }
          }
        }
        if (token) {
          const u = await authApi.me();
          if (!ignore) setUser(u);
          // tell cart to rehydrate from backend on startup silent login
          try { window.dispatchEvent(new CustomEvent('vtc:cart:rehydrate')); } catch { }
          // also attempt to merge any guest wishlist into user's wishlist
          try {
            await syncGuestWishlist();
            // After sync/merge, fetch the canonical server wishlist and mirror it locally
            try { await wishlist.fetchAndRehydrateFromServer(); } catch { }
          } catch { }
        } else {
          // no token available; ensure we are treated as logged out
          if (!ignore) setUser(null);
        }
      } catch {
        try { localStorage.removeItem(tokenKey); } catch { }
        if (!ignore) setUser(null);
      } finally { if (!ignore) setLoading(false); }
    };
    init();
    return () => { ignore = true; };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setAuthError(null); setLastAction(null);
    try {
      const res = await authApi.login({ email, password });
      const mode = getAppMode();
      const tokenKey = mode === 'admin' ? 'admin_token' : 'user_token';
      const userKey = mode === 'admin' ? 'admin_user' : 'user_user';
      if (res?.accessToken) try { localStorage.setItem(tokenKey, res.accessToken); } catch { }
      setUser(res.user); try { localStorage.setItem(userKey, JSON.stringify(res.user)); } catch { }
      setLastAction('login');
      await syncGuestCart();
      try {
        await syncGuestWishlist();
        // Rehydrate wishlist from backend so UI reflects persisted state across the app
        try { await wishlist.fetchAndRehydrateFromServer(); } catch { }
      } catch { }
      try { window.dispatchEvent(new CustomEvent('vtc:cart:rehydrate')); } catch { }
      notifier?.notify({ type: 'success', text: 'Welcome back!' });
      // Refresh the whole page so all components rehydrate from latest auth state
      try { setTimeout(() => window.location.reload(), 200); } catch { }
      return res.user;
    } catch (e) {
      const msg = e.message || 'Login failed';
      setAuthError(msg);
      notifier?.notify({ type: 'error', text: msg });
      throw e;
    }
  }, [notifier]);

  const register = useCallback(async (payload) => {
    setAuthError(null); setLastAction(null);
    try {
      const res = await authApi.register(payload);
      const mode = getAppMode();
      const tokenKey = mode === 'admin' ? 'admin_token' : 'user_token';
      const userKey = mode === 'admin' ? 'admin_user' : 'user_user';
      if (res?.accessToken) try { localStorage.setItem(tokenKey, res.accessToken); } catch { }
      setUser(res.user); try { localStorage.setItem(userKey, JSON.stringify(res.user)); } catch { }
      setLastAction('register');
      await syncGuestCart();
      try {
        await syncGuestWishlist();
        try { await wishlist.fetchAndRehydrateFromServer(); } catch { }
      } catch { }
      try { window.dispatchEvent(new CustomEvent('vtc:cart:rehydrate')); } catch { }
      notifier?.notify({ type: 'success', text: 'Account created successfully!' });
      // Refresh to apply authenticated state across the app
      try { setTimeout(() => window.location.reload(), 200); } catch { }
      return res.user;
    } catch (e) {
      const msg = e.message || 'Registration failed';
      setAuthError(msg);
      notifier?.notify({ type: 'error', text: msg });
      throw e;
    }
  }, [notifier]);

  const refreshProfile = useCallback(async () => {
    try {
      const u = await authApi.me();
      const mode = getAppMode();
      const userKey = mode === 'admin' ? 'admin_user' : 'user_user';
      setUser(u); try { localStorage.setItem(userKey, JSON.stringify(u)); } catch { }
      return u;
    } catch (e) {
      // token likely invalid
      const mode = getAppMode();
      const tokenKey = mode === 'admin' ? 'admin_token' : 'user_token';
      try { localStorage.removeItem(tokenKey); } catch { }
      setUser(null);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    const mode = getAppMode();
    const tokenKey = mode === 'admin' ? 'admin_token' : 'user_token';
    const userKey = mode === 'admin' ? 'admin_user' : 'user_user';
    try { localStorage.removeItem(tokenKey); } catch { }
    try { localStorage.removeItem(userKey); } catch { }
    // Also remove legacy keys if present
    try { localStorage.removeItem('vtc_access_token'); } catch { }
    try { localStorage.removeItem('vtc_user'); } catch { }
    // Clear wishlist entirely so logged-out users don't see previous items
    try { wishlist.clear(); } catch { }
    try { localStorage.removeItem('vtc_wishlist'); } catch { }
    try { window.dispatchEvent(new CustomEvent('vtc:wishlist:rehydrate')); } catch { }
    setUser(null);
    try { window.dispatchEvent(new CustomEvent('vtc:cart:rehydrate')); } catch { }
    // reload the page to clear any cached authenticated UI
    try { setTimeout(() => window.location.reload(), 100); } catch { }
  }, []);

  const value = {
    user,
    // Consider authenticated only if we have both a user object AND a stored access token
    isAuthenticated: (() => {
      if (!user) return false;
      try {
        const mode = getAppMode();
        const tokenKey = mode === 'admin' ? 'admin_token' : 'user_token';
        const t = localStorage.getItem(tokenKey) || localStorage.getItem('vtc_access_token');
        return !!t;
      } catch {
        return false;
      }
    })(),
    loading,
    authError,
    login,
    register,
    lastAction,
    logout,
    refreshProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
