import type { WorldProfile, WorldRoomMessage, WorldRoomMessageAction } from "@/types/models";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface ChannelRoomMessageProps {
  message: WorldRoomMessage;
  author?: Pick<WorldProfile, "id" | "name" | "avatar" | "user_id">;
  actions?: WorldRoomMessageAction[];
  GameMaster: boolean;
  onAuthorClick?: (author: Pick<WorldProfile, "id" | "name" | "avatar" | "user_id">) => void;
}

export const ChannelRoomMessage = ({
  message,
  author,
  actions = [],
  GameMaster,
  onAuthorClick,
}: ChannelRoomMessageProps) => {
  const [isPending, setIsPending] = useState(true);

  const avatar = author?.avatar || null;
  const username = author?.name || "Unknown Wanderer";

  const handleAuthorClick = () => {
    if (author && onAuthorClick) {
      onAuthorClick(author);
    }
  };

  return (
    <div className="flex gap-5 w-full group mx-5 my-5">
      <div className="shrink-0">
        <button
          type="button"
          onClick={handleAuthorClick}
          disabled={!onAuthorClick}
          className={onAuthorClick ? "cursor-pointer" : "cursor-default"}
          aria-label={onAuthorClick ? `View ${username}'s profile` : undefined}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={username}
              className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-primary/50 transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary select-none hover:ring-2 hover:ring-primary/50 transition-all">
              {username.slice(0, 1).toUpperCase()}
            </div>
          )}
        </button>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center mb-1">
          <button
            type="button"
            onClick={handleAuthorClick}
            disabled={!onAuthorClick}
            className={`text-primary whitespace-nowrap mr-4 ${onAuthorClick ? "hover:underline cursor-pointer" : "cursor-default"}`}
          >
            {username}
          </button>

          {GameMaster && isPending && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPending(false)}
                className="nowrap border-none"
              >
                Accept post
              </Button>
              <Button
                variant="outline"
                onClick={() => console.log("Post Declined")}
                className="nowrap border-none text-error"
              >
                Decline post
              </Button>
            </div>
          )}
        </div>

        <p className="text-justify mb-3">{message.content || "No content provided."}</p>

        <div className="flex flex-col items-start gap-2">
          {GameMaster && (
            <Button
              variant="outline"
              onClick={() => console.log("Change attributes")}
              className="text-white"
            >
              Change attributes
            </Button>
          )}

          <div className="flex gap-4 mt-1">
            {actions.map((action) => (
              <span key={action.id} className="text-white whitespace-nowrap pb-0.5">
                {action.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
