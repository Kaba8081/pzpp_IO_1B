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
    worldId: 1,
  },
};

export const NoWorld: Story = {
  args: {},
};
