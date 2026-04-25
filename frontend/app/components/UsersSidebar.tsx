import type { UserProfile } from "@/types/models";
import WorldProfileSelector from "./WorldProfileSelector";

interface UsersSidebarProps {
  masterOfGame?: UserProfile;
  characters?: UserProfile[];
}

export const UsersSidebar = ({ masterOfGame, characters }: UsersSidebarProps) => {
  const renderUser = (user: UserProfile) => {
    const displayName = user.username || "Unknown Wanderer";
    const avatar = user.profile_picture || "https://via.placeholder.com/100";

    return (
      <div key={user.id} className="flex items-center gap-4 cursor-pointer group">
        <img
          src={avatar}
          alt={`Avatar of ${displayName}`}
          className="w-10 h-10 rounded-full object-cover border border-background transition-all shrink-0"
        />
        <span className="text-white transition-colors truncate">{displayName}</span>
      </div>
    );
  };

  return (
    <aside className="text-primary w-[calc(100vw-1.5rem)] md:w-18rem lg:w-3xs xl:w-2xs h-full bg-background border border-primary rounded-2xl flex flex-col gap-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="p-6 md:p-8">
        {/* MASTER OF GAME */}
        {masterOfGame && (
          <div className="flex flex-col gap-4">
            <h3>Master of Game</h3>
            <span>{renderUser(masterOfGame)}</span>
          </div>
        )}

        {/* Characters */}
        {characters && (
          <div className="flex flex-col gap-6">
            <h3>
              Number of <br /> Characters #{characters.length}
            </h3>

            <div className="flex flex-col gap-5">{characters.map((char) => renderUser(char))}</div>
          </div>
        )}
      </div>

      {/* World profile section */}
      <div className="mt-auto mb-6 md:mb-8">
        <WorldProfileSelector />
      </div>
    </aside>
  );
};
