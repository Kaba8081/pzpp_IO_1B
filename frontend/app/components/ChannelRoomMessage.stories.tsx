import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChannelRoomMessage } from "./ChannelRoomMessage";

const meta: Meta<typeof ChannelRoomMessage> = {
  title: "Components/ChannelRoomMessage",
  component: ChannelRoomMessage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof ChannelRoomMessage>;

const mockAuthor = {
  id: 1,
  user_id: 1,
  name: "Eldrin the Wise",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eldrin",
};

const mockMessage = {
  id: 101,
  content: "The ancient forest stands quiet today. What are your actions?",
  room: 1,
  user_profile: 1,
  message_type: "text" as const,
  created_at: null,
  updated_at: null,
  deleted_at: null,
  media_message: null,
  system_message: null,
};

const mockActions = [
  {
    id: 1,
    message_id: 101,
    attribute_id: 1,
    user_profile_id: 1,
    value: "INTELLIGENCE +5",
    created_at: null,
    updated_at: null,
    deleted_at: null,
  },
  {
    id: 2,
    message_id: 101,
    attribute_id: 2,
    user_profile_id: 1,
    value: "STRENGTH +2",
    created_at: null,
    updated_at: null,
    deleted_at: null,
  },
];

export const Default: Story = {
  args: {
    message: mockMessage,
    author: mockAuthor,
    actions: mockActions,
    GameMaster: false,
  },
};

export const GameMasterView: Story = {
  args: {
    message: mockMessage,
    author: mockAuthor,
    actions: mockActions,
    GameMaster: true,
  },
};

export const NoActions: Story = {
  args: {
    message: mockMessage,
    author: mockAuthor,
    actions: [],
    GameMaster: false,
  },
};
