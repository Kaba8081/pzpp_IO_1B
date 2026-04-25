"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/Button";
import { UsersSidebar } from "@/components/UsersSidebar";
import { ChannelRoomMessage } from "@/components/ChannelRoomMessage";
import { CharacterModal } from "@/components/modals/CharaterModal";
import { SendHorizontal, Dices, User } from "lucide-react";
import type { WorldRoom, WorldRoomMessageWithAuthor } from "@/types/models";
import { WorldRoomManager } from "@/services/worldRoomManager";
import { useUserStore } from "@/stores/UserStore";
import { createChannelMessage } from "@/services/worldRoom/createChannelMessage.service";

export default function WorldRoomPage() {
  const { activeProfile } = useUserStore();
  const { worldId, roomId } = useParams<{ worldId: string; roomId: string }>();
  const { modal, currentModal } = useUserStore();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<WorldRoomMessageWithAuthor[]>([]);
  const [activeRoom, setActiveRoom] = useState<WorldRoom>();
  const [isSendingMessage, setSendingMessage] = useState<boolean>(false);

  const isInputDisabled = useMemo(
    () => isSendingMessage || !activeProfile,
    [isSendingMessage, activeProfile]
  );

  // Fetch activeRoom + it's messages
  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;
    const parsedRoomId = parseInt(roomId);

    const fetchRoomData = async () => {
      try {
        const [room, roomMessages] = await Promise.all([
          WorldRoomManager.getChannel(parsedRoomId),
          WorldRoomManager.getChannelMessages(parsedRoomId),
        ]);

        if (!isMounted) return;

        setActiveRoom(room);
        setMessages(roomMessages.results);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoomData();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!messageText || messageText.length === 0) return;
    if (!roomId || !activeProfile) return;
    setSendingMessage(true);

    createChannelMessage(parseInt(roomId), {
      user_profile: activeProfile?.id,
      content: messageText,
    })
      .catch(console.error)
      .finally(() => {
        setSendingMessage(false);
        setMessageText("");
      });
  };

  if (!worldId) {
    return <div>Invalid world ID</div>;
  }
  if (!roomId) {
    return <div>Invalid room ID</div>;
  }

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 border border-primary rounded-2xl bg-background relative m-4 ml-0 mr-2">
        <div className="relative m-5 h-1/4 shrink-0 overflow-hidden rounded-2xl bg-background-site flex items-center justify-center">
          <h1 className="text-2xl text-white drop-shadow-[0_0_10px_rgba(6,140,124,0.8)]">
            {activeRoom?.name ?? "Channel"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-2">
            {messages.map((msg) => (
              <ChannelRoomMessage
                key={msg.id}
                message={msg}
                author={msg.author}
                GameMaster={false}
              />
            ))}
          </div>
        </div>

        <div className="max-w-full flex flex-col p-6 border-t border-primary">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="YOUR MESSAGE"
            className="w-full h-20 border-primary rounded-2xl border-2 p-4 text-white/90 focus:outline-none focus:border-primary resize-none mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            disabled={isInputDisabled}
          />

          <div className="flex flex-col xl:flex-row lg:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex justify-center items-center gap-2"
              onClick={handleSendMessage}
            >
              SEND MESSAGE
              <SendHorizontal size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto flex justify-center items-center gap-2"
            >
              ROLL A DICE
              <Dices size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto flex justify-center items-center gap-2"
              onClick={() => modal.open("create-character")}
            >
              CREATE CHARACTER
              <User size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      <div className="shrink-0 transition-all duration-300 m-4 mr-4 ml-2">
        <UsersSidebar masterOfGame={undefined} characters={undefined} />
      </div>

      {currentModal === "create-character" && (
        <CharacterModal mode="create" worldId={worldId ? parseInt(worldId) : undefined} />
      )}
    </>
  );
}
