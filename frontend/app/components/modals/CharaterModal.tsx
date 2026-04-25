import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserStore } from "@/stores/UserStore";
import { Button } from "../Button";
import { Upload, X } from "lucide-react";
import type { WorldUserProfile } from "@/types/models";
import { Input } from "../Input";
import {
  createWorldProfile,
  getWorldProfile,
  updateWorldProfile,
  uploadWorldProfileAvatar,
} from "@/services/worldUserProfile";

export interface CharacterModalProps {
  mode?: "display" | "create" | "edit";
  profileId?: number;
  worldId?: number;
}

type CharacterErrors = {
  name?: string;
  description?: string;
};

const readImage = (
  file: File,
  onRead: (image: string) => void,
  onError: (message: string) => void
) => {
  if (!file.type.startsWith("image/")) {
    onError("Select an image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      onRead(reader.result);
      return;
    }
    onError("Could not read the selected image.");
  };
  reader.onerror = () => onError("Could not read the selected image.");
  reader.readAsDataURL(file);
};

export const CharacterModal: React.FC<CharacterModalProps> = ({
  mode,
  profileId,
  worldId,
}: CharacterModalProps) => {
  const { modal, setActiveProfile } = useUserStore();
  const [characterData, setCharacterData] = useState<Partial<WorldUserProfile>>({});
  const [errors, setErrors] = useState<CharacterErrors>({});
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarDragActive, setAvatarDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const editMode = useMemo(() => mode !== "display", [mode]);

  useEffect(() => {
    if (!profileId) return;

    const fetchExistingProfile = async (profileId: WorldUserProfile["id"]) => {
      setIsLoading(true);
      getWorldProfile(profileId)
        .then((res) => {
          setCharacterData(res);
          if (res.avatar) setAvatar(res.avatar);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    };

    fetchExistingProfile(profileId);
  }, [profileId]);

  const validate = (): boolean => {
    if (!characterData.name?.trim()) {
      setErrors((prev) => ({ ...prev, name: "Character name cannot be empty" }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
    return true;
  };

  const handleCreate = async () => {
    if (!worldId || !validate()) return;
    setIsSubmitting(true);
    try {
      const profile = await createWorldProfile(worldId, {
        name: characterData.name!,
        description: characterData.description,
      });
      if (avatarFile) await uploadWorldProfileAvatar(profile.id, avatarFile);
      setActiveProfile(profile);
      modal.close();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        name: error instanceof Error ? error.message : "Failed to create character",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!profileId || !validate()) return;
    setIsSubmitting(true);
    try {
      await updateWorldProfile(profileId, {
        name: characterData.name!,
        description: characterData.description,
      });
      if (avatarFile) await uploadWorldProfileAvatar(profileId, avatarFile);
      modal.close();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        name: error instanceof Error ? error.message : "Failed to update character",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarFile = (file?: File) => {
    if (!file) return;
    setAvatarFile(file);
    readImage(
      file,
      (image) => setAvatar(image),
      (message) => setErrors((prev) => ({ ...prev, name: message }))
    );
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCharacterData((prev) => ({ ...prev, name: value }));
    if (value?.trim().length === 0)
      setErrors((prev) => ({ ...prev, name: "Character name cannot be empty" }));
    else setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCharacterData((prev) => ({ ...prev, description: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={modal.close}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-250 flex-col overflow-hidden rounded-2xl border border-primary bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Main Content */}
        <div className="flex flex-col gap-10 overflow-y-auto p-6 md:flex-row md:p-10">
          {/* Left column */}
          <div className="flex flex-1 flex-col gap-6">
            <h2 className="mb-2 text-2xl">
              {mode === "create" && "Create character"}
              {mode === "display" &&
                (isLoading ? (
                  <div className="h-7 w-40 animate-pulse rounded-md bg-primary/20" />
                ) : (
                  characterData?.name
                ))}
              {mode === "edit" &&
                (isLoading ? (
                  <div className="h-7 w-48 animate-pulse rounded-md bg-primary/20" />
                ) : (
                  `Edit ${characterData?.name}`
                ))}
            </h2>

            {isLoading && mode !== "create" ? (
              <div className="h-10 w-full animate-pulse rounded-xl bg-primary/20" />
            ) : (
              <Input
                label="Character name"
                value={characterData.name}
                onChange={handleNameChange}
                className="mb-0"
                error={errors.name}
                disabled={!editMode}
              />
            )}

            {/* Avatar */}
            {mode === "display" ? (
              <div className="relative flex flex-1 overflow-hidden rounded-2xl border border-primary/30">
                {isLoading ? (
                  <div className="flex-1 animate-pulse bg-primary/20" />
                ) : avatar ? (
                  <img src={avatar} alt="Character avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-1 items-center justify-center text-input-placeholder">
                    No avatar
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`relative flex flex-1 cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-dashed p-6 transition-colors ${
                  avatarDragActive
                    ? "border-primary"
                    : "border-input-placeholder/50 hover:border-primary"
                }`}
                onClick={() => avatarInputRef.current?.click()}
                onDragLeave={() => setAvatarDragActive(false)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setAvatarDragActive(true);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setAvatarDragActive(false);
                  handleAvatarFile(event.dataTransfer.files[0]);
                }}
              >
                {avatar && (
                  <>
                    <img
                      src={avatar}
                      alt="Character avatar"
                      className="absolute inset-0 h-full w-full object-cover opacity-35"
                    />
                    <div className="absolute inset-0 bg-black/35" />
                  </>
                )}
                <div className="flex flex-col relative z-10">
                  <span className="mb-1">Character avatar</span>
                  <span>Drag and drop image</span>
                </div>
                <Button
                  variant="ghost"
                  className="relative z-10 flex items-center gap-3 rounded-xl border border-primary/50 bg-black/40 px-4 py-2 transition-all hover:bg-primary/20"
                  onClick={(event) => {
                    event.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                >
                  Upload <Upload className="h-4 w-4" />
                </Button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleAvatarFile(event.target.files?.[0])}
                />
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-1 flex-col gap-6 md:border-l md:border-primary/20 md:pl-10 overflow-auto pr-2">
            {/* Description */}
            <div className="flex flex-col gap-y-2">
              {isLoading && mode !== "create" ? (
                <div className="min-h-64 w-full animate-pulse rounded-xl bg-primary/20" />
              ) : (
                <Input
                  label="Description"
                  value={characterData.description ?? ""}
                  onChange={handleDescriptionChange}
                  className="min-h-64"
                  error={errors.description}
                  disabled={!editMode}
                  multiline
                />
              )}
            </div>

            {/* Attributes */}
            <div className="flex flex-col">
              <h2 className="mb-2 text-2xl">Attributes</h2>
              {/* TODO */}
            </div>
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex flex-col gap-4 border-t border-primary/30 bg-background-site p-6 md:flex-row md:items-center md:justify-between">
          {/* Left side */}
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={modal.close}
              className="flex items-center gap-3 rounded-xl border border-error/70 px-5 py-2.5 text-error transition-colors hover:bg-error/10"
              variant="ghost"
            >
              <X className="h-4 w-4" />
              {mode === "display" ? "Exit" : "Cancel"}
            </Button>
          </div>

          {/* Right side */}
          {editMode && (
            <div className="flex flex-wrap gap-4 md:justify-end">
              {mode === "create" && (
                <Button
                  className="flex items-center gap-3 rounded-xl bg-primary px-8 py-2.5 transition-colors hover:bg-primary/80 disabled:opacity-50"
                  variant="ghost"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              )}
              {mode === "edit" && (
                <Button
                  className="flex items-center gap-3 rounded-xl bg-primary px-8 py-2.5 transition-colors hover:bg-primary/80 disabled:opacity-50"
                  variant="ghost"
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
