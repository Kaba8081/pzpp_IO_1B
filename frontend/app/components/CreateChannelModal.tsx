import React, { useState } from "react";
import { Hash, X } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { createChannel } from "@/services/worldRoom";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";

export const CreateChannelModal = () => {
  const { channelCreationWorld, setChannelCreationWorld, modal, bumpChannelsVersion } =
    useUserStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    setChannelCreationWorld(null);
    modal.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelCreationWorld) return;
    setError(null);
    setLoading(true);
    try {
      await createChannel(channelCreationWorld.id, { name, description });
      bumpChannelsVersion();
      reset();
      setChannelCreationWorld(null);
      modal.close();
    } catch {
      setError("Failed to create channel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal name="create-channel">
      <div className="flex flex-col p-2">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <Hash size={44} className="text-primary mb-4" strokeWidth={1.5} />
          <h2 className="text-md tracking-widest">Create Channel</h2>
          {channelCreationWorld && (
            <p className="text-input-placeholder tracking-widest mt-2">
              in {channelCreationWorld.name}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="CHANNEL NAME"
            type="text"
            placeholder="e.g. general, tavern..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="DESCRIPTION"
            type="text"
            placeholder="What happens here?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
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
              {loading ? "CREATING..." : "CREATE"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
