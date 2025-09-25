import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiCheckSquare, FiX, FiInfo, FiAlertTriangle, FiShoppingCart } from 'react-icons/fi'
import { NotificationContext } from './notificationsContext.js'


const DEFAULT_TTL = 5000

const typeDefaults = {
    success: { bg: 'bg-green-600', Icon: FiCheckSquare },
    error: { bg: 'bg-rose-600', Icon: FiAlertTriangle },
    info: { bg: 'bg-indigo-500', Icon: FiInfo },
    cart: { bg: 'bg-emerald-600', Icon: FiShoppingCart },
}

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([])

    const remove = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])

    const notify = useCallback(({ text, type = 'info', icon: CustomIcon, ttl = DEFAULT_TTL, id }) => {
        const _id = id ?? Math.random()
        setNotifications((prev) => [
            { id: _id, text, type, icon: CustomIcon, ttl },
            ...prev,
        ])
        return _id
    }, [])

    const value = useMemo(() => ({ notify, remove }), [notify, remove])

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className="flex flex-col gap-1 w-72 fixed top-2 right-2 z-50 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <NotificationItem key={n.id} {...n} remove={remove} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    )
}

const NotificationItem = ({ id, text, type = 'info', icon: CustomIcon, ttl = DEFAULT_TTL, remove }) => {
    useEffect(() => {
        const t = setTimeout(() => remove(id), ttl)
        return () => clearTimeout(t)
    }, [id, ttl, remove])

    const { bg, Icon } = typeDefaults[type] ?? typeDefaults.info
    const LeadingIcon = CustomIcon ?? Icon

    return (
        <motion.div
            layout
            initial={{ y: -15, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`p-2 flex items-start gap-2 text-xs font-medium shadow-lg text-white ${bg} pointer-events-auto`}
        >
            <LeadingIcon className="mt-0.5" />
            <span className="pr-1">{text}</span>
            <button aria-label="Dismiss" onClick={() => remove(id)} className="ml-auto mt-0.5 opacity-90 hover:opacity-100 active:scale-95">
                <FiX />
            </button>
        </motion.div>
    )
}

export default NotificationProvider
