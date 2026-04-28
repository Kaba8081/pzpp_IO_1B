import type { WorldProfile, WorldRoomMessage, WorldRoomMessageAction } from "@/types/models";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface ChannelRoomMessageProps {
  message: WorldRoomMessage;
  author?: Pick<WorldProfile, "id" | "name" | "username" | "avatar" | "user_id">;
  actions?: WorldRoomMessageAction[];
  GameMaster: boolean;
  canDelete?: boolean;
  onAuthorClick?: (
    author: Pick<WorldProfile, "id" | "name" | "username" | "avatar" | "user_id">
  ) => void;
  onDelete?: (messageId: number) => void;
}

export const ChannelRoomMessage = ({
  message,
  author,
  actions = [],
  GameMaster,
  canDelete = false,
  onAuthorClick,
  onDelete,
}: ChannelRoomMessageProps) => {
  const [isPending, setIsPending] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const avatar = author?.avatar || null;
  const username = author?.name ?? author?.username ?? "Unknown Wanderer";

  const handleAuthorClick = () => {
    if (author && onAuthorClick) {
      onAuthorClick(author);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(message.id);
    } finally {
      setIsDeleting(false);
    }
  };

  if (message.message_type === "system") {
    const systemProfileName = message.system_message?.user_profile?.name ?? author?.username;

    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-input-placeholder italic px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
          {message.system_message?.event_type === "user_joined"
            ? `${systemProfileName ?? "A user"} joined the room`
            : message.system_message?.event_type === "user_left"
              ? `${systemProfileName ?? "A user"} left the room`
              : (message.content ?? "System event")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4 w-full group mt-5 max-w-full">
      <div className="shrink-0 w-12">
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

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <button
            type="button"
            onClick={handleAuthorClick}
            disabled={!onAuthorClick}
            className={`text-primary whitespace-nowrap mr-4 ${onAuthorClick ? "hover:underline cursor-pointer" : "cursor-default"}`}
          >
            {username}
          </button>

          <div className="flex gap-3 items-center">
            {GameMaster && isPending && (
              <>
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
              </>
            )}

            {canDelete && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Delete message"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-error/60 hover:text-error disabled:opacity-30"
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {message.message_type === "media" && message.media_message ? (
          <div className="mb-3">
            {message.media_message.media_type === "image" ? (
              <img
                src={message.media_message.file}
                alt="Shared image"
                className="max-w-sm max-h-80 rounded-lg object-contain"
              />
            ) : (
              <video
                src={message.media_message.file}
                controls
                className="max-w-sm max-h-80 rounded-lg"
              />
            )}
            {message.content && (
              <p className="text-justify mt-1 wrap-break-word w-full">{message.content}</p>
            )}
          </div>
        ) : (
          <p className="text-justify mb-3 wrap-break-word w-full">
            {message.content || "No content provided."}
          </p>
        )}

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
