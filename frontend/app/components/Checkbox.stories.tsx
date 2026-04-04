import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const CheckboxWrapper = ({
  initialChecked = false,
  ...props
}: { initialChecked?: boolean } & Omit<
  React.ComponentProps<typeof Checkbox>,
  "checked" | "onChange"
>) => {
  const [checked, setChecked] = useState(initialChecked);
  return <Checkbox {...props} checked={checked} onChange={setChecked} />;
};

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
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

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
    checked: true,
  },
};

export const Unchecked: Story = {
  args: {
    label: "Accept terms and conditions",
    checked: false,
  },
};

export const Interactive: Story = {
  render: (args) => <CheckboxWrapper {...args} />,
  args: {
    label: "Click to toggle",
  },
};

export const WithError: Story = {
  args: {
    label: "Accept terms and conditions",
    checked: false,
    error: "You must accept the terms to continue.",
  },
};
