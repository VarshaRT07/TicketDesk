import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("tickets", "routes/tickets.tsx"),
  route("signup", "routes/signup.tsx"),
  route("login", "routes/login.tsx"),
  route("tickets/new", "routes/newtickets.tsx"),
  route("tickets/:ticketId", "routes/tickets.$ticketId.tsx"),
] satisfies RouteConfig;
