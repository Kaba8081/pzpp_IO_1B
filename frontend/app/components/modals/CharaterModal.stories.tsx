import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { UserProvider } from "@/stores/UserStore";
import { CharacterModal } from "./CharaterModal";

const meta: Meta<typeof CharacterModal> = {
  title: "Components/Modals/CharacterModal",
  component: CharacterModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserProvider>
          <div className="min-h-screen w-full bg-background-site text-white">
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
type Story = StoryObj<typeof CharacterModal>;

export const Create: Story = {
  args: {
    mode: "create",
    worldId: 1,
  },
};

export const Display: Story = {
  args: {
    mode: "display",
    profileId: 1,
  },
};

export const Edit: Story = {
  args: {
    mode: "edit",
    profileId: 1,
  },
};
