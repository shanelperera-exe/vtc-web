import React from "react";

const AuthButton = ({
  label = "Sign In / Sign Up",
  type = "button",
  disabled = false,
  onClick,
  className = "",
  containerClassName = "",
  bgClass = "bg-[#0bd964] text-black",
}) => {
  return (
    <div className={`group relative h-fit w-full mb-2 ${containerClassName}`}>
      <div
        className="absolute inset-0 z-0 translate-x-0.5 translate-y-0.5 bg-neutral-950 pointer-events-none"
        style={{
          clipPath:
            "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0px 100%, 0px 0px)",
        }}
      ></div>
      <div
        className="relative z-10 w-full p-[2px] bg-neutral-950 transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-active:translate-x-0 group-active:translate-y-0"
        style={{
          clipPath:
            "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0px 100%, 0px 0px)",
        }}
      >
        <button
          type={type}
          disabled={disabled}
          onClick={onClick}
          className={`block w-full cursor-pointer overflow-hidden font-[600] text-base py-2 px-4 ${bgClass} disabled:cursor-not-allowed shimmer_shine__jD_i0 ${className}`}
          style={{
            width: "100%",
            clipPath:
              "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0px 100%, 0px 0px)",
          }}
        >
          {label}
        </button>
      </div>
    </div>
  );
};

export default AuthButton;
