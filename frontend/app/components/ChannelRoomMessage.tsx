import type { WorldProfile, WorldRoomMessage, WorldRoomMessageAction } from "@/types/models";
import { Button } from "./Button";
import { useState } from "react";

interface ChannelRoomMessageProps {
  message: WorldRoomMessage;
  author?: Pick<WorldProfile, "id" | "name" | "avatar">;
  actions?: WorldRoomMessageAction[];
  GameMaster: boolean;
}

export const ChannelRoomMessage = ({
  message,
  author,
  actions = [],
  GameMaster,
}: ChannelRoomMessageProps) => {
  const [isPending, setIsPending] = useState(true);

  const avatar = author?.avatar || "https://via.placeholder.com/100";
  const username = author?.name || "Unknown Wanderer";

  return (
    <div className="flex gap-5 w-full group mx-5 my-5">
      <div className="shrink-0">
        <img src={avatar} alt={username} className="w-12 h-12 rounded-full object-cover" />
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-primary whitespace-nowrap mr-4">{username}</span>

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
