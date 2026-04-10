import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";
import "../app/app.css";

const preview: Preview = {
  decorators: [(Story) => createElement("div", { className: "font-cinzel" }, createElement(Story))],
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
