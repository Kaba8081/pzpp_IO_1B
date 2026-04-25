import React from "react";
import type { World } from "@/types/models";

interface WorldTileProps {
  world: World;
  onClick?: () => void;
}

export const WorldTile = ({ world, onClick }: WorldTileProps) => {
  const displayName = world.name || "Unnamed world";
  const displayDescription =
    world.description || "Creator has not added a description for this world yet.";
  const hasImage = Boolean(world.profile_picture);
  const dateAdded = world.created_at
    ? new Date(world.created_at as string).toLocaleDateString("pl-PL")
    : "No Date";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick || (e.key !== "Enter" && e.key !== " ")) return;
        e.preventDefault();
        onClick();
      }}
      className="group flex flex-col overflow-hidden rounded-xl bg-background border border-primary mb-6 last:mb-0 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
    >
      {/*Image section*/}
      <div className="relative h-64 w-full bg-background overflow-hidden">
        {hasImage ? (
          <img
            src={world.profile_picture!}
            alt={`World image: ${displayName}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-7xl opacity-30">🌍</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h3 className="text-center">{world.name || "World Name"}</h3>
        </div>
      </div>

      {/*Metadata section*/}
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 py-4 px-6">
        <div className="flex gap-2">Added:{dateAdded}</div>

        <div className="flex gap-2">Author:{world.owner_username ?? "Unknown"}</div>

        <div className="flex gap-2">Characters:{world.total_user_profiles_count}</div>
      </div>

      {/*Description section*/}
      <div className="flex flex-col p-6 sm:p-8 grow">
        <p className="line-clamp-4" title={displayDescription}>
          {displayDescription}
        </p>
      </div>
    </div>
  );
};
