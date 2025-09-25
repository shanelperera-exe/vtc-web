import React from "react";

const EditBtn = ({ onClick, label = "Edit" }) => {
  return (
    <div className="group relative inline-block h-fit mb-2">
      <div className="absolute inset-0 z-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 pointer-events-none" />
      <div className="relative z-10 p-[2px] bg-neutral-950 transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-active:translate-x-0 group-active:translate-y-0">
        <button
          type="button"
          onClick={onClick}
          className="shimmer_shine__jD_i0 relative block items-center cursor-pointer overflow-hidden font-[600] text-base text-black bg-white disabled:cursor-not-allowed w-[32px] h-[32px] transition-[width,border-radius,background,color] duration-300 ease-in-out group-hover:w-[90px] group-hover:bg-[#09a84e] group-hover:text-white"
        >
          <span className="flex items-center justify-center h-full w-full gap-2">
            <svg className="h-[18px] w-[18px] ml-1 transition-transform duration-300 group-hover:rotate-[360deg] flex-shrink-0" viewBox="0 0 512 512" aria-hidden="true">
              <path fill="currentColor" className="group-hover:fill-white" d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
            </svg>
            <span className="text-sm whitespace-nowrap transition-all duration-300 flex items-center justify-center opacity-0 scale-0 w-0 group-hover:opacity-100 group-hover:scale-100 group-hover:w-auto">
              {label}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default EditBtn;
