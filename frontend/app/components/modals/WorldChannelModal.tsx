import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { bannerPool } from "@/components/ui/worldChannelBanners";
import { Input } from "@/components/ui/Input";
import {
  createWorld,
  updateWorld,
  deleteWorld as deleteWorldApi,
  uploadWorldImage,
} from "@/services/world";
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  uploadChannelImage,
} from "@/services/worldRoom";

type ActiveModal = "world" | "channel";
type AttributeType = "TEXT" | "NUMBER";

interface AttributeDraft {
  id: string;
  name: string;
  type: AttributeType;
}

interface ChannelDraft {
  id: number;
  serverId?: number;
  imageFile?: File;
  name: string;
  description: string;
  image: string;
}

interface WorldErrors {
  image?: string;
  name?: string;
  attributes?: string;
  attributeNames?: Record<string, string>;
}

interface ChannelErrors {
  channels?: string;
  name?: string;
}

export interface WorldChannelModalProps {
  mode?: "create" | "edit";
  worldId?: number;
  initialData?: {
    name: string;
    description: string;
    profile_picture: string;
  };
}

const defaultChannels: ChannelDraft[] = [
  { id: 1, name: "Welcome", description: "An example channel", image: bannerPool[0] },
];
const defaultAttributes: AttributeDraft[] = [
  { id: "attribute-1", name: "STRENGTH", type: "NUMBER" },
];
const attributeTypes = ["TEXT", "NUMBER"] as const;

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

const ErrorText = ({ message }: { message?: string }) =>
  message ? <p className="mt-2 text-error">{message}</p> : null;

interface ImageUploadDropzoneProps {
  title: string;
  imageSrc: string;
  alt: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  dragActive: boolean;
  setDragActive: (isActive: boolean) => void;
  onFileSelect: (file?: File) => void;
  fallbackImage: string;
  containerHeightClassName: string;
  uploadButtonClassName: string;
  imageClassName?: string;
}

const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  title,
  imageSrc,
  alt,
  inputRef,
  dragActive,
  setDragActive,
  onFileSelect,
  fallbackImage,
  containerHeightClassName,
  imageClassName,
}) => (
  <div
    className={`relative flex ${containerHeightClassName} cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-dashed p-6 transition-colors ${
      dragActive ? "border-primary" : "border-input-placeholder/50 hover:border-primary"
    }`}
    onClick={() => inputRef.current?.click()}
    onDragLeave={() => setDragActive(false)}
    onDragOver={(e) => {
      e.preventDefault();
      setDragActive(true);
    }}
    onDrop={(e) => {
      e.preventDefault();
      setDragActive(false);
      onFileSelect(e.dataTransfer.files[0]);
    }}
  >
    <img
      src={imageSrc}
      alt={alt}
      className={`absolute inset-0 h-full w-full object-cover opacity-35 ${imageClassName ?? ""}`}
      onError={(e) => {
        e.currentTarget.src = fallbackImage;
      }}
    />
    <div className="absolute inset-0 bg-black/35" />
    <div className="relative z-10">
      <div className="mb-1">{title}</div>
      <div>Drag and drop image</div>
    </div>
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => onFileSelect(e.target.files?.[0])}
    />
  </div>
);

interface AttributeTypeSelectProps {
  value: AttributeType;
  isOpen: boolean;
  options: readonly AttributeType[];
  onToggle: () => void;
  onSelect: (type: AttributeType) => void;
}

