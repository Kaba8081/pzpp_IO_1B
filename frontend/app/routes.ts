import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), // keep or remove if not needed
  // route("test", "routes/test.tsx"),
] satisfies RouteConfig;
