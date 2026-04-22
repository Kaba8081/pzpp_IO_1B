import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorldTile } from "./WorldTile";
import type { World } from "@/types/models";

const meta: Meta<typeof WorldTile> = {
  title: "Components/WorldTile",
  component: WorldTile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof WorldTile>;

const baseWorld: World = {
  id: 1,
  owner_id: 1,
  description: null,
  name: null,
  profile_picture: null,
  distinct_user_count: 0,
  total_user_profiles_count: 0,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z",
  deleted_at: null,
};

export const Default: Story = {
  args: {
    world: {
      ...baseWorld,
      name: "Kingdoms of Aetheria",
      description:
        "A vast medieval fantasy world filled with magic, ancient ruins, and mysterious civilizations. Explore kingdoms, dungeons, and enchanted forests.",
      profile_picture:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    },
  },
};

export const NoImage: Story = {
  args: {
    world: {
      ...baseWorld,
      name: "The Void",
      description: "A mysterious world without a profile picture.",
      profile_picture: null,
    },
  },
};

export const NoName: Story = {
  args: {
    world: {
      ...baseWorld,
      name: null,
      description: "A world without a name that exists in the void.",
      profile_picture: null,
    },
  },
};

export const NoDescription: Story = {
  args: {
    world: {
      ...baseWorld,
      name: "Unnamed Realm",
      description: null,
      profile_picture:
        "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop",
    },
  },
};

export const LongDescription: Story = {
  args: {
    world: {
      ...baseWorld,
      name: "The Endless Chronicles",
      description:
        "This is an extraordinarily long description that goes on and on to demonstrate how the component handles text overflow. It contains multiple sentences and paragraphs worth of content that should be truncated with ellipsis when displayed in the tile to maintain visual consistency and prevent layout breaking.",
      profile_picture:
        "https://images.unsplash.com/photo-1579033100-fab47debb64e?w=800&h=400&fit=crop",
    },
  },
};

export const NoDate: Story = {
  args: {
    world: {
      ...baseWorld,
      created_at: null,
      name: "Timeless Dimension",
      description: "A world that exists outside the flow of time.",
      profile_picture:
        "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&h=400&fit=crop",
    },
  },
};

export const MinimalData: Story = {
  args: {
    world: {
      ...baseWorld,
      name: "Minimalist",
      description: null,
      profile_picture: null,
      created_at: null,
    },
  },
};
