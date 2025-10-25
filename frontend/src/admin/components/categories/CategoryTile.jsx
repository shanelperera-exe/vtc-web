import React, { useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import { niceDate } from "./categoryUtils";

/**
 * CategoryTile now derives its images from API-provided fields on the category.
 * New canonical field names (backend entity):
 *  - cat.catMainImg        (primary / default)
 *  - cat.carouselImg       (secondary / hover preference)
 *  - cat.catTileImage1     (legacy fallback 1)
 *  - cat.catTileImage2     (legacy fallback 2)
 * Backward compatibility (old API/cached objects) still supports:
 *  - categoryImage (-> catMainImg)
 *  - carouselImage (-> carouselImg)
 *  - categoryIcon  (-> catTileImage1)
 */
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

    const placeholderGradient = "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #9ca3af 100%)";

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/admin/products/${cat.slug || cat.name?.toLowerCase?.()}`)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/admin/products/${cat.slug || cat.name?.toLowerCase?.()}`); }}
            className="group cursor-pointer relative flex aspect-square flex-col justify-end overflow-hidden p-6 transition-colors hover:bg-neutral-200 md:p-9 border-2 border-gray-400"
        >
            {/* top-left meta */}
            <div className="absolute left-3 top-5 z-10 flex items-center gap-2 text-xs uppercase text-neutral-400 transition-colors duration-500 group-hover:text-neutral-900">
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    {(typeof cat.productCount === 'number' ? cat.productCount : 0)} items
                </span>
                <span className="opacity-40">•</span>
                <span title={cat.updatedAt ? niceDate(cat.updatedAt) : ""}>
                   {cat.updatedAt ? niceDate(cat.updatedAt) : "—"}
                </span>
            </div>

            {/* title */}
            <h2 className="relative z-10 text-3xl leading-tight transition-transform duration-500 group-hover:-translate-y-2">
                {cat.name}
            </h2>

            {/* status row */}
            <div className="relative z-10 mt-2 flex items-center gap-2 text-sm text-neutral-300">
                <StatusBadge status={cat.status} />
            </div>

            {/* actions */}
            <div className="absolute right-3 top-4 z-10 flex items-center gap-2 text-xl text-neutral-400 transition-colors duration-300 group-hover:text-neutral-900">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(cat); }}
                    className="hover:text-emerald-300 focus:outline-none"
                    aria-label={`Edit ${cat.name}`}
                    title="Edit"
                >
                    <FiEdit2 />
                </button>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(cat); }}
                    className="hover:text-red-400 focus:outline-none"
                    aria-label={`Delete ${cat.name}`}
                    title="Delete"
                >
                    <FiTrash />
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
