import type { Meta, StoryObj } from "@storybook/react-vite";
import { UsersSidebar } from "./UsersSidebar";

const meta: Meta<typeof UsersSidebar> = {
  title: "Components/UsersSidebar",
  component: UsersSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof UsersSidebar>;

const mockMaster = {
  id: 1,
  user_id: 1,
  username: "DungeonMaster69",
  description: null,
  profile_picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=DM",
};

const mockCharacters = [
  {
    id: 2,
    user_id: 2,
    username: "Kaelen",
    description: null,
    profile_picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kaelen",
  },
  {
    id: 3,
    user_id: 3,
    username: "Lyra",
    description: null,
    profile_picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lyra",
  },
  {
    id: 4,
    user_id: 4,
    username: "Theron",
    description: null,
    profile_picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Theron",
  },
];

export const Default: Story = {
  args: {
    masterOfGame: mockMaster,
    characters: mockCharacters,
  },
};

export const SingleCharacter: Story = {
  args: {
    masterOfGame: mockMaster,
    characters: [mockCharacters[0]],
  },
};

export const NoData: Story = {
  args: {
    masterOfGame: undefined,
    characters: undefined,
  },
};

export const OnlyCharacters: Story = {
  args: {
    masterOfGame: undefined,
    characters: mockCharacters,
  },
};
