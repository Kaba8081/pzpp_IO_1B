import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { Sidebar } from "./Sidebar";
import { UserProvider, useUserStore } from "@/stores/UserStore";
import type { SessionUser } from "@/types/models";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserProvider>
          <div className="flex h-screen bg-neutral-950 p-4">
            <Story />
          </div>
        </UserProvider>
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

const mockUser: SessionUser = {
  id: 1,
  email: "john.doe@example.com",
  profile: {
    user: 1,
    username: "John Doe",
    description: "Storybook demo account",
    profile_picture: "https://i.pravatar.cc/150?img=11",
  },
  accessToken: "story-access-token",
  refreshToken: "story-refresh-token",
};

const SidebarWithUser = ({ user }: { user: SessionUser | null }) => {
  const { setUser } = useUserStore();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return <Sidebar />;
};

export const LoggedOut: Story = {
  render: () => <SidebarWithUser user={null} />,
};

export const LoggedIn: Story = {
  render: () => <SidebarWithUser user={mockUser} />,
};
