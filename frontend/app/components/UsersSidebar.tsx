import type { UserProfile } from '@/types/models'; 

interface UsersSidebarProps {
  masterOfGame?: UserProfile;
  characters?: UserProfile[];
}

export const UsersSidebar = ({ masterOfGame, characters }: UsersSidebarProps) => {
  const currentMaster: UserProfile = masterOfGame || {
    id: 1,
    user_id: 101,
    username: "DungeonMaster69",
    description: null,
    profile_picture: null,
  };

  const currentCharacters: UserProfile[] = characters || [
    { id: 2, user_id: 102, username: "Character1", description: null, profile_picture: null },
    { id: 3, user_id: 103, username: "Character2", description: null, profile_picture: null },
  ];

  const renderUser = (user: UserProfile) => {
    const displayName = user.username || "Unknown Wanderer";
    const avatar = user.profile_picture || "https://via.placeholder.com/100";

    return (
      <div key={user.id} className="flex items-center gap-4 cursor-pointer group">
        <img 
          src={avatar} 
          alt={`Avatar of ${displayName}`}
          className="w-10 h-10 rounded-full object-cover border border-[#068C7C]/50 transition-all shrink-0"
        />
        <span className="font-cinzel text-white text-[10px] md:text-xs uppercase tracking-widest transition-colors truncate">
          {displayName}
        </span>
      </div>
    );
  };

  return (
    <aside className=" text-[#068C7C] w-[180px] lg:w-[230px] xl:w-[280px] h-full bg-[#040d0d] border border-[#068C7C] rounded-2xl p-6 md:p-8 flex flex-col gap-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/*MASTER OF GAME*/}
      <div className="flex flex-col gap-4">
        <h3 className="font-cinzel text-[clamp(16px,2vw,18px)] uppercase tracking-widest">
          Master of Game
        </h3>
        <span className="text-[clamp(8px,1vw,10px)]">{renderUser(currentMaster)}</span>
      </div>

      {/*Characters*/}
      <div className="flex flex-col gap-6">
        <h3 className="font-cinzel text-[clamp(16px,2vw,18px)] uppercase tracking-widest leading-relaxed">
          Number of <br /> Characters #{currentCharacters.length}
        </h3>
        
        <div className="flex flex-col gap-5 text-[clamp(8px,1vw,10px)]">
            {currentCharacters.map((char) => renderUser(char))}
        </div>
      </div>

    </aside>
  );
};