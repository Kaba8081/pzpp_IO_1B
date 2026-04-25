import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";

const ToggleWrapper = ({
  initialChecked = false,
  ...props
}: { initialChecked?: boolean } & Omit<
  React.ComponentProps<typeof Toggle>,
  "checked" | "onChange"
>) => {
  const [checked, setChecked] = useState(initialChecked);
  return <Toggle {...props} checked={checked} onChange={setChecked} />;
};

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    error: {
      control: { type: "text" },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    label: "Example toggle",
    checked: true,
  },
};

export const Interactive: Story = {
  render: (args) => <ToggleWrapper {...args} />,
  args: {
    label: "Example toggle",
  },
};

export const WithError: Story = {
  args: {
    label: "Example toggle",
    checked: false,
    error: "Value is incorrect.",
  },
};