const AttributeTypeSelect: React.FC<AttributeTypeSelectProps> = ({
  value,
  isOpen,
  options,
  onToggle,
  onSelect,
}) => (
  <div className="relative h-13">
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      className="flex h-13 w-full items-center justify-between rounded-xl border border-primary bg-primary px-4 outline-none transition-colors hover:bg-primary/80"
    >
      {value}
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && (
      <div className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-primary/60 bg-background-site shadow-2xl">
        {options.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`block h-11 w-full px-4 text-left transition-colors ${
              value === type ? "bg-primary" : "text-white hover:bg-primary/20"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    )}
  </div>
);

interface AttributeRowProps {
  attribute: AttributeDraft;
  isEditing: boolean;
  nameError?: string;
  isTypeOpen: boolean;
  onNameChange: (name: string) => void;
  onToggleType: () => void;
  onSelectType: (type: AttributeType) => void;
  onRemove: () => void;
}

const AttributeRow: React.FC<AttributeRowProps> = ({
  attribute,
  isEditing,
  nameError,
  isTypeOpen,
  onNameChange,
  onToggleType,
  onSelectType,
  onRemove,
}) => (
  <div className="grid gap-3 md:grid-cols-[1fr_9rem_2.75rem]">
    <Input
      value={attribute.name}
      onChange={(e) => onNameChange(e.target.value)}
      placeholder="Attribute name"
      error={nameError}
      fieldClassName="h-13"
    />
    {isEditing ? (
      <div className="flex h-13 items-center rounded-xl border border-primary/40 bg-primary/15 px-4 text-primary">
        {attribute.type}
      </div>
    ) : (
      <AttributeTypeSelect
        value={attribute.type}
        isOpen={isTypeOpen}
        options={attributeTypes}
        onToggle={onToggleType}
        onSelect={onSelectType}
      />
    )}
    <button
      type="button"
      onClick={onRemove}
      className="flex h-13 items-center justify-center rounded-xl border border-white/15 transition-colors hover:border-error hover:text-error"
      aria-label="Delete attribute"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

interface ChannelCardProps {
  channel: ChannelDraft;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  canDrag: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isSelected,
  isDragging,
  isDragOver,
  canDrag,
  onSelect,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => (
  <div
    role="button"
    tabIndex={0}
    draggable={canDrag}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    }}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    onDragEnd={onDragEnd}
    className={`group relative h-20 shrink-0 cursor-grab overflow-hidden rounded-xl border text-left transition-colors active:cursor-grabbing ${
      isSelected ? "border-primary" : "border-primary/30 hover:border-primary/70"
    } ${isDragOver && !isDragging ? "ring-2 ring-primary" : ""} ${isDragging ? "opacity-60" : ""}`}
  >
    <img
      src={channel.image}
      alt={channel.name}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={(e) => {
        e.currentTarget.src = bannerPool[0];
      }}
    />
    <div className="absolute inset-0 bg-black/55 transition-colors group-hover:bg-black/35" />
    <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center rounded-lg border border-white/20 bg-black/55 p-2">
      <GripVertical className="h-4 w-4" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
      <span className="drop-shadow-md">{channel.name || "Untitled channel"}</span>
    </div>
  </div>
);

export const WorldChannelModal: React.FC<WorldChannelModalProps> = ({
  mode,
  worldId,
  initialData,
}) => {
  const { currentModal, modal, editingWorld, bumpWorldsVersion, bumpChannelsVersion } =
    useUserStore();

  const worldInputRef = useRef<HTMLInputElement>(null);
  const channelInputRef = useRef<HTMLInputElement>(null);
  const originalChannelIds = useRef<Set<number>>(new Set());

  const effectiveWorldId = worldId ?? editingWorld?.id;
  const effectiveInitialData =
    initialData ??
    (editingWorld
      ? {
          name: editingWorld.name ?? "",
          description: editingWorld.description ?? "",
          profile_picture: editingWorld.profile_picture ?? "",
        }
      : undefined);

  const [worldName, setWorldName] = useState(effectiveInitialData?.name ?? "");
  const [worldDescription, setWorldDescription] = useState(effectiveInitialData?.description ?? "");
  const [worldImage, setWorldImage] = useState(
    effectiveInitialData?.profile_picture || bannerPool[3]
  );
  const [worldImageFile, setWorldImageFile] = useState<File | null>(null);
  const [attributes, setAttributes] = useState<AttributeDraft[]>(defaultAttributes);
  const [worldErrors, setWorldErrors] = useState<WorldErrors>({});
  const [worldDragActive, setWorldDragActive] = useState(false);
  const [openAttributeTypeId, setOpenAttributeTypeId] = useState<string | null>(null);

  const [channels, setChannels] = useState<ChannelDraft[]>(defaultChannels);
  const [selectedChannelId, setSelectedChannelId] = useState(defaultChannels[0].id);
  const [channelErrors, setChannelErrors] = useState<ChannelErrors>({});
  const [channelDragActive, setChannelDragActive] = useState(false);
  const [isConfirmingWorldDelete, setIsConfirmingWorldDelete] = useState(false);
  const [draggedChannelId, setDraggedChannelId] = useState<number | null>(null);
  const [dragOverChannelId, setDragOverChannelId] = useState<number | null>(null);

  const [createdWorldId, setCreatedWorldId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [channelsLoaded, setChannelsLoaded] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const activeModal: ActiveModal | null = useMemo(() => {
    if (currentModal === "world-modal") return "world";
    if (currentModal === "channel-modal") return "channel";
    return null;
  }, [currentModal]);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? channels[0];
  const modalMode = mode ?? (effectiveWorldId ? "edit" : "create");
  const isEditing = modalMode === "edit";

  useEffect(() => {
    setWorldName(effectiveInitialData?.name ?? "");
    setWorldDescription(effectiveInitialData?.description ?? "");
    setWorldImage(effectiveInitialData?.profile_picture || bannerPool[3]);
    setWorldImageFile(null);
    setIsConfirmingWorldDelete(false);
    setServerError(null);
  }, [
    effectiveWorldId,
    effectiveInitialData?.name,
    effectiveInitialData?.description,
    effectiveInitialData?.profile_picture,
  ]);

  const prevModalRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const wasNull = prevModalRef.current == null;
    prevModalRef.current = currentModal;

    if (currentModal === "world-modal" && wasNull) {
      setCreatedWorldId(null);
      setServerError(null);
      setWorldErrors({});
      setChannelErrors({});
      if (!effectiveWorldId) {
        setWorldName("");
        setWorldDescription("");
        setWorldImage(bannerPool[3]);
        setWorldImageFile(null);
        setAttributes(defaultAttributes);
        setChannels(defaultChannels);
        setSelectedChannelId(defaultChannels[0].id);
      }
    }

    if (currentModal === "channel-modal" && wasNull) {
      setServerError(null);
      setChannelErrors({});
      if (!effectiveWorldId) {
        setChannels(defaultChannels);
        setSelectedChannelId(defaultChannels[0].id);
        setChannelsLoaded(true);
      }
    }
  }, [currentModal, effectiveWorldId]);

  useEffect(() => {
    if (!effectiveWorldId || activeModal !== "channel") return;

    setChannels([]);
    setChannelsLoaded(false);

    let mounted = true;
    getChannels(effectiveWorldId)
      .then((serverChannels) => {
        if (!mounted) return;
        originalChannelIds.current = new Set(serverChannels.map((ch) => ch.id));
        const drafts: ChannelDraft[] = serverChannels.map((ch, i) => ({
          id: ch.id,
          serverId: ch.id,
          name: ch.name ?? "",
          description: ch.description ?? "",
          image: ch.thumbnail ?? bannerPool[i % bannerPool.length],
        }));
        setChannels(drafts);
        setSelectedChannelId(drafts[0]?.id ?? -1);
        setChannelsLoaded(true);
      })
      .catch(() => setChannelsLoaded(true));

    return () => {
      mounted = false;
    };
  }, [effectiveWorldId, activeModal]);

  const isOpen = activeModal !== null;
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const displayModalRef = useRef<ActiveModal>("world");
  if (activeModal !== null) displayModalRef.current = activeModal;
  const displayModal = displayModalRef.current;

  useEffect(() => {
    if (isOpen) {
      setIsModalMounted(true);
      const t = setTimeout(() => setIsModalVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsModalVisible(false);
      const t = setTimeout(() => setIsModalMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isModalMounted) return null;

  const updateSelectedChannel = (updates: Partial<ChannelDraft>) => {
    if (!selectedChannel) return;
    setChannels((cs) => cs.map((c) => (c.id === selectedChannel.id ? { ...c, ...updates } : c)));
  };

  const addAttribute = () => {
    setAttributes((attrs) => [
      ...attrs,
      { id: `attribute-${Date.now()}`, name: `ATTRIBUTE ${attrs.length + 1}`, type: "TEXT" },
    ]);
    setWorldErrors((e) => ({ ...e, attributes: undefined }));
  };

  const removeAttribute = (id: string) =>
    setAttributes((attrs) => attrs.filter((a) => a.id !== id));

  const updateAttribute = (id: string, updates: Partial<AttributeDraft>) =>
    setAttributes((attrs) => attrs.map((a) => (a.id === id ? { ...a, ...updates } : a)));

  const addChannel = () => {
    const id = Date.now();
    setChannels((cs) => [
      ...cs,
      {
        id,
        name: `CHANNEL ${cs.length + 1}`,
        description: "",
        image: bannerPool[(cs.length + 1) % bannerPool.length],
      },
    ]);
    setSelectedChannelId(id);
    setChannelErrors({});
  };

  const selectChannel = (id: number) => {
    setSelectedChannelId(id);
    setChannelErrors({});
  };

  const clearChannelDragState = () => {
    setDraggedChannelId(null);
    setDragOverChannelId(null);
  };

  const reorderChannel = (draggedId: number, targetId: number) => {
    if (draggedId === targetId) return;
    setChannels((cs) => {
      const from = cs.findIndex((c) => c.id === draggedId);
      const to = cs.findIndex((c) => c.id === targetId);
      if (from < 0 || to < 0) return cs;
      const next = [...cs];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const deleteSelectedChannel = () => {
    if (!selectedChannel) return;
    if (channels.length === 1) {
      setChannelErrors({ channels: "At least one channel is required." });
      return;
    }
    const idx = channels.findIndex((c) => c.id === selectedChannel.id);
    const next = channels.filter((c) => c.id !== selectedChannel.id);
    setChannels(next);
    setSelectedChannelId(next[Math.max(0, idx - 1)].id);
    setChannelErrors({});
  };

  const handleDeleteWorld = async () => {
    if (!isConfirmingWorldDelete) {
      setIsConfirmingWorldDelete(true);
      return;
    }
    setIsLoading(true);
    setServerError(null);
    try {
      await deleteWorldApi(effectiveWorldId!);
      bumpWorldsVersion();
      modal.close();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Failed to delete world.");
      setIsConfirmingWorldDelete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const validateWorld = () => {
    const errors: WorldErrors = {};
    const attributeNames: Record<string, string> = {};
    if (!worldName.trim()) errors.name = "World name is required.";
    if (attributes.length === 0) errors.attributes = "Add at least one required attribute.";
    attributes.forEach((a) => {
      if (!a.name.trim()) attributeNames[a.id] = "Attribute name is required.";
    });
    if (Object.keys(attributeNames).length > 0) errors.attributeNames = attributeNames;
    setWorldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateChannel = () => {
    const errors: ChannelErrors = {};
    if (channels.length === 0) errors.channels = "Add at least one channel.";
    if (!selectedChannel?.name.trim()) errors.name = "Channel name is required.";
    setChannelErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveWorldStep = async () => {
    let targetWorldId = isEditing ? effectiveWorldId! : createdWorldId;

    if (!targetWorldId) {
      const world = await createWorld({ name: worldName, description: worldDescription });
      targetWorldId = world.id;
      setCreatedWorldId(world.id);
    } else {
      await updateWorld(targetWorldId, { name: worldName, description: worldDescription });
    }

    if (worldImageFile) {
      await uploadWorldImage(targetWorldId, worldImageFile);
      if (!isEditing) setWorldImageFile(null);
    }

    bumpWorldsVersion();
    return targetWorldId;
  };

  const saveChannelDraft = async (targetWorldId: number, channel: ChannelDraft) => {
    let targetChannelId = channel.serverId;
    if (targetChannelId !== undefined) {
      await updateChannel(targetChannelId, {
        name: channel.name,
        description: channel.description,
      });
    } else {
      const created = await createChannel(targetWorldId, {
        name: channel.name,
        description: channel.description,
      });
      targetChannelId = created.id;
    }
    if (channel.imageFile) await uploadChannelImage(targetChannelId, channel.imageFile);
  };

  const saveCurrentStep = async () => {
    const isValid = activeModal === "world" ? validateWorld() : validateChannel();
    if (!isValid) return;
    setIsLoading(true);
    setServerError(null);
    try {
      if (activeModal === "world") {
        await saveWorldStep();
        if (!isEditing) modal.open("channel-modal");
        else modal.close();
      } else {
        const targetWorldId = isEditing ? effectiveWorldId! : createdWorldId!;
        if (isEditing) {
          const currentServerIds = new Set(
            channels.filter((ch) => ch.serverId !== undefined).map((ch) => ch.serverId!)
          );
          for (const originalId of originalChannelIds.current) {
            if (!currentServerIds.has(originalId)) await deleteChannel(originalId);
          }
        }
        for (const channel of channels) await saveChannelDraft(targetWorldId, channel);
        bumpChannelsVersion();
        bumpWorldsVersion();
        modal.close();
      }
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorldFile = (file?: File) => {
    if (!file) return;
    readImage(
      file,
      (image) => {
        setWorldImage(image);
        setWorldImageFile(file);
        setWorldErrors((e) => ({ ...e, image: undefined }));
      },
      (message) => setWorldErrors((e) => ({ ...e, image: message }))
    );
  };

  const handleChannelFile = (file?: File) => {
    if (!file) return;
    readImage(
      file,
      (image) => {
        updateSelectedChannel({ image, imageFile: file });
        setChannelErrors({});
      },
      (message) => setChannelErrors((e) => ({ ...e, channels: message }))
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-200 ${isModalVisible ? "opacity-100" : "opacity-0"}`}
      onClick={modal.close}
    >
      <div
        className={`relative flex max-h-[92vh] w-full max-w-250 flex-col overflow-hidden rounded-2xl border border-primary bg-background shadow-2xl transition-all duration-200 ${isModalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {displayModal === "world" ? (
          <div className="flex flex-col gap-10 overflow-y-auto p-6 md:flex-row md:p-10">
            <div className="flex flex-1 flex-col gap-6">
              <h2 className="mb-2 text-2xl">{isEditing ? "Edit world" : "Create world"}</h2>

              <ImageUploadDropzone
                title="World banner"
                imageSrc={worldImage}
                alt="World banner"
                inputRef={worldInputRef}
                dragActive={worldDragActive}
                setDragActive={setWorldDragActive}
                onFileSelect={handleWorldFile}
                fallbackImage={bannerPool[3]}
                containerHeightClassName="min-h-32"
                uploadButtonClassName="relative z-10 flex items-center gap-3 rounded-xl border border-primary/50 bg-black/40 px-4 py-2 transition-all hover:bg-primary/20"
              />
              <ErrorText message={worldErrors.image} />

              <Input
                label="World name"
                value={worldName}
                onChange={(e) => {
                  setWorldName(e.target.value);
                  setWorldErrors((er) => ({ ...er, name: undefined }));
                }}
                placeholder="Enter world name..."
                error={worldErrors.name}
              />
              <Input
                multiline
                label="Description"
                value={worldDescription}
                onChange={(e) => setWorldDescription(e.target.value)}
                placeholder="Enter description..."
                fieldClassName="min-h-32"
              />
            </div>

            <div className="flex flex-1 flex-col gap-6 md:border-l md:border-primary/20 md:pl-10">
              <h2 className="mb-2 text-2xl">Required attributes</h2>
              <div className="flex flex-col gap-4">
                {attributes.map((attribute) => (
                  <AttributeRow
                    key={attribute.id}
                    attribute={attribute}
                    isEditing={isEditing}
                    nameError={worldErrors.attributeNames?.[attribute.id]}
                    isTypeOpen={openAttributeTypeId === attribute.id}
                    onNameChange={(name) => {
                      updateAttribute(attribute.id, { name });
                      setWorldErrors((e) => ({
                        ...e,
                        attributeNames: { ...e.attributeNames, [attribute.id]: "" },
                      }));
                    }}
                    onToggleType={() =>
                      setOpenAttributeTypeId((id) => (id === attribute.id ? null : attribute.id))
                    }
                    onSelectType={(type) => {
                      updateAttribute(attribute.id, { type });
                      setOpenAttributeTypeId(null);
                    }}
                    onRemove={() => removeAttribute(attribute.id)}
                  />
                ))}
                <ErrorText message={worldErrors.attributes} />

                <button
                  type="button"
                  onClick={addAttribute}
                  className="mt-2 flex h-13 items-center justify-between rounded-xl border border-input-stroke-hover/60 bg-input-bg p-4 transition-colors hover:border-primary"
                >
                  <span>Add new attribute</span>
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10 overflow-y-auto p-6 md:flex-row md:p-10">
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="mb-2 text-2xl">Edit channels</h2>

              <button
                type="button"
                onClick={addChannel}
                className="flex h-20 shrink-0 items-center justify-center gap-3 rounded-xl border border-input-stroke-hover/60 bg-input-bg transition-colors hover:border-primary"
              >
                <span>Add new channel</span>
                <Plus className="h-5 w-5" />
              </button>

              <div className="flex max-h-100 flex-col gap-3 overflow-y-auto pr-2">
                {channels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    isSelected={channel.id === selectedChannel?.id}
                    isDragging={draggedChannelId === channel.id}
                    isDragOver={dragOverChannelId === channel.id}
                    canDrag={channels.length > 1}
                    onSelect={() => selectChannel(channel.id)}
                    onDragStart={(e) => {
                      setDraggedChannelId(channel.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(channel.id));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverChannelId(channel.id);
                    }}
                    onDragLeave={() =>
                      setDragOverChannelId((id) => (id === channel.id ? null : id))
                    }
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedId =
                        draggedChannelId ?? Number(e.dataTransfer.getData("text/plain"));
                      if (Number.isFinite(droppedId)) reorderChannel(droppedId, channel.id);
                      clearChannelDragState();
                    }}
                    onDragEnd={clearChannelDragState}
                  />
                ))}
                <ErrorText message={channelErrors.channels} />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 md:border-l md:border-primary/20 md:pl-10">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h2 className="text-2xl">Channel</h2>
                <button
                  type="button"
                  onClick={deleteSelectedChannel}
                  className="flex items-center gap-2 rounded-xl bg-error px-4 py-2 transition-colors hover:bg-error/80"
                >
                  <span>Delete channel</span>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {selectedChannel && (
                <>
                  <ImageUploadDropzone
                    title="Channel banner"
                    imageSrc={selectedChannel.image}
                    alt="Channel banner"
                    inputRef={channelInputRef}
                    dragActive={channelDragActive}
                    setDragActive={setChannelDragActive}
                    onFileSelect={handleChannelFile}
                    fallbackImage={bannerPool[0]}
                    containerHeightClassName="h-24"
                    uploadButtonClassName="relative z-10 flex items-center gap-3 rounded-xl border border-white/30 bg-black/40 px-4 py-2 transition-colors hover:border-primary"
                    imageClassName="transition-opacity"
                  />
                  <Input
                    label="Channel name"
                    value={selectedChannel.name}
                    onChange={(e) => {
                      updateSelectedChannel({ name: e.target.value });
                      setChannelErrors((er) => ({ ...er, name: undefined }));
                    }}
                    placeholder="Enter channel name..."
                    error={channelErrors.name}
                  />
                  <Input
                    multiline
                    label="Short description"
                    value={selectedChannel.description}
                    onChange={(e) => updateSelectedChannel({ description: e.target.value })}
                    placeholder="Enter short description..."
                    fieldClassName="min-h-32"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {serverError && <p className="px-10 pb-2 text-center text-error">{serverError}</p>}

        <div className="flex flex-col gap-4 border-t border-primary/30 bg-background-site p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={modal.close}
              disabled={isLoading}
              className="flex items-center gap-3 rounded-xl border border-error/70 px-5 py-2.5 text-error transition-colors hover:bg-error/10 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span>Exit</span>
            </button>
            {displayModal === "channel" && (
              <button
                type="button"
                onClick={() => modal.open("world-modal")}
                disabled={isLoading}
                className="flex items-center gap-3 rounded-xl border border-white/20 px-5 py-2.5 transition-colors hover:border-white disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to world</span>
              </button>
            )}
            {isEditing && displayModal === "world" && (
              <button
                type="button"
                onClick={handleDeleteWorld}
                disabled={isLoading}
                className={`flex items-center gap-3 rounded-xl border px-5 py-2.5 transition-colors disabled:opacity-50 ${
                  isConfirmingWorldDelete
                    ? "border-error bg-error hover:bg-error/80"
                    : "border-error/70 text-error hover:bg-error/10"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span>{isConfirmingWorldDelete ? "Confirm delete" : "Delete world"}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 md:justify-end">
            {isEditing && displayModal === "world" && (
              <button
                type="button"
                onClick={() => modal.open("channel-modal")}
                disabled={isLoading}
                className="flex items-center gap-3 rounded-xl border border-primary px-6 py-2.5 text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                <span>Go to channels</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={saveCurrentStep}
              disabled={isLoading || (isEditing && displayModal === "channel" && !channelsLoaded)}
              className="flex items-center gap-3 rounded-xl bg-primary px-8 py-2.5 transition-colors hover:bg-primary/80 disabled:opacity-50"
            >
              <span>
                {isLoading
                  ? "Saving..."
                  : displayModal === "world"
                    ? isEditing
                      ? "Save world"
                      : "Next step"
                    : isEditing
                      ? "Save channels"
                      : "Create world"}
              </span>
              {!isLoading &&
                (displayModal === "world" && !isEditing ? (
                  <ArrowRight className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                ))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
