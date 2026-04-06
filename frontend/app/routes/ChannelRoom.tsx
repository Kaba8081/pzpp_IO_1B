import React, { useState } from 'react';
import { useParams } from 'react-router';
import { UsersSidebar } from '@/components/UsersSidebar';
import { ChannelRoomMessage } from '@/components/ChannelRoomMessage';
import { Button } from '@/components/Button';
import { SendHorizontal, Dices, User } from 'lucide-react';


export default function WorldRoomPage() {

  const { worldId } = useParams();

  const currentUser = { id: 1, user_id: 1, username: "Eldrin the Wise", profile_picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eldrin", description: null };
  
  const worldData = {
    id: Number(worldId) || 1,
    name: "Forest Kingdom",
    owner_id: 1,
    bannerImg: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop"
  };

  const isMasterOfGame = currentUser.user_id === worldData.owner_id;

  const mockPlayers = [
    { id: 2, user_id: 2, username: "Kaelen", profile_picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kaelen", description: null },
    { id: 3, user_id: 3, username: "Lyra", profile_picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lyra", description: null }
  ];

  const mockMessages = [
    { id: 101, content: "The ancient forest stands quiet today. What are your actions?", room_id: 1, user_profile_id: 1, status: 'accepted', created_at: null, updated_at: null, deleted_at: null },
    { id: 102, content: "I carefully examine the tracks near the riverbank.", room_id: 1, user_profile_id: 2, status: 'pending', created_at: null, updated_at: null, deleted_at: null }
  ];

  const mockActions = [
    { id: 201, message_id: 102, attribute_id: 1, user_profile_id: 2, value: "6", created_at: null, updated_at: null, deleted_at: null }
  ];

  const [messageText, setMessageText] = useState("");

  return (
    <div className="flex w-full h-screen bg-background-site text-white p-4 gap-6 font-cinzel">
      
      <div className="flex-1 flex flex-col min-w-0 border border-primary rounded-2xl bg-background relative">
        
        <div className="relative m-5 h-1/4 shrink-0 overflow-hidden rounded-2xl">
          <img 
            src={worldData.bannerImg} 
            alt={worldData.name} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-2xl uppercase tracking-[0.3em] text-white drop-shadow-[0_0_10px_rgba(6,140,124,0.8)]">
              {worldData.name}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-x-hidden p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {mockMessages.map((msg, index) => {
            const author = msg.user_profile_id === currentUser.id 
              ? currentUser 
              : mockPlayers.find(p => p.id === msg.user_profile_id)!;

            return (
              <React.Fragment key={msg.id}>
                <ChannelRoomMessage 
                  message={msg} 
                  author={author} 
                  GameMaster={isMasterOfGame} 
                />
                
                {index === 0 && mockActions.length > 0 && (
                  <div className="flex justify-center my-8">
                    <div className="border border-primary border-2 rounded-2xl px-6 py-2 bg-button-background">
                      <span className="font-cinzel text-white text-xs uppercase tracking-widest">
                        {mockActions.map((action, actionIndex) => {
                          const user = [currentUser, ...mockPlayers].find(u => u.id === action.user_profile_id);
                          const nickname = user ? user.username : 'Unknown';
                          const actionvalue = action.value;
                          return actionIndex === 0 ? `${nickname} rolled ${actionvalue}` : `, ${nickname} rolled ${actionvalue}`;
                        }).join('')}
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="max-w-full flex flex-col p-6 ">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="YOUR MESSAGE"
            className="w-full h-full border border-primary rounded-2xl border-2 p-4 text-xs tracking-widest uppercase text-white/90 focus:outline-none focus:border-primary resize-none mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          />
          
          <div className="flex flex-col xl:flex-row lg:flex-row gap-3 w-full">
            <Button variant="outline" className="w-full sm:w-auto text-xs flex justify-center items-center gap-2">
              SEND MESSAGE
              <SendHorizontal size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
            <Button variant="outline" className="w-full sm:w-auto text-xs flex justify-center items-center gap-2">
              ROLL A DICE
              <Dices size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
            <Button variant="outline" className="w-full sm:w-auto text-xs flex justify-center items-center gap-2">
              CREATE CHARACTER
              <User size={20} className="text-primary" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

      </div>

      <div className="shrink-0 transition-all duration-300">
        <UsersSidebar 
          masterOfGame={currentUser}
          characters={mockPlayers}
        />
      </div>

    </div>
  );
};