import React, { useEffect, useState } from "react";
import { Globe, X } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { updateWorld } from "@/services/world";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";

export const EditWorldModal = () => {
  const { editingWorld, setEditingWorld, modal, bumpWorldsVersion } = useUserStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingWorld) {
      setName(editingWorld.name ?? "");
      setDescription(editingWorld.description ?? "");
      setError(null);
    }
  }, [editingWorld]);

  const handleClose = () => {
    setEditingWorld(null);
    setError(null);
    modal.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorld) return;
    setError(null);
    setLoading(true);

    try {
      await updateWorld(editingWorld.id, { name, description: description || null });
      bumpWorldsVersion();
      setEditingWorld(null);
      modal.close();
    } catch {
      setError("Failed to update world. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal name="edit-world">
      <div className="flex flex-col p-2">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <Globe size={44} className="text-primary mb-4" strokeWidth={1.5} />
          <h2 className="text-md tracking-widest">Edit World</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="WORLD NAME"
            type="text"
            placeholder="Name your world"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="DESCRIPTION (OPTIONAL)"
            type="text"
            placeholder="Describe your world"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          {error && <p className="text-error     tracking-widest text-center mb-4">{error}</p>}

          <div className="flex gap-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 tracking-widest  "
              disabled={loading}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 tracking-widest  "
              disabled={loading}
            >
              {loading ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
