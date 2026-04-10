import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-neutral-900 p-6 rounded-xl">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text" },
    defaultOpen: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    title: "Language",
    items: [
      { label: "English", isActive: true },
      { label: "Polish", isActive: false },
      { label: "Spanish", isActive: false },
      { label: "German", isActive: false },
    ],
    defaultOpen: false,
  },
};

export const OpenByDefault: Story = {
  args: {
    title: "Settings",
    items: [
      { label: "Profile", isActive: false },
      { label: "Account", isActive: true },
      { label: "Preferences", isActive: false },
    ],
    defaultOpen: true,
  },
};

export const Empty: Story = {
  args: {
    title: "No Items",
    items: [],
    defaultOpen: true,
  },
};
