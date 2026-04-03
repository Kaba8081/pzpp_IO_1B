
import { ChannelRoomMessage } from "@/components/ChannelRoomMessage";


export default function TestPage() {

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div>
        
        <ChannelRoomMessage message={{ id: 1, content: "Test message on channelroom lorem ipsum dolor sit amet velit", user_profile_id: 1, room_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }} author={{ id: 1, user_id: 1, username: "Test User", profile_picture: "/default-avatar.png", description: "" }} actions={[{ id: 1, message_id: 1, attribute_id: 1, user_profile_id: 1, value: "Mana", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }]} isMasterOfGame={true} />
      </div>
    </div>
  );
}
