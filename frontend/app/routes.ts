import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/MainPage.tsx"),
  route("world/:worldId", "routes/ChannelRoom.tsx"),
] satisfies RouteConfig;
