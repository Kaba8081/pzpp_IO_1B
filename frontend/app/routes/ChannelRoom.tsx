"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/Button";
import { UsersSidebar } from "@/components/UsersSidebar";
import { ChannelRoomMessage } from "@/components/ChannelRoomMessage";
import { SendHorizontal, Dices, User } from "lucide-react";
import type { WorldRoomMessage, WorldRoom } from "@/types/models";
import { WorldRoomManager } from "@/services/worldRoomManager";

export default function WorldRoomPage() {
  const { worldId, roomId } = useParams<{ worldId: string; roomId: string }>();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<WorldRoomMessage[]>([]);
  const [activeRoom, setActiveRoom] = useState<WorldRoom>();

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
          <h1 className="text-2xl tracking-widest text-white drop-shadow-[0_0_10px_rgba(6,140,124,0.8)]">
            {activeRoom?.name ?? "Channel"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-2">
            {messages.map((msg) => (
              <ChannelRoomMessage
                key={msg.id}
                message={msg}
                author={undefined}
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
            className="w-full h-20 border-primary rounded-2xl border-2 p-4 tracking-widest text-white/90 focus:outline-none focus:border-primary resize-none mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          />

          <div className="flex flex-col xl:flex-row lg:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex justify-center items-center gap-2"
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
    </>
  );
}
