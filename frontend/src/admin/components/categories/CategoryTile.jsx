import React, { useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiClock, FiGrid } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import { niceDate } from "./categoryUtils";


export default function CategoryTile({ cat, onEdit, onDelete }) {
    const navigate = useNavigate();

    const { primaryUrl, hoverUrl } = useMemo(() => {
        // New requirement: show category tile 1 as the main image and
        // category tile 2 on hover. Keep other fields as sensible fallbacks
        // for backward compatibility.
        const primary =
            cat?.catTileImage1 || // prefer tile 1
            cat?.catMainImg ||
            cat?.categoryImage || // legacy
            cat?.categoryIcon || // legacy
            cat?.catTileImage2 ||
            null;

        const hoverCandidate =
            cat?.catTileImage2 || // prefer tile 2 on hover
            cat?.carouselImg ||
            cat?.carouselImage || // legacy
            cat?.catMainImg ||
            cat?.catTileImage1 ||
            cat?.categoryIcon || // legacy
            null;

        return {
            primaryUrl: primary,
            hoverUrl: hoverCandidate && hoverCandidate !== primary ? hoverCandidate : null
        };
    }, [cat]);

    const placeholderGradient = "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)";

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/admin/products/${cat.slug || cat.name?.toLowerCase?.()}`)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/admin/products/${cat.slug || cat.name?.toLowerCase?.()}`); }}
            className="group cursor-pointer relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-black/10 bg-white p-6 md:p-8 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
            {/* top-left meta */}
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-xs font-semibold text-white/90">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2 py-1 backdrop-blur-sm">
                    <FiGrid className="w-3.5 h-3.5" />
                    {(typeof cat.productCount === 'number' ? cat.productCount : 0)} items
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2 py-1 backdrop-blur-sm" title={cat.updatedAt ? niceDate(cat.updatedAt) : ""}>
                    <FiClock className="w-3.5 h-3.5" />
                    {cat.updatedAt ? niceDate(cat.updatedAt) : "—"}
                </span>
            </div>

            {/* title */}
            <h2 className="relative z-10 text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                {cat.name}
            </h2>

            {/* status row */}
            <div className="relative z-10 mt-2 flex items-center gap-2 text-sm text-white/90">
                <StatusBadge status={cat.status} />
            </div>

            {/* actions */}
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(cat); }}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/20 bg-white/90 text-gray-800 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    aria-label={`Edit ${cat.name}`}
                    title="Edit"
                >
                    <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(cat); }}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-white/20 bg-white/90 text-gray-800 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    aria-label={`Delete ${cat.name}`}
                    title="Delete"
                >
                    <FiTrash2 className="w-4 h-4" />
                </button>
            </div>

            {/* background images: default and optional hover */}
            <div
                className="absolute inset-0 transition-all duration-500"
                style={{
                    backgroundImage: primaryUrl ? `url(${primaryUrl})` : placeholderGradient,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 1
                }}
            />
            {/* readability overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {hoverUrl && (
                <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                        backgroundImage: `url(${hoverUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}
                />
            )}
        </div>
    );
}
