import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import cartApi from '../api/cartApi'
import { getLocalCart, setLocalCart, clearLocalCart } from '../store/cartLocalStorage'
import { useNotifications } from '../components/ui/notificationsContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth() || {}
  const notifier = useNotifications()
  const [items, setItems] = useState([])
  const [serverSummary, setServerSummary] = useState({ subtotal: 0, tax: 0, total: 0 })
  const mounted = useRef(false)

  const mapApiItemToUI = (it) => {
    const attrs = it?.attributes || {}
    const keys = Object.keys(attrs)
    const findKey = (needle) => keys.find(k => {
      const lk = k?.toLowerCase?.() || ''
      return lk === needle || lk.includes(needle)
    })
    // Try color/colour and size
    let colorKey = findKey('color') || findKey('colour')
    let sizeKey = findKey('size')

    // Fallback: parse variationKey if provided (supports formats like "color=Red;size=M" or "Color:Red|Size:M")
    const parsedFromKey = (() => {
      const map = {}
      const vk = it?.variationKey
      if (!vk || typeof vk !== 'string') return map
      try {
        // Split by common separators then by = or :
        const pairs = vk.split(/[|;,]/).map(s => s.trim()).filter(Boolean)
        pairs.forEach(p => {
          const [rawK, ...rest] = p.split(/[=:]/)
          if (!rawK) return
          const val = rest.join(':').trim()
          const key = rawK.trim()
          if (key) map[key] = val
        })
      } catch {}
      return map
    })()

    let color = colorKey ? attrs[colorKey] : undefined
    let size = sizeKey ? attrs[sizeKey] : undefined

    if (!color || !size) {
      const pkeys = Object.keys(parsedFromKey)
      const findParsed = (needle) => pkeys.find(k => {
        const lk = k?.toLowerCase?.() || ''
        return lk === needle || lk.includes(needle)
      })
      if (!color) {
        const pk = findParsed('color') || findParsed('colour')
        if (pk) color = parsedFromKey[pk]
      }
      if (!size) {
        const pk = findParsed('size')
        if (pk) size = parsedFromKey[pk]
      }
    }

    return {
      id: it.productVariationId ?? it.id,
      name: it.productName,
      image: it.imageUrl,
      variationKey: it.variationKey,
      price: Number(it.price),
      quantity: it.quantity ?? 1,
      cartItemId: it.id, // server cart item id
      color,
      size,
      // include any server-provided stock information if present (preserve 0)
      availableStock: (() => {
        const v = it.stock ?? it.availableStock ?? it.quantityAvailable ?? it.maxAvailable
        return v != null ? Number(v) : null
      })(),
    }
  }

  // Hydrate cart on mount and whenever auth changes
  useEffect(() => {
    let ignore = false
    const hydrate = async () => {
      try {
        if (isAuthenticated) {
          // Load from backend for the authenticated user
          const res = await cartApi.getCart()
          if (ignore) return
          const apiItems = Array.isArray(res?.items) ? res.items : []
          setItems(apiItems.map(mapApiItemToUI))
          setServerSummary({
            subtotal: Number(res?.subtotal) || 0,
            tax: Number(res?.tax) || 0,
            total: Number(res?.total) || 0,
          })
        } else {
          // Guest cart from localStorage; map to UI shape
          const local = getLocalCart()
          if (ignore) return
          const mapped = (Array.isArray(local) ? local : []).map(it => ({
            id: it.productVariationId ?? it.id,
            name: it.name,
            image: it.imageUrl || it.image,
            price: Number(it.price) || 0,
            quantity: it.quantity ?? 1,
            color: it.color,
            size: it.size,
          }))
          setItems(mapped)
          setServerSummary({ subtotal: 0, tax: 0, total: 0 })
        }
      } catch (e) {
        // Silent fallback to empty cart on error (avoid noisy UX during token refresh)
        if (!ignore) {
          setItems([])
          setServerSummary({ subtotal: 0, tax: 0, total: 0 })
          // Intentionally no notification: token expiry will trigger silent refresh & rehydrate
        }
      }
    }
    hydrate()
    mounted.current = true
    return () => { ignore = true }
  }, [isAuthenticated, user?.id])

  // Listen to global rehydrate events (fired by AuthContext after login/logout or silent refresh)
  useEffect(() => {
    const handler = () => {
      // trigger the same logic by toggling a state dependency
      // simplest: call the same hydrate path by invoking getCart or local read
      (async () => {
        try {
          if (isAuthenticated) {
            const res = await cartApi.getCart()
            const apiItems = Array.isArray(res?.items) ? res.items : []
            setItems(apiItems.map(mapApiItemToUI))
            setServerSummary({
              subtotal: Number(res?.subtotal) || 0,
              tax: Number(res?.tax) || 0,
              total: Number(res?.total) || 0,
            })
          } else {
            const local = getLocalCart()
            setItems(Array.isArray(local) ? local : [])
            setServerSummary({ subtotal: 0, tax: 0, total: 0 })
          }
        } catch {}
      })()
    }
    window.addEventListener('vtc:cart:rehydrate', handler)
    return () => window.removeEventListener('vtc:cart:rehydrate', handler)
  }, [isAuthenticated])

  const addToCart = async (product, quantity = 1) => {
    if (!product) return
    const variationId = product.selectedVariationId || product.variationId || product.productVariationId || product.id
    if (!variationId) return
    // If product provides stock information, and requested quantity exceeds it, notify and abort
    const availableStock = product?.stock ?? product?.unitsLeft ?? product?.availableStock ?? null
    if (availableStock != null && Number(quantity) > Number(availableStock)) {
      notifier?.notify?.({ type: 'error', text: `Cannot add ${quantity} — only ${availableStock} available` })
      return
    }
    // optimistic local update
    setItems(prev => {
      const idx = prev.findIndex(p => (p.id === variationId))
      if (idx !== -1) {
        const next = [...prev]
        const currentQty = next[idx].quantity || 1
        // if item already exists, and there's an availableStock guard, prevent exceeding it locally
        if (availableStock != null && (currentQty + quantity) > Number(availableStock)) {
          notifier?.notify?.({ type: 'error', text: `Cannot update quantity — only ${availableStock} available` })
          return prev
        }
        next[idx] = { ...next[idx], quantity: currentQty + quantity }
        return next
      }
      return [...prev, {
        id: variationId,
        name: product.name,
        image: product.imageUrl || product.image,
        price: Number(product.price) || 0,
        quantity,
        // store available stock on the cart item for later validation in the UI
        availableStock: availableStock != null ? Number(availableStock) : null,
        color: product.color,
        size: product.size,
      }]
    })
    try {
      if (isAuthenticated) {
        await cartApi.addItem({ productVariationId: variationId, quantity })
        // refresh from backend to capture server-computed totals and ids
        const res = await cartApi.getCart()
        const apiItems = Array.isArray(res?.items) ? res.items : []
        setItems(apiItems.map(mapApiItemToUI))
        setServerSummary({
          subtotal: Number(res?.subtotal) || 0,
          tax: Number(res?.tax) || 0,
          total: Number(res?.total) || 0,
        })
      } else {
        // persist guest cart in a shape suitable for backend merge
        const prev = getLocalCart()
        const next = Array.isArray(prev) ? [...prev] : []
        const idx = next.findIndex(p => (p.productVariationId ?? p.id) === variationId)
        if (idx !== -1) {
          const currentQty = next[idx].quantity || 1
          // If availableStock provided in local saved item, guard against exceeding it
          const localAvailable = next[idx].availableStock ?? next[idx].stock ?? null
          if (localAvailable != null && (currentQty + quantity) > Number(localAvailable)) {
            notifier?.notify?.({ type: 'error', text: `Cannot update quantity — only ${localAvailable} available` })
            // Persist unchanged
            setLocalCart(next)
            return
          }
          next[idx] = { ...next[idx], quantity: currentQty + quantity }
        } else {
          next.push({
            productVariationId: variationId,
            quantity,
            // optional fields for UI when guest
            name: product.name,
            imageUrl: product.imageUrl || product.image,
            price: Number(product.price) || 0,
            color: product.color,
            size: product.size,
            availableStock: availableStock != null ? Number(availableStock) : null,
          })
        }
        setLocalCart(next)
      }
    } catch (e) {
      // If server responded with stock info (409), show that and refresh cart state
      const err = e || {}
      if (err.status === 409 || err.availableStock != null) {
        const avail = err.availableStock != null ? err.availableStock : null
        const text = err.message || 'Insufficient stock'
        notifier?.notify?.({ type: 'error', text: avail != null ? `${text} — only ${avail} available` : text })
        try {
          if (isAuthenticated) {
            const res = await cartApi.getCart()
            const apiItems = Array.isArray(res?.items) ? res.items : []
            setItems(apiItems.map(mapApiItemToUI))
            setServerSummary({
              subtotal: Number(res?.subtotal) || 0,
              tax: Number(res?.tax) || 0,
              total: Number(res?.total) || 0,
            })
          } else {
            // For guests, reload local cart representation
            const local = getLocalCart()
            setItems(Array.isArray(local) ? local : [])
          }
        } catch (_ignore) {}
        return
      }
      notifier?.notify?.({ type: 'error', text: e?.message || 'Failed to add to cart' })
    }
  }

  const removeFromCart = async (id) => {
    setItems(prev => prev.filter(p => p.id !== id))
    try {
      if (isAuthenticated) {
        // find server cartItemId for this variation id
        const target = items.find(p => p.id === id)
        const serverId = target?.cartItemId
        if (serverId) await cartApi.removeItem(serverId)
        const res = await cartApi.getCart()
        const apiItems = Array.isArray(res?.items) ? res.items : []
        setItems(apiItems.map(mapApiItemToUI))
        setServerSummary({
          subtotal: Number(res?.subtotal) || 0,
          tax: Number(res?.tax) || 0,
          total: Number(res?.total) || 0,
        })
      } else {
        const prev = getLocalCart() || []
        const next = prev.filter(p => (p.productVariationId ?? p.id) !== id)
        setLocalCart(next)
      }
    } catch (e) {
      notifier?.notify?.({ type: 'error', text: e?.message || 'Failed to remove item' })
    }
  }

  const updateQuantity = async (id, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1)
    // Validate against availableStock stored on item (if present)
    const current = items.find(p => p.id === id)
    const avail = current?.availableStock ?? current?.stock ?? null
    if (avail != null && qty > Number(avail)) {
      notifier?.notify?.({ type: 'error', text: `Only ${avail} available for ${current?.name || 'this item'}` })
      return
    }
    setItems(prev => prev.map(p => (p.id === id ? { ...p, quantity: qty } : p)))
    try {
      if (isAuthenticated) {
        const target = items.find(p => p.id === id)
        const serverId = target?.cartItemId
        if (serverId) await cartApi.updateItem(serverId, { quantity: qty })
        const res = await cartApi.getCart()
        const apiItems = Array.isArray(res?.items) ? res.items : []
        setItems(apiItems.map(it => ({
          id: it.productVariationId ?? it.id,
          name: it.productName,
          image: it.imageUrl,
          variationKey: it.variationKey,
          price: Number(it.price),
          quantity: it.quantity ?? 1,
          cartItemId: it.id
        })))
        setServerSummary({
          subtotal: Number(res?.subtotal) || 0,
          tax: Number(res?.tax) || 0,
          total: Number(res?.total) || 0,
        })
      } else {
        const prev = getLocalCart() || []
        const next = prev.map(p => ((p.productVariationId ?? p.id) === id ? { ...p, quantity: qty } : p))
        setLocalCart(next)
      }
    } catch (e) {
      const err = e || {}
      if (err.status === 409 || err.availableStock != null) {
        const avail = err.availableStock != null ? err.availableStock : null
        const text = err.message || 'Insufficient stock'
        notifier?.notify?.({ type: 'error', text: avail != null ? `${text} — only ${avail} available` : text })
        try {
          if (isAuthenticated) {
            const res = await cartApi.getCart()
            const apiItems = Array.isArray(res?.items) ? res.items : []
            setItems(apiItems.map(mapApiItemToUI))
            setServerSummary({
              subtotal: Number(res?.subtotal) || 0,
              tax: Number(res?.tax) || 0,
              total: Number(res?.total) || 0,
            })
          } else {
            const local = getLocalCart()
            setItems(Array.isArray(local) ? local : [])
          }
        } catch (_ignore) {}
        return
      }
      notifier?.notify?.({ type: 'error', text: e?.message || 'Failed to update quantity' })
    }
  }

  const value = useMemo(() => ({
    cartItems: items,
    totals: serverSummary,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearLocal: () => { clearLocalCart(); setItems([]) }
  }), [items, serverSummary])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
