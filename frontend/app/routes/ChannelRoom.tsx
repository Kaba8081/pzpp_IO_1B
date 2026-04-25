import React, { useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/Button";
import { Sidebar, type SidebarWorldData } from "@/components/Sidebar";
import { UsersSidebar } from "@/components/UsersSidebar";
import { ChannelRoomMessage } from "@/components/ChannelRoomMessage";
import { SendHorizontal, Dices, User } from "lucide-react";
import type { WorldRoomMessage, UserProfile } from "@/types/models";

export default function WorldRoomPage() {
  const { worldId, roomId } = useParams<{ worldId: string; roomId?: string }>();
  const [messageText, setMessageText] = useState("");

  if (!worldId) {
    return <div>Invalid world ID</div>;
  }

  // Mock data
  const mockMasterProfile: UserProfile = {
    id: 1,
    user_id: 1,
    username: "Archmage Eldris",
    description: "Master of the mystical arts",
    profile_picture: null,
  };

  const mockCharacters: UserProfile[] = [
    {
      id: 2,
      user_id: 2,
      username: "Kael the Brave",
      description: "Noble Knight",
      profile_picture: null,
    },
    {
      id: 3,
      user_id: 3,
      username: "Lyra Shadowstep",
      description: "Cunning Rogue",
      profile_picture: null,
    },
    {
      id: 4,
      user_id: 4,
      username: "Thorgrim Ironforge",
      description: "Stalwart Dwarf",
      profile_picture: null,
    },
  ];

  const mockMessages: (WorldRoomMessage & { author: UserProfile })[] = [
    {
      id: 1,
      user_profile_id: 2,
      room_id: parseInt(roomId || "1"),
      content:
        "I draw my sword and prepare to face the shadows ahead. What lies beyond this ancient gate?",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: null,
      deleted_at: null,
      author: mockCharacters[0],
    },
    {
      id: 2,
      user_profile_id: 3,
      room_id: parseInt(roomId || "1"),
      content: "The torches flicker. I think I see movement in the darkness... *readies daggers*",
      created_at: new Date(Date.now() - 1800000).toISOString(),
      updated_at: null,
      deleted_at: null,
      author: mockCharacters[1],
    },
    {
      id: 3,
      user_profile_id: 4,
      room_id: parseInt(roomId || "1"),
      content:
        "Aye, I feel it too. Whatever dwells here, it be ancient and powerful. Stick together, ye fools!",
      created_at: new Date(Date.now() - 900000).toISOString(),
      updated_at: null,
      deleted_at: null,
      author: mockCharacters[2],
    },
  ];

  const mockWorlds: SidebarWorldData[] = [
    {
      world: {
        id: parseInt(worldId),
        name: `The Chronicles of World ${worldId}`,
        description: null,
        owner_id: 0,
        profile_picture: null,
        distinct_user_count: 0,
        total_user_profiles_count: 0,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      },
      rooms: [
        {
          id: 1,
          world_id: parseInt(worldId),
          name: "The Forgotten Dungeon",
          thumbnail: null,
          description: null,
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          id: 2,
          world_id: parseInt(worldId),
          name: "Tavern of Whispers",
          thumbnail: null,
          description: null,
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
        {
          id: 3,
          world_id: parseInt(worldId),
          name: "Sacred Temple",
          thumbnail: null,
          description: null,
          created_at: null,
          updated_at: null,
          deleted_at: null,
        },
      ],
      defaultOpen: true,
      activeRoomId: parseInt(roomId || "1"),
    },
  ];

  return (
    <div className="flex w-full h-screen bg-background-site">
      {/* Left Sidebar */}
      <Sidebar worlds={mockWorlds} isHomeActive={false} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 border border-primary rounded-2xl bg-background relative m-4 ml-4 mr-2">
        <div className="relative m-5 h-1/4 shrink-0 overflow-hidden rounded-2xl bg-background-site flex items-center justify-center">
          <h1 className="text-2xl">
            {mockWorlds[0].rooms.find((r) => r.id === parseInt(roomId || "1"))?.name || "Channel"}
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-2">
            {mockMessages.map((msg) => (
              <ChannelRoomMessage
                key={msg.id}
                message={msg}
                author={msg.author}
                GameMaster={false}
              />
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-full flex flex-col p-6 border-t border-primary">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="YOUR MESSAGE"
            className="w-full h-20 border-primary rounded-2xl border-2 p-4 tracking-widest focus:outline-none focus:border-primary resize-none mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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

      {/* Right Sidebar - Players */}
      <div className="shrink-0 transition-all duration-300 m-4 mr-4 ml-2">
        <UsersSidebar masterOfGame={mockMasterProfile} characters={mockCharacters} />
      </div>
    </div>
  );
}
