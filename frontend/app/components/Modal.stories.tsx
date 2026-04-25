import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal } from "./modals/Modal";
import { UserProvider, useUserStore } from "@/stores/UserStore";
import { Button } from "./Button";

const ModalDemo = ({ children }: { children: React.ReactNode }) => {
  const { modal } = useUserStore();
  const modalName = "demo-modal";

  return (
    <div>
      <Button onClick={() => modal.open(modalName)}>Open Modal</Button>
      <Modal name={modalName}>{children}</Modal>
    </div>
  );
};

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <UserProvider>
        <Story />
      </UserProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => (
    <ModalDemo>
      <h3 className="text-lg font-semibold mb-2">Example modal</h3>
      <p>Some content</p>
    </ModalDemo>
  ),
};
