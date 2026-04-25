import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UserAttributesPopup } from "./modals/UserAttributesPopup";

const ModalWrapper = ({
  initialIsOpen = true,
  ...props
}: { initialIsOpen?: boolean } & Omit<
  React.ComponentProps<typeof UserAttributesPopup>,
  "isOpen" | "onClose" | "onSave"
>) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  return (
    <div className="min-h-125 w-full flex items-center justify-center">
      {!isOpen && (
        <button
          className="px-6 py-3 bg-primary text-white rounded-xl"
          onClick={() => setIsOpen(true)}
        >
          Edit Attributes
        </button>
      )}
      <UserAttributesPopup
        {...props}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={(data) => {
          console.log("Saving to Database:", data);
          setIsOpen(false);
        }}
      />
    </div>
  );
};

const meta: Meta<typeof UserAttributesPopup> = {
  title: "Components/UserAttributesPopup",
  component: UserAttributesPopup,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof UserAttributesPopup>;

export const Interactive: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    attributesData: [
      { key: "strength", name: "Strength", current: 2 },
      { key: "intelligence", name: "Intelligence", current: 3 },
      { key: "dexterity", name: "Dexterity", current: 5 },
    ],
  },
};
