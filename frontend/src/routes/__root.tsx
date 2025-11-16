import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const allowedUnauthenticated = ["/login", "/register"];
    const allowedAuthenticated = ["/chat"];

    const { currentUser } = useAuthStore.getState();

    if (!currentUser && !allowedUnauthenticated.includes(location.pathname)) {
      throw redirect({
        to: "/login",
      });
    }
    if (currentUser && !allowedAuthenticated.includes(location.pathname)) {
      throw redirect({
        to: "/chat",
      });
    }
  },

  component: () => <Outlet />,
});
