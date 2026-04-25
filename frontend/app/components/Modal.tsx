import { type ReactNode } from "react";
import { useUserStore } from "@/stores/UserStore";

interface ModalProps {
  name: string;
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

  if (currentModal !== name) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
        className
      )}
      onClick={modal.close}
    >
      <div
        className={cn(
          "relative w-full transform overflow-hidden rounded-2xl border-2 border-primary bg-background shadow-2xl transition-all",
          modalSizeClasses[size],
          modalPaddingClasses[padding],
          panelClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("mt-2", contentClassName)}>{children}</div>
      </div>
    </div>
  );
};
