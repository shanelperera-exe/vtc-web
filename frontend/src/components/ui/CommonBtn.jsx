import React from "react";

const CommonBtn = ({
    label = "Button",
    type = "button",
    disabled = false,
    onClick,
    className = "",
    containerClassName = "",
    bgClass = "bg-[#0bd964] text-black",
    fullWidth = true,
    children,
    noShadow = false,
}) => {
    const widthClass = fullWidth ? "w-full" : "w-auto";
    if (noShadow) {
        return (
            <button
                type={type}
                disabled={disabled}
                onClick={onClick}
                className={`inline-flex ${widthClass} justify-center items-center cursor-pointer font-[600] text-base py-2 px-4 ${bgClass} disabled:cursor-not-allowed ${className}`}
            >
                {children ?? label}
            </button>
        );
    }
    return (
        <div className={`group relative h-fit ${widthClass} mb-2 ${containerClassName}`}>
            <div className="absolute inset-0 z-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 pointer-events-none" />
            <div className={`relative z-10 ${widthClass} p-[2px] bg-neutral-950 transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-active:translate-x-0 group-active:translate-y-0`}>
                <button
                    type={type}
                    disabled={disabled}
                    onClick={onClick}
                    className={`block ${widthClass} cursor-pointer overflow-hidden font-[600] text-base py-2 px-4 ${bgClass} disabled:cursor-not-allowed shimmer_shine__jD_i0 ${className}`}
                >
                    {children ?? label}
                </button>
            </div>
        </div>
    );
};

export default CommonBtn;

