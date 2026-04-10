import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "clear";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const baseStyles =
    "font-bold transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "px-8 py-3 rounded-[16px] border-2 bg-primary border-primary text-white hover:brightness-125 hover:shadow-[0_0_20px_rgba(6,140,124,0.4)]",
    outline:
      "px-8 py-3 rounded-[16px] border-2 bg-transparent border-primary text-primary hover:bg-primary/10",
    ghost: "px-5 py-3.5",
    clear: "text-sm bg-transparent border-none p-0 hover:text-primary transition-colors text-white",
  };

  return (
    <button {...props} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
