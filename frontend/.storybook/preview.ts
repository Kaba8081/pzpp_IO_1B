import type { Preview } from "@storybook/react-vite";
import "../app/app.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      options: {
        dark: { name: "Dark", value: "#061010" },
        light: { name: "Light", value: "#ffffff" },
      },
    },
    options: {
      storySort: {
        order: ["Components", ["Inputs", "*"], "*"],
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "dark" },
    theme: "dark",
  },
};

export default preview;
