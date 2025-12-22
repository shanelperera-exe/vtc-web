import React from "react";

const AuthButton = ({
  label = "Sign In / Sign Up",
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  containerClassName = "",
  bgClass = "bg-emerald-500 text-white",
}) => {
  return (
    <div className={`w-full mb-2 ${containerClassName}`}>
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`w-full text-center font-semibold text-base py-2 px-4 rounded-xl transition-colors duration-150 ease-in-out ${bgClass} hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none ${className}`}
      >
        {children ? children : label}
      </button>
    </div>
  );
};

export default AuthButton;
