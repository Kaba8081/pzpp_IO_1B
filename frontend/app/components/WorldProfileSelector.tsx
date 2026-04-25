import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { useUserStore } from "@/stores/UserStore";
import { ArrowDownUp, Check, PlusCircle, Trash2 } from "lucide-react";
import { getWorldProfilesByWorld } from "@/services/worldUserProfile";
import type { WorldUserProfile } from "@/types/models";
import { useParams } from "react-router";

const WorldProfileSelector: React.FC = () => {
  const {
    isLoggedIn,
    activeProfile,
    activeProfilesByWorld,
    setActiveProfile,
    setActiveProfileForWorld,
    setDeletingCharacter,
    modal,
    currentModal,
  } = useUserStore();
  const { worldId } = useParams<{ worldId: string }>();
  const [profiles, setProfiles] = useState<WorldUserProfile[]>([]);
  const [profilesLoadedForWorld, setProfilesLoadedForWorld] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousWorldIdRef = useRef<string | undefined>(undefined);
  const parsedWorldId = worldId ? parseInt(worldId) : null;

  useEffect(() => {
    setIsAvatarLoading(true);
  }, [activeProfile?.avatar]);

  useEffect(() => {
    if (previousWorldIdRef.current === worldId) return;
    previousWorldIdRef.current = worldId;
    setProfiles([]);
    setProfilesLoadedForWorld(null);

    const rememberedProfile =
      parsedWorldId && Number.isFinite(parsedWorldId)
        ? (activeProfilesByWorld[parsedWorldId] ?? null)
        : null;
    setActiveProfile(rememberedProfile);
  }, [activeProfilesByWorld, parsedWorldId, worldId, setActiveProfile]);

  useEffect(() => {
    if (!isLoggedIn || !worldId) {
      setProfiles([]);
      setProfilesLoadedForWorld(null);
      setActiveProfile(null);
      return;
    }

    const parsedWorldId = parseInt(worldId);
    let isMounted = true;
    setProfilesLoadedForWorld(null);

    getWorldProfilesByWorld(parsedWorldId)
      .then((nextProfiles) => {
        if (!isMounted) return;
        setProfiles(nextProfiles);
        setProfilesLoadedForWorld(parsedWorldId);
      })
      .catch((error) => {
        console.error(error);
        if (!isMounted) return;
        setProfiles([]);
        setProfilesLoadedForWorld(parsedWorldId);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, worldId, currentModal, setActiveProfile]);

  useEffect(() => {
    if (!parsedWorldId || profilesLoadedForWorld !== parsedWorldId) return;

    const rememberedProfile = activeProfilesByWorld[parsedWorldId];
    if (rememberedProfile) {
      const freshProfile = profiles.find((profile) => profile.id === rememberedProfile.id);
      if (freshProfile && activeProfile?.id !== freshProfile.id) {
        setActiveProfile(freshProfile);
      }
      return;
    }

    if (activeProfile && !profiles.some((profile) => profile.id === activeProfile.id)) {
      setActiveProfile(null);
    }
  }, [
    activeProfile,
    activeProfilesByWorld,
    profiles,
    profilesLoadedForWorld,
    parsedWorldId,
    setActiveProfile,
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col justify-center pt-6 px-4 md:px-6 border-t-2 border-primary gap-y-2">
      {activeProfile && (
        <div className="flex flex-col items-center gap-y-1">
          {activeProfile.avatar && activeProfile.avatar.length > 0 && (
            <div className="relative w-full max-h-48 max-w-36 aspect-1/2 overflow-hidden rounded-2xl">
              {isAvatarLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
              <img
                className="h-full w-full object-cover"
                src={activeProfile.avatar}
                alt={activeProfile.name}
                onLoad={() => setIsAvatarLoading(false)}
                onError={() => setIsAvatarLoading(false)}
              />
            </div>
          )}
          <h2 className="w-max">{activeProfile.name}</h2>
        </div>
      )}

      {isLoggedIn && (
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            className="w-full flex flex-row text-sm items-center justify-between"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <p>Select character</p>
            <ArrowDownUp className="w-4 h-4 shrink-0" />
          </Button>

          {isOpen && (
            <div className="absolute bottom-full mb-1 left-0 right-0 bg-background border border-primary rounded-xl overflow-hidden z-50 shadow-lg">
              {profiles.length === 0 ? (
                <div className="px-4 py-2 text-sm text-primary/50">No characters yet</div>
              ) : (
                profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/20 transition-colors"
                  >
                    <button
                      className="flex min-w-0 flex-1 items-center justify-between text-left"
                      onClick={() => {
                        if (parsedWorldId) setActiveProfileForWorld(parsedWorldId, profile);
                        setIsOpen(false);
                      }}
                    >
                      <span className="truncate">{profile.name}</span>
                      {activeProfile?.id === profile.id && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                    <button
                      className="shrink-0 rounded-md p-1 text-input-placeholder hover:bg-error/10 hover:text-error transition-colors"
                      aria-label={`Delete ${profile.name}`}
                      onClick={() => {
                        if (parsedWorldId) {
                          setDeletingCharacter({ worldId: parsedWorldId, profile });
                        }
                        setIsOpen(false);
                        modal.open("delete-character");
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm border-t border-primary/30 hover:bg-primary/20 transition-colors"
                onClick={() => {
                  modal.open("create-character");
                  setIsOpen(false);
                }}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create character</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeProfile && (
        <Button
          variant="outline"
          className="flex flex-row text-sm items-center justify-between"
          onClick={() => modal.open("edit-character")}
        >
          <p>Edit character</p>
          <PlusCircle className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};

export default WorldProfileSelector;
