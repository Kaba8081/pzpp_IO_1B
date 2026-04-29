"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useOutletContext, useParams } from "react-router";
import { Button } from "@/components/ui/Button";
import { UsersSidebar } from "@/components/UsersSidebar";
import { ChannelRoomMessage } from "@/components/ChannelRoomMessage";
import { CharacterModal } from "@/components/modals/CharaterModal";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { SendHorizontal, Dices, PanelRightOpen, X, Paperclip } from "lucide-react";
import type {
  WorldRoom,
  WorldRoomMessageWithAuthor,
  WorldMember,
  ProfilePopupData,
} from "@/types/models";
import { WorldRoomManager } from "@/services/worldRoomManager";
import { useUserStore } from "@/stores/UserStore";
import { createChannelMessage } from "@/services/worldRoom/createChannelMessage.service";
import { createChannelMediaMessage } from "@/services/worldRoom/createChannelMediaMessage.service";
import { deleteChannelMessage } from "@/services/worldRoom/deleteChannelMessage.service";
import type { AppLayoutOutletContext } from "../AppLayout";
import { connectWorldRoomChannel } from "@/services/worldRoom/worldRoomChannel";
import { markRoomRead } from "@/services/worldRoom/markRoomRead.service";
import { getWorldMembers } from "@/services/worldUserProfile/getWorldMembers.service";
import { connectWorldEventsChannel } from "@/services/worldUserProfile/worldEventsChannel";

const PAGE_SIZE = 50;

