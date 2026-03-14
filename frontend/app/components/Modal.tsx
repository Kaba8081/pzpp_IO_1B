import React, { type ReactNode } from 'react';
import { useUserStore } from '@/stores/UserStore';
import './Modal.css';

interface ModalProps {
  name: string;
  children: ReactNode;
}

export const Modal = ({ name, children }: ModalProps) => {
  const { currentModal, modal } = useUserStore();

  console.log('MODAL DEBUG:', { componentName: name, storeSays: currentModal }); //testing

  if (currentModal !== name) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={modal.close}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <div className="modal-footer">
          <button onClick={modal.close}>Zamknij</button>
        </div>
      </div>
    </div>
  );
};