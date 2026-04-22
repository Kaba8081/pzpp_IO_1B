import React, { useEffect, useState } from "react";
import { UserPen, X } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { updateCurrentUser } from "@/services/userService";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";

export const EditProfileModal = () => {
  const { user, setUser, modal } = useUserStore();

  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setUsername(user.profile.username ?? "");
      setDescription(user.profile.description ?? "");
      setError(null);
    }
  }, [user]);

  const handleClose = () => {
    setError(null);
    modal.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setLoading(true);

    try {
      const updatedProfile = await updateCurrentUser({ username, description });
      setUser({ ...user, profile: updatedProfile });
      modal.close();
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal name="edit-profile">
      <div className="flex flex-col p-2">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <UserPen size={44} className="text-primary mb-4" strokeWidth={1.5} />
          <h2 className="text-md tracking-widest">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="USERNAME"
            type="text"
            placeholder="Your display name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="DESCRIPTION (OPTIONAL)"
            type="text"
            placeholder="Tell us about yourself"
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
