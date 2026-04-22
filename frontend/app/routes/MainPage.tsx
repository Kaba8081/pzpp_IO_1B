import React, { useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { WorldTile } from "@/components/WorldTile";
import type { World } from "@/types/models";

const mockWorlds: World[] = [
  {
    id: 1,
    owner_id: 1,
    name: "FOREST KINGDOM",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vitae lectus id diam laoreet convallis at rutrum ex. Nunc vitae ornare sem. Mauris sit amet ipsum quam. Phasellus cursus dui placerat, rhoncus metus suscipit, blandit libero.",
    profile_picture:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1920&auto=format&fit=crop",
    distinct_user_count: 0,
    total_user_profiles_count: 0,
    created_at: "2026-03-03T00:00:00Z",
    updated_at: "2026-03-03T00:00:00Z",
    deleted_at: null,
  },
  {
    id: 2,
    owner_id: 1,
    name: "DESERT KINGDOM",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vitae lectus id diam laoreet convallis at rutrum ex. Nunc vitae ornare sem. Mauris sit amet ipsum quam. Phasellus cursus dui placerat, rhoncus metus suscipit, blandit libero.",
    profile_picture:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1920&auto=format&fit=crop",
    distinct_user_count: 0,
    total_user_profiles_count: 0,
    created_at: "2026-03-03T00:00:00Z",
    updated_at: "2026-03-03T00:00:00Z",
    deleted_at: null,
  },
  {
    id: 3,
    owner_id: 1,
    name: "ARCTIC KINGDOM",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vitae lectus id diam laoreet convallis at rutrum ex. Nunc vitae ornare sem. Mauris sit amet ipsum quam. Phasellus cursus dui placerat, rhoncus metus suscipit, blandit libero.",
    profile_picture:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1920&auto=format&fit=crop",
    distinct_user_count: 0,
    total_user_profiles_count: 0,
    created_at: "2026-03-03T00:00:00Z",
    updated_at: "2026-03-03T00:00:00Z",
    deleted_at: null,
  },
];

export default function MainPage() {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("Users: descending");

  const sortOptions = ["Users: descending", "Users: ascending"];

  return (
    <div className="flex-1 flex flex-col bg-background border-2 border-primary rounded-2xl overflow-hidden p-8 m-4 ml-0">
      <div className="flex justify-between items-start mb-8 z-10 relative">
        <div className="flex items-center gap-3 px-4 py-2.5 w-96 rounded-xl border border-primary/50 bg-background focus-within:border-primary transition-colors">
          <Search className="w-5 h-5 text-white" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent text-white placeholder-white/80 outline-none tracking-widest"
          />
        </div>

        <div className="flex items-center gap-3 relative">
          <span className="tracking-widest">Sort By:</span>

          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between gap-3 w-64 px-4 py-2.5 border border-primary/50 rounded-xl bg-background tracking-widest hover:border-primary transition-colors"
            >
              {activeSort}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-primary rounded-xl overflow-hidden shadow-2xl flex flex-col">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setActiveSort(option);
                      setIsSortOpen(false);
                    }}
                    className="flex items-center justify-between px-4 py-3 tracking-widest text-left hover:bg-primary/20 transition-colors"
                  >
                    {option}
                    {activeSort === option && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
        <div className="flex flex-col gap-6">
          {mockWorlds.map((world) => (
            <WorldTile key={world.id} world={world} />
          ))}
        </div>
      </div>
    </div>
  );
}
