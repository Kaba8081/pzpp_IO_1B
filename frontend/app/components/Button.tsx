import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const baseStyles =
    "px-8 py-3 font-cinzel font-bold tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed rounded-[16px] border-2";

  const variants = {
    primary:
      "bg-primary border-primary text-white hover:brightness-125 hover:shadow-[0_0_20px_rgba(6,140,124,0.4)]",
    outline: "bg-transparent border-primary text-primary hover:bg-primary/10",
  };

  return (
    <button {...props} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
