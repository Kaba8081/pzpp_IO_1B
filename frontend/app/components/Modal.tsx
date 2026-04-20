import React, { type ReactNode } from "react";
import { useUserStore } from "@/stores/UserStore";

interface ModalProps {
  name: string;
  children: ReactNode;
}

export const Modal = ({ name, children }: ModalProps) => {
  const { currentModal, modal } = useUserStore();

  if (currentModal !== name) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={modal.close}
    >
      <div
        className="relative w-full max-w-2xl border-2 border-primary transform overflow-hidden rounded-2xl bg-background p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-2 text-white">{children}</div>
      </div>
    </div>
  );
};
