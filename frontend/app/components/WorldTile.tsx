import React from 'react';
import type { World } from '@/types/models';

interface WorldTileProps {
  world: World;
}

export const WorldTile = ({ world }: WorldTileProps) => {
  const displayName = world.name || "Unnamed world";
  const displayDescription = world.description || "Creator has not added a description for this world yet.";
  const hasImage = Boolean(world.profile_picture);
  const dateAdded = world.created_at 
    ? new Date(world.created_at as string).toLocaleDateString('pl-PL') 
    : "No Date";

  return (
    <div 
      className="text-white group flex flex-col overflow-hidden rounded-xl bg-[#061010] border-1 border-[#068C7C] mb-6 last:mb-0 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
    >
      {/*Image section*/}
      <div className="relative h-64 w-full bg-gray-900 overflow-hidden">
        
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

        <div className="absolute inset-0 bg-black/[0.28]" />
        
        <div className="absolute inset-0 flex items-center justify-center p-4">
            <h3 className="text-[clamp(20px,4vw,30px)] font-cinzel uppercase tracking-widest text-center [text-shadow:0_4px_12px_rgba(0,0,0,0.5)]">
                {world.name || "World Name"}
            </h3>
        </div>
    </div>

    {/*Metadata section*/}
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 py-4 px-6">
        <div className="flex gap-2 font-cinzel text-[15px] sm:text-[17px] uppercase tracking-widest">
            Added:{dateAdded}
        </div>
        
        <div className="flex gap-2 font-cinzel text-[15px] sm:text-[17px] uppercase tracking-widest" >
          Author:Nickname
        </div>

        <div className="flex gap-2 font-cinzel text-[15px] sm:text-[17px] uppercase tracking-widest">
          Characters:#
        </div>
      </div>

    {/*Description section*/}
        <div className="flex flex-col p-6 sm:p-8 flex-grow">
        <p className="text-[12px] sm:text-[14px] font-bold font-cinzel uppercase line-clamp-4 tracking-widest" title={displayDescription}>
          {displayDescription}
        </p>
        </div>

    </div>
  );
};