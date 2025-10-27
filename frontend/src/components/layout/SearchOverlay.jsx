import { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react"; // icons (lucide-react)
import { AnimatePresence, motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { searchProducts, listProducts } from "../../api/productApi";

// Controlled or uncontrolled SearchOverlay
export default function SearchOverlay({ open: propOpen, onClose }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isClosing, setIsClosing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const fetchSeq = useRef(0);

    // Popular products state (when no query typed yet)
    const [popular, setPopular] = useState([]);
    const [popularLoading, setPopularLoading] = useState(false);
    const [popularError, setPopularError] = useState(null);
    const popularLoadedRef = useRef(false); // avoid refetching repeatedly per session

    const quickSearch = ["Clay pots", "Living room", "Classic table"];

    // Fallback demo items if no query yet
    const demoProducts = [
        { name: "Wall clock gray pink", price: 2299, img: "//hongotheme.myshopify.com/cdn/shop/products/decor-product-04.jpg?v=1663909840&width=165", href: "/products/wall-clock-gray-pink" },
        { name: "Sockeraert vase black", price: 1500, img: "//hongotheme.myshopify.com/cdn/shop/products/decor-product-14.jpg?v=1663915638&width=165", href: "/products/sockeraert-vase-black" },
        { name: "Decorative mirror", price: 1099, img: "//hongotheme.myshopify.com/cdn/shop/products/decor-product-12.jpg?v=1663914693&width=165", href: "/products/decorative-mirror" },
        { name: "Speaker with lamp", price: 1799, img: "//hongotheme.myshopify.com/cdn/shop/products/decor-product-10_8c065b6a-17b4-4c74-960a-4bec6f8d700c.jpg?v=1663913890&width=165", href: "/products/speaker-with-lamp" },
    ];

    // Determine whether overlay is open (controlled by propOpen if provided)
    const isControlled = typeof propOpen === "boolean";
    const isOpen = isControlled ? propOpen : open;

    // Close helper: animate closing, then call onClose or set local state
    const close = () => {
        setIsClosing(true);
    };

    // After exit animation finishes, actually call external onClose or clear local state
    const handleExited = () => {
        setIsClosing(false);
        if (onClose) onClose();
        else setOpen(false);
    };

    // Handle Escape and body scroll when open
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && close();
        const prev = document.body.style.overflow;
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    // Debounced live search (supports SKU or Name)
    useEffect(() => {
        if (!isOpen) return; // only search while overlay shown
        const q = (query || "").trim();
        if (q.length < 2) {
            setResults([]);
            setTotal(0);
            setLoading(false);
            setError(null);
            return;
        }
        setLoading(true);
        setError(null);
        const mySeq = ++fetchSeq.current;
        const timer = setTimeout(async () => {
            try {
                // 1) Try exact SKU match first
                let page = await searchProducts({ sku: q, page: 0, size: 8, status: 'ACTIVE' });
                let content = Array.isArray(page?.content) ? page.content : [];
                let totalElements = Number(page?.totalElements || content.length || 0);

                // 2) If no SKU match, fallback to name search
                if (!totalElements) {
                    page = await searchProducts({ name: q, page: 0, size: 8, status: 'ACTIVE' });
                    content = Array.isArray(page?.content) ? page.content : [];
                    totalElements = Number(page?.totalElements || content.length || 0);
                }

                if (fetchSeq.current !== mySeq) return; // out-of-order guard
                setResults(content);
                setTotal(totalElements);
            } catch (e) {
                if (fetchSeq.current !== mySeq) return;
                setError(e?.message || 'Failed to search');
                setResults([]);
                setTotal(0);
            } finally {
                if (fetchSeq.current === mySeq) setLoading(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [isOpen, query]);

    // Fetch popular products when overlay opens and no query is entered
    useEffect(() => {
        if (!isOpen) return;
        const q = (query || "").trim();
        if (q.length >= 2) return; // handled by search above
        if (popularLoadedRef.current && popular.length > 0) return; // use cached
        let active = true;
        (async () => {
            try {
                setPopularLoading(true);
                setPopularError(null);
                // Heuristic for "popular": show newest arrivals first
                const page = await listProducts({ page: 0, size: 8, sort: 'createdAt,desc', status: 'ACTIVE' });
                if (!active) return;
                const content = Array.isArray(page?.content) ? page.content : [];
                setPopular(content);
                popularLoadedRef.current = content.length > 0;
            } catch (e) {
                if (!active) return;
                setPopularError(e?.message || 'Failed to load popular products');
                setPopular([]);
            } finally {
                if (active) setPopularLoading(false);
            }
        })();
        return () => { active = false; };
    }, [isOpen, query, popular.length]);

    return (
        <div>
            {/* Only show trigger when uncontrolled */}
            {!isControlled && (
                <button
                    onClick={() => setOpen(true)}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                    <Search className="w-5 h-5" />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="search-overlay"
                        className="fixed inset-0 z-50 bg-white overflow-hidden"
                        initial={{ y: '-100vh' }}
                        animate={isClosing ? { y: '-100vh' } : { y: 0 }}
                        exit={{ y: '-100vh' }}
                        transition={{ type: "tween", duration: 0.45, ease: "easeOut" }}
                        onAnimationComplete={() => {
                            if (isClosing) handleExited();
                        }}
                    >
                        {/* Decorative overlay text in bottom-right */}
                        <div className="pointer-events-none fixed right-3 bottom-3 md:right-6 md:bottom-4 z-40">
                            {/* use clamp to scale from ~6rem up to ~14rem depending on viewport */}
                            <div className="flex items-center gap-3">
                                <Search className="text-black opacity-6" style={{ width: 'clamp(4rem, 10vw, 8rem)', height: 'auto' }} />
                                <div className="font-bold text-black opacity-6 leading-none" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', lineHeight: 0.85 }}>search</div>
                            </div>
                        </div>
                        {/* Close */}
                        <button
                            onClick={close}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center">
                            {/* Heading */}
                            <h4 className="text-2xl font-semibold mb-6">
                                What are you looking for?
                            </h4>

                            {/* Search Form */}
                            <form
                                action="/search"
                                method="get"
                                className="w-full flex items-center justify-center"
                            >
                                <div className="mx-auto">
                                    <SearchBar name="q" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                                </div>

                            </form>

                            {/* Quick Search */}
                            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-medium">Quick Search:</span>
                                {quickSearch.map((item, i) => (
                                    <a
                                        key={i}
                                        href={`/search?q=${encodeURIComponent(item)}`}
                                        onClick={(e) => { e.preventDefault(); setQuery(item); }}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {item}
                                        {i < quickSearch.length - 1 && ","}
                                    </a>
                                ))}
                            </div>

                            {/* Results or fallback */}
                            <div className="mt-10 w-full">
                                {query.trim().length >= 2 ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h6 className="font-semibold">Top results</h6>
                                            <div className="text-sm text-gray-500">
                                                {loading ? 'Searching…' : error ? 'Search failed' : `${total} result${total === 1 ? '' : 's'}`}
                                            </div>
                                        </div>
                                        {error && (
                                            <div className="text-sm text-red-600 mb-3">{error}</div>
                                        )}
                                        {loading && !results.length && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <div key={i} className="animate-pulse">
                                                        <div className="bg-gray-200 h-28 w-full" />
                                                        <div className="h-4 bg-gray-200 mt-2 w-3/4" />
                                                        <div className="h-3 bg-gray-200 mt-2 w-1/2" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {!loading && !error && results.length === 0 && (
                                            <div className="text-sm text-gray-600">No results for “{query}”. Try another term.</div>
                                        )}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {results.map((p) => {
                                                const href = `/product/${encodeURIComponent(p.sku || p.id)}`;
                                                const img = p.primaryImageUrl || (p.imageUrls && p.imageUrls[0]) || p.image || p.primaryImage;
                                                const price = p.basePrice ?? p.price ?? 0;
                                                return (
                                                    <a
                                                        key={p.id || p.sku}
                                                        href={href}
                                                        className="block group text-left border-2 border-black hover:border-neutral-900 transition p-2"
                                                    >
                                                        {img ? (
                                                            // show full 1:1 image without cropping
                                                            <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-black box-border">
                                                                <img src={img} alt={p.name} className="max-w-full max-h-full object-contain" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-500 border-2 border-black box-border">No Image</div>
                                                        )}
                                                        <div className="mt-2 text-sm font-semibold leading-snug line-clamp-2" title={p.name}>{p.name}</div>
                                                        <span className="mt-1 block text-sm text-gray-700">{"LKR " + (Number(price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                        {total > results.length && (
                                            <div className="mt-4 text-right">
                                                <a href={`/search?q=${encodeURIComponent(query)}`} className="text-sm text-blue-600 hover:underline">
                                                    View all results
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <h6 className="font-semibold mb-4">Popular Products</h6>
                                        {popularError && (
                                            <div className="text-sm text-red-600 mb-3">{popularError}</div>
                                        )}
                                        {popularLoading && (!popular || popular.length === 0) && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <div key={i} className="animate-pulse">
                                                        <div className="bg-gray-200 h-28 w-full" />
                                                        <div className="h-4 bg-gray-200 mt-2 w-3/4" />
                                                        <div className="h-3 bg-gray-200 mt-2 w-1/2" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {!popularLoading && (!popular || popular.length === 0) && !popularError && (
                                            <div className="text-sm text-gray-600">No popular products to show yet.</div>
                                        )}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {(popular || []).map((p) => {
                                                const href = `/product/${encodeURIComponent(p.sku || p.id)}`;
                                                const img = p.primaryImageUrl || (p.imageUrls && p.imageUrls[0]) || p.image || p.primaryImage;
                                                const price = p.basePrice ?? p.price ?? 0;
                                                return (
                                                    <a
                                                        key={p.id || p.sku}
                                                        href={href}
                                                        className="block group text-left border-2 border-black hover:border-neutral-900 transition p-2"
                                                    >
                                                        {img ? (
                                                            // show full 1:1 image without cropping
                                                            <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-black box-border">
                                                                <img src={img} alt={p.name} className="max-w-full max-h-full object-contain" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-500 border-2 border-black box-border">No Image</div>
                                                        )}
                                                        <div className="mt-2 text-sm font-semibold leading-snug line-clamp-2" title={p.name}>{p.name}</div>
                                                        <span className="mt-1 block text-sm text-gray-700">{"LKR " + (Number(price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
