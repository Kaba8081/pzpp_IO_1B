import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
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

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: "Example",
    placeholder: "Enter text here",
  },
};

export const WithError: Story = {
  args: {
    label: "Example",
    placeholder: "Enter text here",
    defaultValue: "example",
    error: "Invalid input.",
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter text here",
    defaultValue: "example",
  },
};

export const Disabled: Story = {
  args: {
    label: "Example",
    placeholder: "Enter text here",
    defaultValue: "disabled",
    disabled: true,
  },
};
