import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Slider } from "./Slider";

const SliderWrapper = ({
  initialValue,
  ...props
}: { initialValue?: number } & Omit<React.ComponentProps<typeof Slider>, "value" | "onChange">) => {
  const [value, setValue] = useState(initialValue ?? props.min ?? 0);
  return <Slider {...props} value={value} onChange={setValue} />;
};

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
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

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    label: "Example slider",
    min: 0,
    max: 100,
    value: 50,
  },
};

export const Interactive: Story = {
  render: (args) => <SliderWrapper {...args} initialValue={50} />,
  args: {
    label: "Interactive slider",
    min: 0,
    max: 100,
  },
};

export const WithError: Story = {
  args: {
    label: "Example slider",
    min: 0,
    max: 100,
    value: 30,
    error: "Value is incorrect.",
  },
};
