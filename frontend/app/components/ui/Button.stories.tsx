import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "primary",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline button",
    variant: "outline",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    variant: "primary",
    disabled: true,
  },
};

export const DisabledOutline: Story = {
  args: {
    children: "Disabled Outline",
    variant: "outline",
    disabled: true,
  },
};
