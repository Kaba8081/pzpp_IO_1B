import React, { useState } from "react";
import { Trash2, X } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { deleteWorld } from "@/services/world";
import { Button } from "./Button";
import { Modal } from "./Modal";

export const DeleteWorldModal = () => {
  const { deletingWorld, setDeletingWorld, modal, bumpWorldsVersion } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setDeletingWorld(null);
    setError(null);
    modal.close();
  };

  const handleDelete = async () => {
    if (!deletingWorld) return;
    setLoading(true);
    setError(null);
    try {
      await deleteWorld(deletingWorld.id);
      bumpWorldsVersion();
      setDeletingWorld(null);
      modal.close();
    } catch {
      setError("Failed to delete world. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal name="delete-world">
      <div className="flex flex-col items-center text-center p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <Trash2 size={44} className="text-error mb-4" strokeWidth={1.5} />

        <h2 className="text-md tracking-widest mb-4">Delete World</h2>

        <p className="tracking-widest mb-2">Are you sure you want to delete</p>
        <p className="text-primary tracking-widest mb-6 truncate max-w-full px-4">
          &ldquo;{deletingWorld?.name ?? "this world"}&rdquo;?
        </p>
        <p className="text-input-placeholder tracking-widest mb-8">This action cannot be undone.</p>

        {error && <p className="text-error tracking-widest text-center mb-4">{error}</p>}

        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 tracking-widest"
            disabled={loading}
          >
            CANCEL
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="flex-1 tracking-widest"
            disabled={loading}
          >
            {loading ? "DELETING..." : "DELETE"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
