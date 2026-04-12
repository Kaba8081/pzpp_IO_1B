import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), // keep or remove if not needed
  route("world/:worldId", "routes/ChannelRoom.tsx"),
  route("MainPage", "routes/MainPage.tsx"), // ścieżka do strony głównej
] satisfies RouteConfig;
