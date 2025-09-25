import React from "react";

const DeleteBtn = ({ onClick }) => {
  return (
    <div className="group relative h-fit w-auto mb-2">
      {/* Shadow layer */}
      <div className="absolute inset-0 z-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 pointer-events-none shadow-[0_0_20px_rgba(0,0,0,0.16)]" />
      {/* Button layer */}
      <div className="relative z-10 w-auto p-[2px] bg-neutral-950 transition-all group-hover:-translate-x-1 group-hover:-translate-y-1">
        <button
          type="button"
          onClick={onClick}
          className="button flex items-center justify-center w-8 h-8 font-semibold transition-all duration-300 overflow-hidden border-none bg-red-500 text-white group-hover:w-24 group-hover:bg-red-500"
        >
          {/* Animated label */}
          <span
            className="absolute left-1/2 -top-4 -translate-x-1/2 text-white font-semibold text-xs opacity-0 group-hover:opacity-100 group-hover:text-base group-hover:top-0.5 transition-all duration-300 pointer-events-none"
          >
            Delete
          </span>
          {/* Animated SVG */}
          <svg
            viewBox="0 0 448 512"
            className="svgIcon w-3 transition-all duration-300 group-hover:w-7 group-hover:translate-y-5"
            style={{ zIndex: 1 }}
          >
            <path
              fill="white"
              d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DeleteBtn;