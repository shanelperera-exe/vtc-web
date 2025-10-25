import React from "react";

/**
 * CatDropTile – A lightweight category tile for the mega menu.
 * Styled similarly to the admin CategoryTile but simplified:
 *  - No admin actions or meta badges
 *  - Uses background-image layers with a hover swap
 *  - Square aspect by default for compact grid usage
 */
export default function CatDropTile({
  label,
  href = "#",
  primaryUrl,
  hoverUrl,
  className = "",
}) {
  const placeholderGradient =
    "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #9ca3af 100%)";

  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className={
        "group relative block overflow-hidden border-3 border-black transition-colors hover:bg-neutral-200 aspect-square hover:border-black" +
        className
      }
      style={{ textDecoration: "none" }}
    >
      {/* Background images: default and optional hover */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          backgroundImage: primaryUrl ? `url(${primaryUrl})` : placeholderGradient,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      />
      {hoverUrl && (
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            backgroundImage: `url(${hoverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Title overlay inside the square. Default: bottom; on hover: move to top. No white gradient. */}
      <div className="absolute inset-0 z-10 p-1.5 flex flex-col justify-end group-hover:justify-start transition-all duration-300">
        <h3 className="text-base lg:text-2xl font-semibold leading-tight text-black truncate px-1">{label}</h3>
      </div>
    </a>
  );
}
