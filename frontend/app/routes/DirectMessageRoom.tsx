"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { SendHorizontal, ArrowLeft } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { getDMThreadMessages, createDMMessage, connectDMChannel, markDMRead } from "@/services/dm";
import type { DirectMessage, DirectMessageThread, ProfilePopupData } from "@/types/models";
import { apiRequest } from "@/api/apiRequest";
import { UserProfileModal } from "@/components/modals/UserProfileModal";

function getDMThread(threadId: number): Promise<DirectMessageThread> {
  return apiRequest<DirectMessageThread>(`/api/dm/thread/${threadId}/`, {
    method: "GET",
    requiresAuth: true,
  });
}

export default function DirectMessageRoom() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, modal, setUnreadDM } = useUserStore();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [thread, setThread] = useState<DirectMessageThread | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [viewingProfile, setViewingProfile] = useState<ProfilePopupData | null>(null);

  useEffect(() => {
    if (!threadId) return;
    const id = parseInt(threadId);
    let isMounted = true;

    Promise.all([getDMThread(id), getDMThreadMessages(id)])
      .then(([threadData, msgData]) => {
        if (!isMounted) return;
        setThread(threadData);
        setMessages(msgData.results);
      })
      .catch(console.error);

    markDMRead(id)
      .then(() => setUnreadDM(id, false))
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [threadId, setUnreadDM]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!threadId) return;
    const id = parseInt(threadId);
    const channel = connectDMChannel(id);
    const unsub = channel.subscribe("dm.message.created", (e) => {
      setMessages((prev) =>
        prev.some((m) => m.id === e.message.id) ? prev : [...prev, e.message]
      );
      // User is actively viewing this thread — mark it read immediately.
      markDMRead(id)
        .then(() => setUnreadDM(id, false))
        .catch(() => {});
    });
    return unsub;
  }, [threadId, setUnreadDM]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    if (!isLoggedIn) {
      modal.open("login");
      return;
    }
    if (!threadId) return;

    setIsSending(true);
    createDMMessage(parseInt(threadId), messageText.trim())
      .then(() => setMessageText(""))
      .catch(console.error)
      .finally(() => setIsSending(false));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherUser = thread?.other_user;

  return (
    <div className="flex-1 flex flex-col min-w-0 border border-primary rounded-2xl bg-background relative m-2 sm:m-4 lg:ml-0">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-primary shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-input-placeholder hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={() => {
            if (otherUser) {
              setViewingProfile({
                id: otherUser.id,
                name: otherUser.username,
                description: null,
                avatar: otherUser.avatar,
                user_id: otherUser.id,
              });
            }
          }}
          disabled={!otherUser}
        >
          {otherUser?.avatar ? (
            <img
              src={otherUser.avatar}
              alt={otherUser.username}
              className="w-10 h-10 rounded-full object-cover border border-primary/50 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 select-none">
              {(otherUser?.username ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="text-left">
            <div className="text-white font-medium">{otherUser?.username ?? "Direct Message"}</div>
            <div className="text-input-placeholder text-xs">Direct Message</div>
          </div>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-4">
          {messages.map((msg) => (
            <DMMessage
              key={msg.id}
              message={msg}
              onAuthorClick={(profile) => setViewingProfile(profile)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="max-w-full flex flex-col p-4 sm:p-6 border-t border-primary">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="YOUR MESSAGE"
          className="w-full h-20 border-primary rounded-2xl border-2 p-4 text-white/90 focus:outline-none focus:border-primary resize-none mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          disabled={isSending}
        />
        <div className="flex flex-row text-sm gap-3 w-full">
          <Button
            variant="outline"
            className="w-full sm:w-auto flex justify-center items-center gap-2"
            onClick={handleSend}
            disabled={isSending}
          >
            SEND MESSAGE
            <SendHorizontal size={20} className="text-primary" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {viewingProfile && (
        <UserProfileModal profile={viewingProfile} onClose={() => setViewingProfile(null)} />
      )}
    </div>
  );
}

function DMMessage({
  message,
  onAuthorClick,
}: {
  message: DirectMessage;
  onAuthorClick: (profile: ProfilePopupData) => void;
}) {
  const { user } = useUserStore();
  const isOwn = message.sender === user?.id;
  const sender = message.sender_info;
  const avatar = sender?.avatar;
  const username = sender?.username ?? "Unknown";

  const handleAuthorClick = () => {
    onAuthorClick({
      id: message.sender,
      name: username,
      description: null,
      avatar: avatar ?? null,
      user_id: message.sender,
    });
  };

  return (
    <div className={`flex gap-4 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <button type="button" onClick={handleAuthorClick} className="shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary select-none hover:opacity-80 transition-opacity">
            {username.slice(0, 1).toUpperCase()}
          </div>
        )}
      </button>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <button
          type="button"
          onClick={handleAuthorClick}
          className="text-primary text-sm mb-1 hover:underline text-left"
        >
          {username}
        </button>
        <div
          className={`px-4 py-2 rounded-2xl text-white text-sm ${
            isOwn ? "bg-primary/20 rounded-tr-sm" : "bg-white/5 rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
