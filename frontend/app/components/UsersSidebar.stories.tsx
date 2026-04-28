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

export const Default: Story = {
  args: {
    members: [
      { id: 1, name: "Alice", description: null, avatar: null, user_id: 11 },
      { id: 2, name: "Bob", description: null, avatar: null, user_id: 12 },
    ],
    onMemberClick: () => {},
  },
};

export const NoWorld: Story = {
  args: {
    members: [],
    onMemberClick: () => {},
  },
};
