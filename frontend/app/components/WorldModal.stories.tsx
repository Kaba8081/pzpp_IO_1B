import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { UserProvider, useUserStore } from "@/stores/UserStore";
import { WorldModal } from "./WorldModal";

const meta: Meta<typeof WorldModal> = {
  title: "Components/Modals/WorldModal",
  component: WorldModal,
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
type Story = StoryObj<typeof WorldModal>;

// Komponent pomocniczy wyzwalający otwarcie modala
const ModalTrigger = ({ label }: { label: string }) => {
  const { modal } = useUserStore();

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={() => modal.open("world-modal")}
        className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-cinzel font-bold tracking-widest text-sm rounded-xl"
      >
        {label}
      </button>
    </div>
  );
};

// 1. Widok tworzenia nowego świata
export const CreateMode: Story = {
  render: (args) => (
    <>
      <ModalTrigger label="OPEN CREATE WORLD MODAL" />
      <WorldModal {...args} />
    </>
  ),
  args: {},
};

// 2. Widok edycji istniejącego świata (z przekazanymi danymi)
export const EditMode: Story = {
  render: (args) => (
    <>
      <ModalTrigger label="OPEN EDIT WORLD MODAL" />
      <WorldModal {...args} />
    </>
  ),
  args: {
    worldId: 123,
    initialData: {
      name: "MYSTICAL FOREST",
      description:
        "LOREM IPSUM LOREM IPSUM LOREM IPSUM LOREM IPSUM LOREM IPSUM LOREM IPSUM LOREM IPSUM.",
      profile_picture:
        "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1920&auto=format&fit=crop",
    },
  },
};
