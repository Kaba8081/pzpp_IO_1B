import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
  layout("routes/AppLayout.tsx", [
    index("routes/MainPage.tsx"),
    route("world/:worldId/:roomId", "routes/ChannelRoom.tsx"),
  ]),
] satisfies RouteConfig;
