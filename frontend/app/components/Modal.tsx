import React, { type ReactNode } from 'react';
import { useUserStore } from '@/stores/UserStore';

interface ModalProps {
  name: string;
  children: ReactNode;
}

export const Modal = ({ name, children }: ModalProps) => {
  const { currentModal, modal } = useUserStore();

  console.log('MODAL DEBUG:', { componentName: name, storeSays: currentModal });

  if (currentModal !== name) {
    return null;
  }

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    minWidth: '300px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };

  return (
    <div style={backdropStyle} onClick={modal.close}>
      
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {children}
        
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button onClick={modal.close}>Zamknij</button>
        </div>
      </div>
      
    </div>
  );
};