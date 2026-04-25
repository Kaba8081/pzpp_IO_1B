import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { UserProvider, useUserStore } from "@/stores/UserStore";
import { WorldChannelModal } from "./modals/WorldChannelModal";

const meta: Meta<typeof WorldChannelModal> = {
  title: "Components/Modals/WorldChannelModal",
  component: WorldChannelModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserProvider>
          <div className="min-h-screen w-full bg-background-site">
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
type Story = StoryObj<typeof WorldChannelModal>;

const ModalTriggers = ({ mode }: { mode: "create" | "edit" }) => {
  const { modal } = useUserStore();
  const label = mode === "edit" ? "EDIT WORLD" : "CREATE WORLD";

  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => modal.open("world-modal")}
        className="rounded-xl border border-primary px-6 py-3 tracking-widest text-primary transition-colors hover:bg-primary hover:text-white"
      >
        {label}
      </button>
      {mode === "edit" && (
        <button
          type="button"
          onClick={() => modal.open("channel-modal")}
          className="rounded-xl border border-primary px-6 py-3 tracking-widest text-primary transition-colors hover:bg-primary hover:text-white"
        >
          EDIT CHANNELS
        </button>
      )}
    </div>
  );
};

export const CreateWorld: Story = {
  render: (args) => (
    <>
      <ModalTriggers mode="create" />
      <WorldChannelModal {...args} />
    </>
  ),
  args: {
    mode: "create",
  },
};

export const EditWorld: Story = {
  render: (args) => (
    <>
      <ModalTriggers mode="edit" />
      <WorldChannelModal {...args} />
    </>
  ),
  args: {
    mode: "edit",
    worldId: 123,
    initialData: {
      name: "MYSTICAL FOREST",
      description: "A hidden forest where old roads vanish beneath silver leaves and quiet magic.",
      profile_picture: "",
    },
  },
};
