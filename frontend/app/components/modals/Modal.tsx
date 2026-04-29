import React, { type ReactNode, useEffect, useState } from "react";
import { useUserStore } from "@/stores/UserStore";

interface ModalProps {
  name: string | string[];
  children: ReactNode;
  size?: "md" | "lg";
  padding?: "default" | "none";
  className?: string;
  panelClassName?: string;
  contentClassName?: string;
}

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(" ");

const modalSizeClasses = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

const modalPaddingClasses = {
  default: "p-6",
  none: "p-0",
};

export const Modal = ({
  name,
  children,
  size = "md",
  padding = "default",
  className,
  panelClassName,
  contentClassName,
}: ModalProps) => {
  const { currentModal, modal } = useUserStore();
  const isActive = Array.isArray(name) ? name.includes(currentModal ?? "") : currentModal === name;

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      onClick={modal.close}
    >
      <div
        className={cn(
          "relative w-full transform overflow-hidden rounded-2xl border-2 border-primary bg-background shadow-2xl transition-all duration-200",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
          modalSizeClasses[size],
          modalPaddingClasses[padding],
          panelClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
};
