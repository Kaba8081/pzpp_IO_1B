import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-100 bg-background p-6 rounded-xl border border-primary/20">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const TabsWrapper = (args: React.ComponentProps<typeof Tabs>) => {
  const [activeTab, setActiveTab] = useState(args.activeTab || args.items[0]?.id || "");
  return <Tabs {...args} activeTab={activeTab} setActiveTab={setActiveTab} />;
};

export const Default: Story = {
  render: (args) => <TabsWrapper {...args} />,
  args: {
    items: [
      { id: "tab1", label: "First Tab" },
      { id: "tab2", label: "Second Tab" },
    ],
    activeTab: "tab1",
    setActiveTab: () => {},
  },
};

export const WithBadge: Story = {
  render: (args) => <TabsWrapper {...args} />,
  args: {
    items: [
      { id: "messages", label: "Messages", hasBadge: true },
      { id: "notifications", label: "Alerts", hasBadge: false },
      { id: "settings", label: "Settings" },
    ],
    activeTab: "messages",
    setActiveTab: () => {},
  },
};

export const ManyTabs: Story = {
  render: (args) => <TabsWrapper {...args} />,
  args: {
    items: [
      { id: "1", label: "One" },
      { id: "2", label: "Two" },
      { id: "3", label: "Three" },
      { id: "4", label: "Four" },
    ],
    activeTab: "1",
    setActiveTab: () => {},
  },
};
