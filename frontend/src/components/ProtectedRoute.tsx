import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("currentUser");
  const navigate = useNavigate();
  const location = useLocation();
  const [explicitLogout, setExplicitLogout] = useState(false);
  
  // Track if we're coming back from a non-existent page
  const [wasAuthenticated, setWasAuthenticated] = useState(!!isAuthenticated);

  useEffect(() => {
    // Check if the current URL is the login page
    const isLoginPage = location.pathname === "/login";
    
    // Save authentication state for reference
    if (isAuthenticated) {
      setWasAuthenticated(true);
    }
    
    // Only redirect to login if:
    // 1. No authentication AND
    // 2. Either explicit logout was triggered OR we're on the login page
    if (!isAuthenticated && (explicitLogout || isLoginPage)) {
      navigate("/login", { replace: true });
      setExplicitLogout(false);
    }

    // Listen for storage changes (e.g. in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle explicit logout events
      if (e.key === "explicitLogout" && e.newValue === "true") {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
        localStorage.removeItem("explicitLogout");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, isAuthenticated, explicitLogout, location.pathname]);

  // If not authenticated and was never authenticated, redirect to login
  if (!isAuthenticated && !wasAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If not authenticated but was previously authenticated, 
  // allow the app to handle this gracefully (e.g., user might be coming back from 404 page)
  if (!isAuthenticated && wasAuthenticated) {
    // Restore authentication state (user was coming from a non-existent page)
    // This prevents logout when navigating to an invalid route and back
    return <Outlet />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
