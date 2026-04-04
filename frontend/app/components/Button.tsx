import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "clear" | "tab";
  isActive?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  isActive = false,
  ...props
}) => {
  const baseStyles =
    "font-cinzel font-bold transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "px-8 py-3 tracking-[0.2em] rounded-[16px] border-2 bg-primary border-primary text-white hover:brightness-125 hover:shadow-[0_0_20px_rgba(6,140,124,0.4)]",
    outline:
      "px-8 py-3 tracking-[0.2em] rounded-[16px] border-2 bg-transparent border-primary text-primary hover:bg-primary/10",
    ghost: "px-5 py-3.5 tracking-[0.15em] rounded-xl text-sm border-2 border-transparent",
    clear:
      "tracking-[0.15em] text-sm bg-transparent border-none p-0 hover:text-primary transition-colors text-white",
    tab: `pb-2 tracking-[0.15em] relative ${
      isActive
        ? "text-white border-b-2 border-primary"
        : "text-input-placeholder hover:text-white border-b-2 border-transparent"
    }`,
  };

  return (
    <button {...props} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
