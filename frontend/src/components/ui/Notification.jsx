import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiCheckCircle, FiX, FiInfo, FiAlertTriangle, FiShoppingCart } from 'react-icons/fi'
import { NotificationContext } from './notificationsContext.js'


const DEFAULT_TTL = 5000

const typeDefaults = {
    success: { accent: 'bg-emerald-500', Icon: FiCheckCircle },
    error: { accent: 'bg-rose-500', Icon: FiAlertTriangle },
    info: { accent: 'bg-indigo-500', Icon: FiInfo },
    cart: { accent: 'bg-emerald-500', Icon: FiShoppingCart },
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
            <div className="flex flex-col gap-2 fixed top-3 right-3 z-50 pointer-events-none max-w-sm w-full">
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

    const { accent, Icon } = typeDefaults[type] ?? typeDefaults.info
    const LeadingIcon = CustomIcon ?? Icon

    return (
        <motion.div
            layout
            initial={{ y: -12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`pointer-events-auto w-full max-w-sm rounded-lg border border-neutral-100 bg-white shadow-md`}
        >
            <div className="p-3 flex items-start gap-3">
                <div className={`${accent} flex-shrink-0 h-9 w-9 rounded-lg grid place-content-center text-white`}> 
                    <LeadingIcon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                    <p className="text-sm text-neutral-900 leading-snug break-words whitespace-normal">{text}</p>
                </div>

                <button aria-label="Dismiss" onClick={() => remove(id)} className="ml-2 mt-0.5 text-neutral-400 hover:text-neutral-600 active:scale-95">
                    <FiX className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    )
}

export default NotificationProvider
