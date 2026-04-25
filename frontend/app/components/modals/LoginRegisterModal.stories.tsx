import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { UserProvider, useUserStore } from "@/stores/UserStore";
import { LoginRegisterModal } from "@/components/modals/LoginRegisterModal";
import { MemoryRouter } from "react-router";

const meta: Meta<typeof LoginRegisterModal> = {
  title: "Components/Modals/LoginRegisterModal",
  component: LoginRegisterModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserProvider>
          <div className="bg-background-site min-h-screen w-full flex items-center justify-center p-8">
            <Story />
            <div className="flex gap-6">
              <ModalTrigger />
            </div>
          </div>
        </UserProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginRegisterModal>;

const ModalTrigger = () => {
  const { modal } = useUserStore();

  return (
    <div className="flex gap-4">
      <button
        onClick={() => modal.open("login")}
        className="px-8 py-4 bg-primary rounded-full hover:scale-105 transition-all border border-primary/20"
      >
        Open login
      </button>

      <button
        onClick={() => modal.open("register")}
        className="px-8 py-4 bg-transparent rounded-full hover:bg-white/5 border border-white/20 transition-all"
      >
        Open register
      </button>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <LoginRegisterModal />,
};
