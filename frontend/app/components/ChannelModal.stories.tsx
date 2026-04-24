import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { UserProvider, useUserStore } from "@/stores/UserStore";
import { ChannelModal } from "./ChannelModal";

const meta: Meta<typeof ChannelModal> = {
  title: "Components/Modals/ChannelModal",
  component: ChannelModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserProvider>
          {/* Ustawiamy ciemne tło całej strony, żeby modal dobrze się prezentował */}
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
type Story = StoryObj<typeof ChannelModal>;

// Komponent pomocniczy wyzwalający otwarcie modala kanałów
const ModalTrigger = () => {
  const { modal } = useUserStore();

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={() => modal.open("channel-modal")}
        className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-cinzel font-bold tracking-widest text-sm rounded-xl"
      >
        OPEN CHANNEL MODAL
      </button>
    </div>
  );
};

// Domyślny widok edycji/tworzenia kanałów
export const Default: Story = {
  render: () => (
    <>
      <ModalTrigger />
      <ChannelModal />
    </>
  ),
};
