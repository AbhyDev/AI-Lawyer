import { Outlet } from "react-router-dom";
import { usePreventBackAfterLogout } from "@/hooks/use-prevent-back";

/**
 * Layout component for authenticated routes
 * Implements security measures to prevent browser back navigation after logout
 */
export default function AuthLayout() {
  // Apply the hook to prevent back navigation after logout
  usePreventBackAfterLogout();
  
  return <Outlet />;
}