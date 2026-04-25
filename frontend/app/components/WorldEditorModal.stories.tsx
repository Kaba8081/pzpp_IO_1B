import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { WorldEditorModal } from "./WorldEditorModal";

const ModalWrapper = ({
  initialIsOpen = true,
  ...props
}: { initialIsOpen?: boolean } & Omit<
  React.ComponentProps<typeof WorldEditorModal>,
  "isOpen" | "onClose" | "onSave"
>) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020505]">
      {!isOpen && (
        <button
          className="px-8 py-4 bg-[#00CCCC] text-black rounded-xl tracking-widest hover:bg-[#00e6e6] transition-colors"
          onClick={() => setIsOpen(true)}
        >
          Open Create World Modal
        </button>
      )}
      <WorldEditorModal
        {...props}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={(data) => {
          console.log("World Data Saved:", data);
          setIsOpen(false);
        }}
      />
    </div>
  );
};

const meta: Meta<typeof WorldEditorModal> = {
  title: "Components/WorldEditorModal",
  component: WorldEditorModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof WorldEditorModal>;

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {},
};

export const Interactive: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    ...Default.args,
  },
};
