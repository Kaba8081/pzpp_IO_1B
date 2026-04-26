import WorldProfileSelector from "./WorldProfileSelector";
import type { WorldMember } from "@/types/models";

interface UsersSidebarProps {
  members: WorldMember[];
  onMemberClick: (member: WorldMember) => void;
}

export const UsersSidebar = ({ members, onMemberClick }: UsersSidebarProps) => {
  const renderMember = (member: WorldMember) => (
    <button
      key={member.id}
      type="button"
      onClick={() => onMemberClick(member)}
      className="flex items-center gap-4 cursor-pointer group w-full text-left rounded-xl px-2 py-1.5 hover:bg-primary/10 transition-colors"
    >
      {member.avatar ? (
        <img
          src={member.avatar}
          alt={member.name}
          className="w-10 h-10 rounded-full object-cover border border-background shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 select-none">
          {member.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <span className="text-white truncate">{member.name}</span>
    </button>
  );

  return (
    <aside className="text-primary w-[calc(100vw-1.5rem)] md:w-[18rem] lg:w-3xs xl:w-2xs h-full bg-background border border-primary rounded-2xl flex flex-col gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="p-6 md:p-8 flex-1">
        {members.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="mb-2">
              Members{" "}
              <span className="text-input-placeholder text-sm font-normal">#{members.length}</span>
            </h3>
            <div className="flex flex-col gap-1">{members.map(renderMember)}</div>
          </div>
        ) : (
          <p className="text-input-placeholder text-sm">No members found.</p>
        )}
      </div>

      <div className="mt-auto mb-6 md:mb-8">
        <WorldProfileSelector />
      </div>
    </aside>
  );
};
