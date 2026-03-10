import React from 'react';
import { useUserStore } from './stores/UserStore';

const Modal = ({ name, children }) => {
  const { currentModal, modal } = useUserStore();

  if (currentModal !== name) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* Backdrop */}
      <div 
        onClick={modal.close} 
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} 
      />
      
      {/* Kontent modala */}
      <div style={{ position: 'relative', background: 'white', padding: '20px', borderRadius: '8px', minWidth: '300px' }}>
        {children}
      </div>
    </div>
  );
};

export default Modal;