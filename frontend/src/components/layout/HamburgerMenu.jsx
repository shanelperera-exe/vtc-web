import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FiMenu, FiX, FiUser, FiPackage, FiLogOut } from 'react-icons/fi';
import logo2 from '../../assets/vtc_logo2.svg';
import Searchbar from './SearchBar';
import { useCategories } from '../../api/hooks/useCategories';

// derive categories from backend data; fallback to empty list (retain shape {label, slug})
function useCategoryButtons() {
    const { data } = useCategories({ size: 200 });
    return (data || [])
        .filter(c => String(c.status || '').toLowerCase() === 'active')
        .map(c => {
    const name = c.name || c.label || '';
    const slug = name.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return { label: name, slug };
    });
}

// Primary menu links (mobile panel)
const menuLinks = [
    { label: 'about.', href: '/about' },
    { label: 'help.', href: '/help' },
    { label: 'contact.', href: '/contact' },
    { label: 'FAQs.', href: '/faq' }
];


export default function CornerNav({
    className = "",
    isLoggedIn = false,
    userName = 'User',
    email = '',
    onLogin = () => {},
    onSignup = () => {},
    onVisitProfile = () => {},
    onViewOrders = () => {},
    onSignOut = () => {}
}) {
    const [open, setOpen] = useState(false);
    // Panel shadow control (closed button shadow always visible)
    const [panelShadow, setPanelShadow] = useState(true);
    // Logged-in footer drop-up state
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const categories = useCategoryButtons();

    // Close on ESC
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const toggle = () => {
        // If we are about to open (currently closed), suppress shadow to avoid expansion artifact.
        if (!open) {
            setPanelShadow(false);
        } else {
            // Keep shadow while collapsing so final button immediately has it.
            setPanelShadow(true);
        }
        setOpen(o => !o);
    };

    return (
        <div className={`relative ${className}`} style={{ width: 40, height: 40 }}>
            <LayoutGroup>
                <AnimatePresence>
                    {!open && (
                        <motion.button
                            key="menu-button"
                            layoutId="hamburger-panel"
                            initial={false}
                            className="w-10 h-10 bg-white border-3 border-black flex items-center justify-center focus:outline-none z-[9999] hover:bg-[#0bd964] hover:text-white"
                            aria-label="Open menu"
                            aria-expanded={false}
                            onClick={toggle}
                            style={{ cursor: 'pointer' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        >
                            <FiMenu className="w-7 h-7 text-current" />
                        </motion.button>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            key="menu-open"
                            layoutId="hamburger-panel"
                            initial={false}
                            className="fixed z-[9999] overflow-hidden flex flex-col"
                            style={{
                                top: 8,
                                left: 16,
                                right: 16,
                                height: 'calc(100vh - 32px)',
                                background: 'white',
                                border: '2px solid #0a0a0a',
                                boxShadow: panelShadow ? '2px 2px 0px #000' : 'none'
                            }}
                            transition={{ type: 'spring', stiffness: 140, damping: 22 }}
                            onAnimationComplete={() => { if (open) setPanelShadow(true); }}
                            aria-label="Menu panel"
                        >
                            {/* Logo top-left */}
                            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none select-none">
                                <img src={logo2} alt="Logo" className="h-8 w-auto" />
                            </div>
                            <button
                                onClick={toggle}
                                aria-label="Close menu"
                                className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center focus:outline-none"
                                style={{ cursor: 'pointer' }}
                            >
                                <FiX className="w-8 h-8 text-black" />
                            </button>
                            <div className="flex-1 flex flex-col px-7 pb-8 pt-18 overflow-y-auto">
                                {/* Search bar */}
                                <div className="w-full mb-8">
                                    <Searchbar />
                                </div>
                                {/* Browse Categories */}
                                <div className="mb-8">
                                    <h3 className="text-md font-semibold tracking-wider text-gray-500 uppercase mb-3">Browse Categories</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {categories.map((cat, i) => (
                                            <motion.button
                                                key={cat.slug}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0, transition: { delay: 0.10 + i * 0.05 } }}
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.94 }}
                                                className="px-4 py-2 text-sm font-medium border-2 border-black shadow-[2px_2px_0_#000] bg-white hover:bg-black hover:text-white transition-colors"
                                                onClick={() => {
                                                    navigate(`/category/${cat.slug}`);
                                                    setOpen(false);
                                                }}
                                                aria-label={`Browse ${cat.label} category`}
                                            >
                                                {cat.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                                <nav className="space-y-5">
                                    {menuLinks.map((link, i) => (
                                        <motion.a
                                            key={link.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0, transition: { delay: 0.25 + i * 0.06 } }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="block text-3xl font-semibold text-black transition-colors hover:text-[#0bd964] md:text-5xl"
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            aria-label={link.label}
                                        >
                                            {link.label}
                                        </motion.a>
                                    ))}
                                </nav>
                                {/* (Optional additional content placeholder) */}
                            </div>
                            {/* Fixed bottom area: auth or profile */}
                            <div className="relative">
                                {!isLoggedIn ? (
                                    <div className="px-7 py-4 border-t-2 border-black bg-white flex items-center justify-between gap-4">
                                        <span className="text-sm font-medium text-gray-600">Welcome. Join us.</span>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { onLogin(); setOpen(false); }}
                                                className="px-4 h-10 inline-flex items-center justify-center text-sm font-semibold bg-white border-2 border-black shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-transform"
                                            >
                                                Log in
                                            </button>
                                            <button
                                                onClick={() => { onSignup(); setOpen(false); }}
                                                className="px-4 h-10 inline-flex items-center justify-center text-sm font-semibold text-white bg-black border-2 border-black shadow-[2px_2px_0_#000] hover:bg-[#0bd964] hover:text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-7 py-4 border-t-2 border-black bg-white flex items-center gap-4">
                                        <button
                                            onClick={() => setProfileOpen(o => !o)}
                                            aria-label="Account options"
                                            className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-transform"
                                        >
                                            <FiUser className="w-6 h-6 text-black" />
                                        </button>
                                        <div className="flex flex-col leading-tight select-none">
                                            <span className="text-sm font-semibold text-black">{userName}</span>
                                            <span className="text-xs text-gray-500">Welcome to Vidara Trade Center.</span>
                                        </div>
                                        {/* Drop-up panel */}
                                        <AnimatePresence>
                                            {profileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 12 }}
                                                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                                                    className="absolute bottom-[72px] left-4 w-56 max-w-[75%] border-2 border-black bg-white shadow-[2px_2px_0_#000] p-4 flex flex-col gap-3 z-[10000]"
                                                    style={{ pointerEvents: 'auto' }}
                                                >
                                                    <button
                                                        onClick={() => { onVisitProfile(); navigate('/account/accountdetails'); setOpen(false); }}
                                                        className="flex items-center gap-2 text-sm font-medium text-black hover:text-[#0bd964]"
                                                    >
                                                        <FiUser className="text-lg" />
                                                        <span>Account</span>
                                                    </button>
                                                    <button
                                                        onClick={() => { onViewOrders(); navigate('/account/orders'); setOpen(false); }}
                                                        className="flex items-center gap-2 text-sm font-medium text-black hover:text-[#0bd964]"
                                                    >
                                                        <FiPackage className="text-lg" />
                                                        <span>My Orders</span>
                                                    </button>
                                                    <button
                                                        onClick={() => { onSignOut(); setOpen(false); }}
                                                        className="flex items-center gap-2 text-sm font-medium text-black hover:text-red-600"
                                                    >
                                                        <FiLogOut className="text-lg" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </LayoutGroup>
        </div>
    );
}
