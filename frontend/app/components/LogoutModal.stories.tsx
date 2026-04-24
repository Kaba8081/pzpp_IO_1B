import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { UserProvider, useUserStore } from "@/stores/UserStore";
import { LogoutModal } from "./LogoutModal";

const meta: Meta<typeof LogoutModal> = {
  title: "Components/Modals/LogoutModal",
  component: LogoutModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserProvider>
          <div className="bg-background-site min-h-screen w-full font-sans">
            <Story />
          </div>
        </UserProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof LogoutModal>;

const ModalTrigger = () => {
  const { modal } = useUserStore();

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={() => modal.open("logout")}
        className="px-6 py-3 border border-primary text-primary hover:bg-primary transition-colors font-cinzel font-bold tracking-widest text-sm rounded-xl"
      >
        OPEN LOGOUT MODAL
      </button>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <>
      <ModalTrigger />
      <LogoutModal />
    </>
  ),
};
