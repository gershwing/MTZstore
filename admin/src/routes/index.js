import { publicRoutes, catchAllRoute } from "./publicRoutes";
import { adminRoute } from "./adminRoutes";

export { default as ProtectedRoute } from "./ProtectedRoute";
export { default as RequireAdmin } from "./RequireAdmin";
export { default as RoleRedirect } from "./RoleRedirect";
export { default as withPerm, WithPerm, usePermGuard } from "./withPerm";

export const routes = [...publicRoutes, adminRoute, catchAllRoute];
