import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import type { ToastType } from "@/lib/toastBridge";

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(" ");

const typeConfig: Record<
  ToastType,
  { icon: React.ElementType; border: string; iconClass: string }
> = {
  success: { icon: CheckCircle, border: "border-success", iconClass: "text-success" },
  error: { icon: XCircle, border: "border-error", iconClass: "text-error" },
  warn: { icon: AlertTriangle, border: "border-warn", iconClass: "text-warn" },
  info: { icon: Info, border: "border-info", iconClass: "text-info" },
};

export const Toast = () => {
  const { currentToast, toast } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (currentToast) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [currentToast]);

  if (!mounted || !currentToast) return null;

  const { icon: Icon, border, iconClass } = typeConfig[currentToast.type];

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-60 flex w-full max-w-sm items-start gap-3 rounded-xl border-2 bg-background p-4 shadow-2xl transition-all duration-200",
        border,
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />
      <p className="flex-1 text-sm leading-snug">{currentToast.message}</p>
      <button
        type="button"
        onClick={toast.close}
        aria-label="Close notification"
        className="shrink-0 text-white/50 transition-colors hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
