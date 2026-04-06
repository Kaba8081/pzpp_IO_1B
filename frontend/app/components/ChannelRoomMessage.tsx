import type { UserProfile, WorldRoomMessage, WorldRoomMessageAction } from '@/types/models';
import { Button } from './Button';
import { useState } from 'react';

interface ChannelRoomMessageProps {
  message: WorldRoomMessage;
  author: UserProfile;
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

  const mockActions: WorldRoomMessageAction[] = [
    { id: 1, message_id: message.id, attribute_id: 1, user_profile_id: author.id, value: "INTELLIGENCE +5", created_at: null, updated_at: null, deleted_at: null },
    { id: 2, message_id: message.id, attribute_id: 2, user_profile_id: author.id, value: "STRENGTH +2", created_at: null, updated_at: null, deleted_at: null }
  ];

  const displayActions = actions.length > 0 ? actions : mockActions;
  
  const avatar = author.profile_picture || "https://via.placeholder.com/100";
  const username = author.username || "Unknown Wanderer";

  return (
    <div className="flex gap-5 w-full group mx-5 my-5">
      <div className="shrink-0">
        <img 
          src={avatar} 
          alt={username}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-cinzel text-primary font-bold uppercase tracking-widest text-md whitespace-nowrap mr-4">
            {username}
          </span>

          {GameMaster && isPending && (
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setIsPending(false)}
                className="uppercase whitespace-nowrap border-none whitespace-nowrap" 
              >
                Accept post
              </Button>
              <Button 
                variant="outline"
                onClick={() => console.log("Post Declined")}
                className="uppercase whitespace-nowrap border-none !text-error whitespace-nowrap"
              >
                Decline post
              </Button>
            </div>
          )}
        </div>

        <p className="font-cinzel text-white text-md leading-relaxed tracking-wide text-justify mb-3">
          {message.content || "No content provided."}
        </p>

        <div className="flex flex-col items-start gap-2">
          {GameMaster && (
            <Button 
            variant = "outline"
            onClick={() => console.log("Change attributes")}
            className = "text-white text-xs uppercase"
            >
              Change attributes
            </Button>
          )}

            <div className="flex gap-4 mt-1">
            {displayActions.map((action) => (
                <span 
                  key={action.id} 
                  className="font-cinzel text-white text-xs uppercase tracking-[0.2em] whitespace-nowrap pb-0.5"
                >
                  {action.value}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};