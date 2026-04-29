import React from "react";
import { LogOut, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useUserStore } from "@/stores/UserStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/modals/Modal";

export const LogoutModal = () => {
  const { logout, modal } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    modal.close();
    navigate("/");
  };

  return (
    <Modal name="logout">
      <div className="flex flex-col items-center text-center p-6">
        <button
          onClick={modal.close}
          className="absolute top-4 right-4 hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <LogOut size={44} className="text-error mb-4" strokeWidth={1.5} />

        <h2 className="mb-6">Logout</h2>

        <p className="mb-8">Are you sure you want to logout of your account?</p>

        <div className="flex gap-4 w-full">
          <Button variant="outline" onClick={modal.close} className="flex-1 text-white">
            Cancel
          </Button>

          <Button variant="danger" onClick={handleLogout} className="flex-1">
            Logout
          </Button>
        </div>
      </div>
    </Modal>
  );
};
