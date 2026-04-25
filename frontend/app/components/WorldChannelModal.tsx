import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Edit2,
  FileText,
  GripVertical,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { bannerPool } from "./worldChannelBanners";

type ActiveModal = "world" | "channel";
type AttributeType = "TEXT" | "NUMBER";

interface AttributeDraft {
  id: string;
  name: string;
  type: AttributeType;
}

interface ChannelDraft {
  id: number;
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
  onDeleteWorld?: () => void;
}

const defaultChannels: ChannelDraft[] = [
  {
    id: 1,
    name: "Welcome",
    description: "An example channel",
    image: bannerPool[0],
  },
];

const defaultAttributes: AttributeDraft[] = [
  { id: "attribute-1", name: "STRENGTH", type: "NUMBER" },
];

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

export const WorldChannelModal: React.FC<WorldChannelModalProps> = ({
  mode,
  worldId,
  initialData,
  onDeleteWorld,
}) => {
  const { currentModal, modal } = useUserStore();
  const worldInputRef = useRef<HTMLInputElement>(null);
  const channelInputRef = useRef<HTMLInputElement>(null);

  const [worldName, setWorldName] = useState(initialData?.name ?? "");
  const [worldDescription, setWorldDescription] = useState(initialData?.description ?? "");
  const [worldImage, setWorldImage] = useState(initialData?.profile_picture || bannerPool[3]);
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

  const activeModal: ActiveModal | null = useMemo(() => {
    if (currentModal === "world-modal") return "world";
    if (currentModal === "channel-modal") return "channel";
    return null;
  }, [currentModal]);

  const selectedChannel =
    channels.find((channel) => channel.id === selectedChannelId) ?? channels[0];
  const modalMode = mode ?? (worldId ? "edit" : "create");
  const isEditing = modalMode === "edit";

  useEffect(() => {
    setWorldName(initialData?.name ?? "");
    setWorldDescription(initialData?.description ?? "");
    setWorldImage(initialData?.profile_picture || bannerPool[3]);
    setIsConfirmingWorldDelete(false);
  }, [initialData]);

  if (!activeModal) return null;

  const updateSelectedChannel = (updates: Partial<ChannelDraft>) => {
    if (!selectedChannel) return;

    setChannels((currentChannels) =>
      currentChannels.map((channel) =>
        channel.id === selectedChannel.id ? { ...channel, ...updates } : channel
      )
    );
  };

  const addAttribute = () => {
    const nextNumber = attributes.length + 1;
    setAttributes((currentAttributes) => [
      ...currentAttributes,
      {
        id: `attribute-${Date.now()}`,
        name: `ATTRIBUTE ${nextNumber}`,
        type: "TEXT",
      },
    ]);
    setWorldErrors((currentErrors) => ({ ...currentErrors, attributes: undefined }));
  };

  const removeAttribute = (attributeId: string) => {
    setAttributes((currentAttributes) =>
      currentAttributes.filter((attribute) => attribute.id !== attributeId)
    );
  };

  const updateAttribute = (attributeId: string, updates: Partial<AttributeDraft>) => {
    setAttributes((currentAttributes) =>
      currentAttributes.map((attribute) =>
        attribute.id === attributeId ? { ...attribute, ...updates } : attribute
      )
    );
  };

  const addChannel = () => {
    const nextNumber = channels.length + 1;
    const id = Date.now();
    const nextChannel = {
      id,
      name: `CHANNEL ${nextNumber}`,
      description: "",
      image: bannerPool[nextNumber % bannerPool.length],
    };

    setChannels((currentChannels) => [...currentChannels, nextChannel]);
    setSelectedChannelId(id);
    setChannelErrors({});
  };

  const reorderChannel = (draggedId: number, targetId: number) => {
    if (draggedId === targetId) return;

    setChannels((currentChannels) => {
      const currentIndex = currentChannels.findIndex((channel) => channel.id === draggedId);
      const nextIndex = currentChannels.findIndex((channel) => channel.id === targetId);

      if (currentIndex < 0 || nextIndex < 0) return currentChannels;

      const nextChannels = [...currentChannels];
      const [movedChannel] = nextChannels.splice(currentIndex, 1);
      nextChannels.splice(nextIndex, 0, movedChannel);
      return nextChannels;
    });
  };

  const deleteSelectedChannel = () => {
    if (!selectedChannel) return;

    if (channels.length === 1) {
      setChannelErrors({ channels: "At least one channel is required." });
      return;
    }

    const selectedIndex = channels.findIndex((channel) => channel.id === selectedChannel.id);
    const nextChannels = channels.filter((channel) => channel.id !== selectedChannel.id);
    const nextSelectedChannel = nextChannels[Math.max(0, selectedIndex - 1)];

    setChannels(nextChannels);
    setSelectedChannelId(nextSelectedChannel.id);
    setChannelErrors({});
  };

  const deleteWorld = () => {
    if (!isConfirmingWorldDelete) {
      setIsConfirmingWorldDelete(true);
      return;
    }

    onDeleteWorld?.();
    modal.close();
  };

  const validateWorld = () => {
    const nextErrors: WorldErrors = {};
    const attributeNames: Record<string, string> = {};

    if (!worldName.trim()) {
      nextErrors.name = "World name is required.";
    }

    if (attributes.length === 0) {
      nextErrors.attributes = "Add at least one required attribute.";
    }

    attributes.forEach((attribute) => {
      if (!attribute.name.trim()) {
        attributeNames[attribute.id] = "Attribute name is required.";
      }
    });

    if (Object.keys(attributeNames).length > 0) {
      nextErrors.attributeNames = attributeNames;
    }

    setWorldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateChannel = () => {
    const nextErrors: ChannelErrors = {};

    if (channels.length === 0) {
      nextErrors.channels = "Add at least one channel.";
    }

    if (!selectedChannel?.name.trim()) {
      nextErrors.name = "Channel name is required.";
    }

    setChannelErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveCurrentStep = () => {
    const isValid = activeModal === "world" ? validateWorld() : validateChannel();

    if (isValid) {
      if (activeModal === "world" && !isEditing) {
        modal.open("channel-modal");
      } else {
        modal.close();
      }
    }
  };

  const handleWorldFile = (file?: File) => {
    if (!file) return;

    readImage(
      file,
      (image) => {
        setWorldImage(image);
        setWorldErrors((currentErrors) => ({ ...currentErrors, image: undefined }));
      },
      (message) =>
        setWorldErrors((currentErrors) => ({
          ...currentErrors,
          name: currentErrors.name,
          image: message,
        }))
    );
  };

  const handleChannelFile = (file?: File) => {
    if (!file) return;

    readImage(
      file,
      (image) => {
        updateSelectedChannel({ image });
        setChannelErrors({});
      },
      (message) => setChannelErrors((currentErrors) => ({ ...currentErrors, channels: message }))
    );
  };

  const renderError = (message?: string) =>
    message ? (
      <p className="mt-2 text-[10px] uppercase tracking-widest text-error">{message}</p>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={modal.close}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-250 flex-col overflow-hidden rounded-2xl border border-primary bg-background font-cinzel text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {activeModal === "world" ? (
          <div className="flex flex-col gap-10 overflow-y-auto p-6 md:flex-row md:p-10">
            <div className="flex flex-1 flex-col gap-6">
              <h2 className="mb-2 text-2xl font-bold tracking-wider">
                {isEditing ? "Edit world" : "Create world"}
              </h2>

              <div
                className={`relative flex min-h-32 cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-dashed p-6 transition-colors ${
                  worldDragActive
                    ? "border-primary"
                    : "border-input-placeholder/50 hover:border-primary"
                }`}
                onClick={() => worldInputRef.current?.click()}
                onDragLeave={() => setWorldDragActive(false)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setWorldDragActive(true);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setWorldDragActive(false);
                  handleWorldFile(event.dataTransfer.files[0]);
                }}
              >
                <img
                  src={worldImage}
                  alt="World banner"
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                  onError={(event) => {
                    event.currentTarget.src = bannerPool[3];
                  }}
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative z-10">
                  <div className="mb-1 text-[10px] uppercase tracking-widest text-white/70">
                    World banner
                  </div>
                  <div className="text-sm font-bold tracking-wider">Drag and drop image</div>
                </div>
                <button
                  type="button"
                  className="relative z-10 flex items-center gap-3 rounded-xl border border-primary/50 bg-black/40 px-4 py-2 text-xs transition-all hover:bg-primary/20"
                  onClick={(event) => {
                    event.stopPropagation();
                    worldInputRef.current?.click();
                  }}
                >
                  Upload <Upload className="h-4 w-4" />
                </button>
                <input
                  ref={worldInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleWorldFile(event.target.files?.[0])}
                />
              </div>
              {renderError(worldErrors.image)}

              <div className="rounded-2xl border border-transparent bg-input-bg p-4 transition-colors focus-within:border-primary">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 text-[10px] uppercase tracking-widest text-input-placeholder">
                      World name
                    </div>
                    <input
                      type="text"
                      value={worldName}
                      onChange={(event) => {
                        setWorldName(event.target.value);
                        setWorldErrors((currentErrors) => ({ ...currentErrors, name: undefined }));
                      }}
                      placeholder="Enter world name..."
                      className="w-full bg-transparent text-sm font-bold tracking-wider text-white outline-none placeholder:text-input-placeholder/50"
                    />
                  </div>
                  <Edit2 className="h-4 w-4 text-white/50" />
                </div>
                {renderError(worldErrors.name)}
              </div>

              <div className="flex h-40 flex-col rounded-2xl border border-transparent bg-input-bg p-4 transition-colors focus-within:border-primary">
                <div className="mb-2 flex items-start justify-between">
                  <div className="text-[10px] uppercase tracking-widest text-input-placeholder">
                    Description
                  </div>
                  <FileText className="h-4 w-4 text-white/50" />
                </div>
                <textarea
                  value={worldDescription}
                  onChange={(event) => setWorldDescription(event.target.value)}
                  placeholder="Enter description..."
                  className="w-full flex-1 resize-none bg-transparent text-xs leading-relaxed text-white/80 outline-none placeholder:text-input-placeholder/50"
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 md:border-l md:border-primary/20 md:pl-10">
              <h2 className="mb-2 text-2xl font-bold tracking-wider">Required attributes</h2>
              <div className="flex flex-col gap-4">
                {attributes.map((attribute) => (
                  <div key={attribute.id} className="grid gap-3 md:grid-cols-[1fr_9rem_2.75rem]">
                    <div className="rounded-xl border border-transparent bg-input-bg p-4 transition-colors focus-within:border-primary">
                      <input
                        value={attribute.name}
                        onChange={(event) => {
                          updateAttribute(attribute.id, { name: event.target.value });
                          setWorldErrors((currentErrors) => ({
                            ...currentErrors,
                            attributeNames: {
                              ...currentErrors.attributeNames,
                              [attribute.id]: "",
                            },
                          }));
                        }}
                        className="h-5 w-full bg-transparent text-xs font-bold uppercase tracking-widest text-white/80 outline-none placeholder:text-input-placeholder/50"
                        placeholder="Attribute name"
                      />
                      {renderError(worldErrors.attributeNames?.[attribute.id])}
                    </div>

                    {isEditing ? (
                      <div className="flex h-13 items-center rounded-xl border border-primary/40 bg-primary/15 px-4 text-xs font-bold tracking-widest text-primary">
                        {attribute.type}
                      </div>
                    ) : (
                      <div className="relative h-13">
                        <button
                          type="button"
                          aria-expanded={openAttributeTypeId === attribute.id}
                          onClick={() =>
                            setOpenAttributeTypeId((currentId) =>
                              currentId === attribute.id ? null : attribute.id
                            )
                          }
                          className="flex h-13 w-full items-center justify-between rounded-xl border border-primary bg-primary px-4 text-xs font-bold tracking-widest text-white outline-none transition-colors hover:bg-primary/80"
                        >
                          {attribute.type}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              openAttributeTypeId === attribute.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {openAttributeTypeId === attribute.id && (
                          <div className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-primary/60 bg-background-site shadow-2xl">
                            {(["TEXT", "NUMBER"] as AttributeType[]).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  updateAttribute(attribute.id, { type });
                                  setOpenAttributeTypeId(null);
                                }}
                                className={`block h-11 w-full px-4 text-left text-xs font-bold tracking-widest transition-colors ${
                                  attribute.type === type
                                    ? "bg-primary text-white"
                                    : "text-white/80 hover:bg-primary/20 hover:text-white"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeAttribute(attribute.id)}
                      className="flex h-13 items-center justify-center rounded-xl border border-white/15 text-white/60 transition-colors hover:border-error hover:text-error"
                      aria-label="Delete attribute"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {renderError(worldErrors.attributes)}

                <button
                  type="button"
                  onClick={addAttribute}
                  className="mt-2 flex h-13 items-center justify-between rounded-xl border border-transparent bg-input-bg p-4 transition-colors hover:border-primary"
                >
                  <span className="text-xs uppercase tracking-widest text-white/50">
                    Add new attribute
                  </span>
                  <Plus className="h-5 w-5 text-white/50" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10 overflow-y-auto p-6 md:flex-row md:p-10">
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="mb-2 text-2xl font-bold tracking-wider">Edit channels</h2>

              <button
                type="button"
                onClick={addChannel}
                className="flex h-20 shrink-0 items-center justify-center gap-3 rounded-xl border border-primary/40 bg-input-bg transition-colors hover:border-primary"
              >
                <span className="text-sm uppercase tracking-widest">Add new channel</span>
                <Plus className="h-5 w-5" />
              </button>

              <div className="flex max-h-100 flex-col gap-3 overflow-y-auto pr-2">
                {channels.map((channel) => (
                  <div
                    role="button"
                    tabIndex={0}
                    draggable={channels.length > 1}
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannelId(channel.id);
                      setChannelErrors({});
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;

                      event.preventDefault();
                      setSelectedChannelId(channel.id);
                      setChannelErrors({});
                    }}
                    onDragStart={(event) => {
                      setDraggedChannelId(channel.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(channel.id));
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDragOverChannelId(channel.id);
                    }}
                    onDragLeave={() => {
                      setDragOverChannelId((currentId) =>
                        currentId === channel.id ? null : currentId
                      );
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const droppedChannelId =
                        draggedChannelId ?? Number(event.dataTransfer.getData("text/plain"));

                      if (Number.isFinite(droppedChannelId)) {
                        reorderChannel(droppedChannelId, channel.id);
                      }

                      setDraggedChannelId(null);
                      setDragOverChannelId(null);
                    }}
                    onDragEnd={() => {
                      setDraggedChannelId(null);
                      setDragOverChannelId(null);
                    }}
                    className={`group relative h-20 shrink-0 cursor-grab overflow-hidden rounded-xl border text-left transition-colors active:cursor-grabbing ${
                      channel.id === selectedChannel?.id
                        ? "border-primary"
                        : "border-primary/30 hover:border-primary/70"
                    } ${
                      dragOverChannelId === channel.id && draggedChannelId !== channel.id
                        ? "ring-2 ring-primary"
                        : ""
                    } ${draggedChannelId === channel.id ? "opacity-60" : ""}`}
                  >
                    <img
                      src={channel.image}
                      alt={channel.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src = bannerPool[0];
                      }}
                    />
                    <div className="absolute inset-0 bg-black/55 transition-colors group-hover:bg-black/35" />
                    <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center rounded-lg border border-white/20 bg-black/55 p-2 text-white/70">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                      <span className="text-lg font-bold uppercase tracking-widest drop-shadow-md">
                        {channel.name || "Untitled channel"}
                      </span>
                    </div>
                  </div>
                ))}
                {renderError(channelErrors.channels)}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-6 md:border-l md:border-primary/20 md:pl-10">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-wider">Channel</h2>
                <button
                  type="button"
                  onClick={deleteSelectedChannel}
                  className="flex items-center gap-2 rounded-xl bg-error px-4 py-2 text-white transition-colors hover:bg-error/80"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Delete channel
                  </span>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {selectedChannel && (
                <>
                  <div
                    className={`relative flex h-24 cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-dashed p-6 transition-colors ${
                      channelDragActive
                        ? "border-primary"
                        : "border-input-placeholder/50 hover:border-primary"
                    }`}
                    onClick={() => channelInputRef.current?.click()}
                    onDragLeave={() => setChannelDragActive(false)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setChannelDragActive(true);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setChannelDragActive(false);
                      handleChannelFile(event.dataTransfer.files[0]);
                    }}
                  >
                    <img
                      src={selectedChannel.image}
                      className="absolute inset-0 h-full w-full object-cover opacity-35 transition-opacity"
                      alt="Channel banner"
                      onError={(event) => {
                        event.currentTarget.src = bannerPool[0];
                      }}
                    />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="relative z-10">
                      <div className="mb-1 text-[10px] uppercase tracking-widest text-white/70">
                        Channel banner
                      </div>
                      <div className="text-sm font-bold tracking-wider">Drag and drop image</div>
                    </div>
                    <button
                      type="button"
                      className="relative z-10 flex items-center gap-3 rounded-xl border border-white/30 bg-black/40 px-4 py-2 text-xs transition-colors hover:border-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        channelInputRef.current?.click();
                      }}
                    >
                      Upload <Upload className="h-4 w-4" />
                    </button>
                    <input
                      ref={channelInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleChannelFile(event.target.files?.[0])}
                    />
                  </div>

                  <div className="rounded-2xl border border-transparent bg-input-bg p-4 transition-colors focus-within:border-primary">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-1 text-[10px] uppercase tracking-widest text-input-placeholder">
                          Channel name
                        </div>
                        <input
                          type="text"
                          value={selectedChannel.name}
                          onChange={(event) => {
                            updateSelectedChannel({ name: event.target.value });
                            setChannelErrors((currentErrors) => ({
                              ...currentErrors,
                              name: undefined,
                            }));
                          }}
                          className="w-full bg-transparent text-sm font-bold uppercase tracking-wider text-white outline-none placeholder:text-input-placeholder/50"
                          placeholder="Enter channel name..."
                        />
                      </div>
                      <Edit2 className="h-4 w-4 text-white/50" />
                    </div>
                    {renderError(channelErrors.name)}
                  </div>

                  <div className="flex h-32 flex-col rounded-2xl border border-transparent bg-input-bg p-4 transition-colors focus-within:border-primary">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="text-[10px] uppercase tracking-widest text-input-placeholder">
                        Short description
                      </div>
                      <FileText className="h-4 w-4 text-white/50" />
                    </div>
                    <textarea
                      value={selectedChannel.description}
                      onChange={(event) =>
                        updateSelectedChannel({ description: event.target.value })
                      }
                      className="w-full flex-1 resize-none bg-transparent text-xs leading-relaxed text-white/80 outline-none placeholder:text-input-placeholder/50"
                      placeholder="Enter short description..."
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-primary/30 bg-background-site p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={modal.close}
              className="flex items-center gap-3 rounded-xl border border-error/70 px-5 py-2.5 text-error transition-colors hover:bg-error/10"
            >
              <X className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Exit</span>
            </button>

            {activeModal === "channel" && (
              <button
                type="button"
                onClick={() => modal.open("world-modal")}
                className="flex items-center gap-3 rounded-xl border border-white/20 px-5 py-2.5 transition-colors hover:border-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to world</span>
              </button>
            )}
            {isEditing && activeModal === "world" && (
              <button
                type="button"
                onClick={deleteWorld}
                className={`flex items-center gap-3 rounded-xl border px-5 py-2.5 transition-colors ${
                  isConfirmingWorldDelete
                    ? "border-error bg-error text-white hover:bg-error/80"
                    : "border-error/70 text-error hover:bg-error/10"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isConfirmingWorldDelete ? "Confirm delete" : "Delete world"}
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 md:justify-end">
            {isEditing && activeModal === "world" && (
              <button
                type="button"
                onClick={() => modal.open("channel-modal")}
                className="flex items-center gap-3 rounded-xl border border-primary px-6 py-2.5 text-primary transition-colors hover:bg-primary/10"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Go to channels</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={saveCurrentStep}
              className="flex items-center gap-3 rounded-xl bg-primary px-8 py-2.5 text-white transition-colors hover:bg-primary/80"
            >
              <span className="text-xs font-bold uppercase tracking-widest">
                {activeModal === "world"
                  ? isEditing
                    ? "Save world"
                    : "Next step"
                  : isEditing
                    ? "Save channels"
                    : "Create world"}
              </span>
              {activeModal === "world" && !isEditing ? (
                <ArrowRight className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
