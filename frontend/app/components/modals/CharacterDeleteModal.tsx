import React, { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/modals/Modal";
import { useUserStore } from "@/stores/UserStore";
import { deleteWorldProfile, getWorldProfilesByWorld } from "@/services/worldUserProfile";

export const CharacterDeleteModal = () => {
  const {
    activeProfile,
    bumpWorldsVersion,
    currentModal,
    deletingCharacter,
    markWorldMembershipRemoved,
    modal,
    setActiveProfileForWorld,
    setDeletingCharacter,
  } = useUserStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (currentModal === "delete-character" || isDeleting) return;
    setDeleteError(null);
    setDeletingCharacter(null);
  }, [currentModal, isDeleting, setDeletingCharacter]);

  const closeModal = () => {
    if (isDeleting) return;
    setDeleteError(null);
    setDeletingCharacter(null);
    modal.close();
  };

  const handleDelete = async () => {
    if (!deletingCharacter) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteWorldProfile(deletingCharacter.profile.id);
      const nextProfiles = await getWorldProfilesByWorld(deletingCharacter.worldId);

      if (nextProfiles.length === 0) {
        setActiveProfileForWorld(deletingCharacter.worldId, null);
        markWorldMembershipRemoved(deletingCharacter.worldId);
        bumpWorldsVersion();
      } else if (activeProfile?.id === deletingCharacter.profile.id) {
        setActiveProfileForWorld(deletingCharacter.worldId, nextProfiles[0]);
      }

      setDeletingCharacter(null);
      modal.close();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete character.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal name="delete-character">
      <div className="flex flex-col items-center text-center p-6">
        <button
          onClick={closeModal}
          disabled={isDeleting}
          className="absolute top-4 right-4 hover:text-primary transition-colors disabled:opacity-30"
        >
          <X size={24} />
        </button>

        <Trash2 size={44} className="text-error mb-4" strokeWidth={1.5} />

        <h2 className="mb-6">Delete character</h2>

        <p className="mb-8">
          Are you sure you want to delete {deletingCharacter?.profile.name ?? "this character"}?
        </p>

        {deleteError && <p className="mb-6 text-error">{deleteError}</p>}

        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={isDeleting}
            className="flex-1 text-white"
          >
            Cancel
          </Button>

          <Button variant="danger" onClick={handleDelete} disabled={isDeleting} className="flex-1">
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
