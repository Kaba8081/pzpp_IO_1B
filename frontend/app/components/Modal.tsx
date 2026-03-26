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
        className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ZAWARTOŚĆ MODALA */}
        <div className="mt-2 text-gray-600">{children}</div>

        {/* FOOTER */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={modal.close}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors active:scale-95"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
