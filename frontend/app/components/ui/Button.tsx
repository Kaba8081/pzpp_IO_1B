import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "ghost" | "clear";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const baseStyles =
    "transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";

  const variants = {
    primary: "px-8 py-3 rounded-xl border-2 bg-primary border-primary hover:brightness-125",
    outline:
      "px-8 py-3 rounded-xl border-2 bg-transparent border-primary text-primary hover:bg-primary/10",
    danger: "px-8 py-3 rounded-xl border-2 bg-error border-error hover:brightness-110",
    ghost: "px-5 py-3.5",
    clear: "bg-transparent border-none p-0 hover:text-primary transition-colors text-white",
  };

  return (
    <button {...props} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
