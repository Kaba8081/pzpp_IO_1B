import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), // keep or remove if not needed
  route("test", "routes/test.tsx"),
  route("testUS", "routes/testUS.tsx") // for UserStore and Modal testing
] satisfies RouteConfig;
