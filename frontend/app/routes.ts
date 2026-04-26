import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
  layout("routes/AppLayout.tsx", [
    index("routes/MainPage.tsx"),
    route("world/roles/:worldId", "routes/World/RolePage.tsx"),
    route("world/:worldId/:roomId", "routes/World/ChannelRoom.tsx"),
    route("dm/:threadId", "routes/DirectMessageRoom.tsx"),
  ]),
] satisfies RouteConfig;
