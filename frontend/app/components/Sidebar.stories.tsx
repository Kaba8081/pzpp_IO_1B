import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
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
      <UserProvider>
        <div className="flex h-screen bg-neutral-950 p-4">
          <Story />
        </div>
      </UserProvider>
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

const mockWorlds = [
  {
    world: {
      id: 1,
      owner_id: 1,
      name: "Fantasy Realm",
      description: "A world full of myths",
      profile_picture: null,
      distinct_user_count: 0,
      total_user_profiles_count: 0,
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    defaultOpen: true,
    activeRoomId: 101,
    rooms: [
      {
        id: 101,
        world_id: 1,
        name: "Elven Forest",
        description: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      },
      {
        id: 102,
        world_id: 1,
        name: "Dwarf Mountains",
        description: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      },
      {
        id: 103,
        world_id: 1,
        name: "Dragon Lair",
        description: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      },
    ],
  },
  {
    world: {
      id: 2,
      owner_id: 1,
      name: "Sci-Fi Universe",
      description: "Space exploration and colonies",
      profile_picture: null,
      distinct_user_count: 0,
      total_user_profiles_count: 0,
      created_at: null,
      updated_at: null,
      deleted_at: null,
    },
    defaultOpen: false,
    rooms: [
      {
        id: 201,
        world_id: 2,
        name: "Mars Colony",
        description: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      },
      {
        id: 202,
        world_id: 2,
        name: "Space Station Alpha",
        description: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
      },
    ],
  },
];

const SidebarStoryState = ({
  user,
  ...sidebarProps
}: {
  user: SessionUser | null;
} & React.ComponentProps<typeof Sidebar>) => {
  const { setUser } = useUserStore();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return <Sidebar {...sidebarProps} />;
};

export const LoggedOut: Story = {
  render: (args) => <SidebarStoryState {...args} user={null} />,
  args: { isHomeActive: false },
};

export const LoggedIn: Story = {
  render: (args) => <SidebarStoryState {...args} user={mockUser} />,
  args: { isHomeActive: true },
};

export const WithWorlds: Story = {
  render: (args) => <SidebarStoryState {...args} user={mockUser} />,
  args: {
    isHomeActive: false,
    worlds: mockWorlds,
  },
};
