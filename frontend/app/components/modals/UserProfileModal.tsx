import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getOrCreateDMThread } from "@/services/dm/getOrCreateThread.service";
import type { ProfilePopupData } from "@/types/models";
import { useUserStore } from "@/stores/UserStore";

interface UserProfileModalProps {
  profile: ProfilePopupData;
  onClose: () => void;
}

export const UserProfileModal = ({ profile, onClose }: UserProfileModalProps) => {
  const { modal } = useUserStore();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Fetch real user profile from worldProfileId
  // TODO: Display the user roles

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
    modal.close();
  };

  const handleSendDM = async () => {
    setIsLoading(true);
    try {
      const thread = await getOrCreateDMThread(profile.user_id);
      handleClose();
      navigate(`/dm/${thread.id}`);
    } catch (err) {
      console.error("Failed to open DM thread:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm bg-background border-2 border-primary rounded-2xl p-6 shadow-2xl transition-all duration-200 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-input-placeholder hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/50"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/50 flex items-center justify-center text-primary text-2xl select-none">
              {profile.name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="text-white text-xl font-medium">{profile.name}</h2>
            {profile.description && (
              <p className="text-input-placeholder text-sm mt-1 max-w-xs">{profile.description}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleSendDM}
            disabled={isLoading}
          >
            <MessageSquare size={16} />
            {isLoading ? "Opening..." : "Send Message"}
          </Button>
        </div>
      </div>
    </div>
  );
};
