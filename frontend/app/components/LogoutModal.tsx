import React from 'react';
import { LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router'; 
import { useUserStore } from "@/stores/UserStore";
import { Button } from './Button'; 
import { Modal } from './Modal'; 

export const LogoutModal = () => {
  const { logout, modal } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    modal.close();
    navigate('/'); 
  };

  return (
    <Modal name="logout">
      <div className="flex flex-col items-center text-center p-6">
        
        <button 
          onClick={modal.close}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <LogOut size={44} className="text-error mb-4" strokeWidth={1.5} />

        <h2 className="font-cinzel text-md tracking-[0.2em] uppercase mb-6">
          Logout
        </h2>

        <p className="font-cinzel text-xs font-bold tracking-[0.1em] uppercase mb-8">
          Are you sure you want to logout of your account?
        </p>

        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            onClick={modal.close}
            className="flex-1 text-white tracking-widest"
          >
            CANCEL
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex-1 text-white tracking-widest !border-error !bg-error transition-all duration-300"
          >
            LOGOUT
          </Button>
        </div>
      </div>
    </Modal>
  );
};