export default function WorldRoomPage() {
  const {
    activeProfile,
    currentModal,
    isLoggedIn,
    modal,
    setUnreadRoom,
    user,
    permissionsByWorld,
  } = useUserStore();
  const { worldId, roomId } = useParams<{ worldId: string; roomId: string }>();
  const parsedRoomId = roomId ? parseInt(roomId) : undefined;
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<WorldRoomMessageWithAuthor[]>([]);
  const [activeRoom, setActiveRoom] = useState<WorldRoom>();
  const [isSendingMessage, setSendingMessage] = useState<boolean>(false);
  const [members, setMembers] = useState<WorldMember[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfilePopupData | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isPrependingRef = useRef(false);
  const isDeletingRef = useRef(false);
  const { mobileSidebar, setMobileSidebar, closeMobileSidebar } =
    useOutletContext<AppLayoutOutletContext>();
  const isUsersSidebarOpen = mobileSidebar === "right";

  const isInputDisabled = isSendingMessage;

  // Fetch activeRoom + its messages, starting from the most recent page
  useEffect(() => {
    if (!parsedRoomId) return;

    let isMounted = true;

    setMessages([]);
    setPage(1);
    setHasMore(false);
    setIsLoadingMore(false);

    const fetchRoomData = async () => {
      try {
        const [room, firstPageData] = await Promise.all([
          WorldRoomManager.getChannel(parsedRoomId),
          WorldRoomManager.getChannelMessages(parsedRoomId, { page: 1, page_size: PAGE_SIZE }),
        ]);

        if (!isMounted) return;
        setActiveRoom(room);

        if (!firstPageData.next) {
          setMessages(firstPageData.results);
          setPage(1);
          setHasMore(false);
        } else {
          const totalPages = Math.ceil(firstPageData.count / PAGE_SIZE);
          const lastPageData = await WorldRoomManager.getChannelMessages(parsedRoomId, {
            page: totalPages,
            page_size: PAGE_SIZE,
          });
          if (!isMounted) return;
          setMessages(lastPageData.results);
          setPage(totalPages);
          setHasMore(totalPages > 1);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoomData();

    if (isLoggedIn) {
      markRoomRead(parsedRoomId)
        .then(() => setUnreadRoom(parsedRoomId, false))
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [parsedRoomId, setUnreadRoom, isLoggedIn]);

  // Fetch world members
  useEffect(() => {
    if (!worldId || !isLoggedIn) {
      setMembers([]);
      return;
    }
    let isMounted = true;
    getWorldMembers(parseInt(worldId))
      .then((m) => {
        if (isMounted) setMembers(m);
      })
      .catch(() => {
        if (isMounted) setMembers([]);
      });
    return () => {
      isMounted = false;
    };
  }, [worldId, isLoggedIn]);

  // Scroll to bottom on message updates, but skip when prepending older messages or deleting
  useEffect(() => {
    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      return;
    }
    if (isDeletingRef.current) {
      isDeletingRef.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load one page of older messages and preserve scroll position
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore || page <= 1 || !parsedRoomId) return;

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    setIsLoadingMore(true);
    try {
      const data = await WorldRoomManager.getChannelMessages(parsedRoomId, {
        page: page - 1,
        page_size: PAGE_SIZE,
      });

      isPrependingRef.current = true;
      setMessages((prev) => [...data.results, ...prev]);
      setPage((p) => p - 1);
      setHasMore(page - 1 > 1);

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, parsedRoomId]);

  // Observe top sentinel to trigger loading older messages
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadOlderMessages();
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadOlderMessages]);

  // Subscribe to live messages via WebSocket
  useEffect(() => {
    if (!parsedRoomId) return;

    const channel = connectWorldRoomChannel(parsedRoomId);
    const unsubCreated = channel.subscribe("room.message.created", (e) => {
      setMessages((prev) =>
        prev.some((m) => m.id === e.message.id) ? prev : [...prev, e.message]
      );
      // User is actively viewing this room — mark it read immediately.
      if (isLoggedIn) {
        markRoomRead(parsedRoomId)
          .then(() => setUnreadRoom(parsedRoomId, false))
          .catch(() => {});
      }
    });
    const unsubDeleted = channel.subscribe("room.message.deleted", (e) => {
      isDeletingRef.current = true;
      setMessages((prev) => prev.filter((m) => m.id !== e.message_id));
    });

    return () => {
      unsubCreated();
      unsubDeleted();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedRoomId, setUnreadRoom]);

  // Subscribe to world events (new characters + system messages) via WebSocket
  useEffect(() => {
    if (!worldId || !isLoggedIn) return;

    const channel = connectWorldEventsChannel(parseInt(worldId));
    const unsubProfile = channel.subscribe("world.profile.created", (e) => {
      setMembers((prev) => (prev.some((m) => m.id === e.profile.id) ? prev : [...prev, e.profile]));
    });
    const unsubSystem = channel.subscribe("world.system.message", (e) => {
      if (e.message.room !== parsedRoomId) return;
      setMessages((prev) =>
        prev.some((m) => m.id === e.message.id) ? prev : [...prev, e.message]
      );
    });

    return () => {
      unsubProfile();
      unsubSystem();
    };
  }, [worldId, isLoggedIn, parsedRoomId]);

  const handleSendMessage = async () => {
    // For media messages
    if (selectedMedia) {
      if (!isLoggedIn) {
        modal.open("login");
        return;
      }
      if (!activeProfile) {
        modal.open("create-character");
        return;
      }
      if (!roomId) return;

      setSendingMessage(true);
      try {
        await createChannelMediaMessage(parseInt(roomId), {
          user_profile: activeProfile.id,
          file: selectedMedia,
          media_type: mediaType!,
        });
        setSelectedMedia(null);
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Failed to send media message:", error);
      } finally {
        setSendingMessage(false);
      }
      return;
    }

    // For text messages
    if (!messageText || messageText.length === 0) return;
    if (!isLoggedIn) {
      modal.open("login");
      return;
    }
    if (!activeProfile) {
      modal.open("create-character");
      return;
    }
    if (!roomId) return;
    setSendingMessage(true);

    createChannelMessage(parseInt(roomId), {
      user_profile: activeProfile?.id,
      content: messageText,
    })
      .then(() => setMessageText(""))
      .catch(console.error)
      .finally(() => {
        setSendingMessage(false);
        setTimeout(() => textareaRef.current?.focus(), 0);
      });
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error("File size exceeds 50MB limit");
      return;
    }

    // Determine media type
    let type: "image" | "video" | null = null;
    if (file.type.startsWith("image/")) {
      type = "image";
    } else if (file.type.startsWith("video/")) {
      type = "video";
    } else {
      console.error("Invalid file type. Only images and videos are supported.");
      return;
    }

    setSelectedMedia(file);
    setMediaType(type);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearMediaSelection = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canManageMessages = worldId
    ? (permissionsByWorld[parseInt(worldId)] ?? []).includes("manage_messages")
    : false;

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteChannelMessage(messageId);
      isDeletingRef.current = true;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMemberClick = (member: WorldMember) => {
    setSelectedProfile({
      id: member.id,
      name: member.name,
      description: member.description,
      avatar: member.avatar,
      user_id: member.user_id,
    });
    modal.open("view-character");
  };

  const handleAuthorClick = (
    author: Pick<WorldRoomMessageWithAuthor["author"], "id" | "name" | "avatar" | "user_id">
  ) => {
    setSelectedProfile({
      id: author.id,
      name: author.name,
      avatar: author.avatar,
      user_id: author.user_id,
    });
    modal.open("view-character");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!worldId) {
    return <div>Invalid world ID</div>;
  }
  if (!roomId) {
    return <div>Invalid room ID</div>;
  }

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 border border-primary rounded-2xl bg-background relative m-2 sm:m-4 lg:ml-0 lg:mr-2">
        <button
          type="button"
          onClick={() =>
            setMobileSidebar((openSidebar) => (openSidebar === "right" ? null : "right"))
          }
          aria-label={isUsersSidebarOpen ? "Close users sidebar" : "Open users sidebar"}
          aria-expanded={isUsersSidebarOpen}
          className="fixed right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-primary bg-background text-primary shadow-xl lg:hidden"
        >
          {isUsersSidebarOpen ? <X className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
        </button>

        <div className="relative m-3 h-36 shrink-0 overflow-hidden rounded-2xl bg-background-site flex items-center justify-center sm:m-5 sm:h-1/4">
          {activeRoom?.thumbnail && (
            <img
              src={activeRoom.thumbnail}
              alt={activeRoom.name ?? "Channel"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div
            className={`relative z-10 rounded-lg px-4 py-1 ${activeRoom?.thumbnail ? "bg-black/40 backdrop-blur-sm" : ""}`}
          >
            <h1 className={`text-2xl ${activeRoom?.thumbnail ? "text-white" : ""}`}>
              {activeRoom?.name ?? "Channel"}
            </h1>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="space-y-2">
            <div ref={topSentinelRef} />
            {isLoadingMore && (
              <div className="flex justify-center py-2 text-xs text-input-placeholder">
                Loading...
              </div>
            )}
            {messages.map((msg) => (
              <ChannelRoomMessage
                key={msg.id}
                message={msg}
                author={msg.author}
                GameMaster={false}
                canDelete={isLoggedIn && (msg.author?.user_id === user?.id || canManageMessages)}
                onAuthorClick={handleAuthorClick}
                onDelete={handleDeleteMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="max-w-full flex flex-col p-4 sm:p-6 border-t-2 border-primary">
          {mediaPreview && (
            <div className="mb-4 relative">
              <div className="rounded-lg overflow-hidden border border-primary/50 bg-background-site max-w-xs">
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Media preview"
                    className="max-h-48 max-w-xs object-cover"
                  />
                ) : (
                  <video src={mediaPreview} className="max-h-48 max-w-xs object-cover" />
                )}
              </div>
              <button
                onClick={clearMediaSelection}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                aria-label="Remove media"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeProfile
                ? "YOUR MESSAGE"
                : "SELECT OR CREATE A CHARACTER IN ORDER TO SEND MESSAGES"
            }
            className="w-full h-20 border-primary rounded-2xl border-2 p-4 text-white/90 focus:outline-none focus:border-primary resize-none mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            disabled={isInputDisabled}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaSelect}
            className="hidden"
            aria-label="Attach media file"
          />

          <div className="flex flex-row text-sm gap-3 w-full">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex justify-center items-center gap-2"
              onClick={handleSendMessage}
              disabled={isInputDisabled || (!messageText && !selectedMedia)}
            >
              SEND MESSAGE
              <SendHorizontal size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              className="flex justify-center items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isInputDisabled}
              title="Attach media (image or video)"
            >
              <Paperclip size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
            <Button variant="outline" className="flex justify-center items-center gap-2">
              <span className="hidden md:block">ROLL A DICE</span>
              <Dices size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {isUsersSidebarOpen && (
        <button
          type="button"
          aria-label="Close users sidebar overlay"
          className="fixed inset-0 z-30 bg-background-site/75 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-40 h-dvh p-3 transition-transform duration-300 lg:static lg:z-auto lg:h-auto lg:p-0 lg:transition-all lg:translate-x-0 lg:shrink-0 lg:m-4 lg:mr-4 lg:ml-2 ${
          isUsersSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <UsersSidebar members={members} onMemberClick={handleMemberClick} />
      </div>

      {currentModal === "create-character" && (
        <CharacterModal mode="create" worldId={worldId ? parseInt(worldId) : undefined} />
      )}
      {activeProfile && currentModal === "edit-character" && (
        <CharacterModal
          mode="edit"
          worldId={worldId ? parseInt(worldId) : undefined}
          profileId={activeProfile.id}
        />
      )}
      {selectedProfile && currentModal === "view-character" && (
        <CharacterModal
          mode="display"
          worldId={worldId ? parseInt(worldId) : undefined}
          profileId={selectedProfile.id}
        />
      )}

      {selectedProfile && currentModal === "view-profile" && (
        <UserProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          worldId={worldId ? parseInt(worldId) : undefined}
        />
      )}
    </>
  );
}
