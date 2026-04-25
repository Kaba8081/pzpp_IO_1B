import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { UserProvider, useUserStore } from "@/stores/UserStore";
import { LoginRegisterModal } from "./LoginRegisterModal";
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
        className="px-8 py-4 bg-primary text-white text-xs font-bold font-cinzel rounded-full hover:scale-105 transition-all tracking-[0.2em] border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
      >
        Open login
      </button>

      <button
        onClick={() => modal.open("register")}
        className="px-8 py-4 bg-transparent text-white text-xs font-bold font-cinzel rounded-full hover:bg-white/5 border border-white/20 transition-all tracking-[0.2em]"
      >
        Open register
      </button>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <LoginRegisterModal />,
};
