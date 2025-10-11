import { NavigateFunction } from "react-router-dom";
import { API_BASE_URL } from "./api";

/**
 * Shared utility for handling user logout across the application
 * - Makes logout API request
 * - Clears local storage
 * - Clears browser history state
 * - Redirects to login page
 */
export async function handleLogout(navigate: NavigateFunction) {
  try {
    // Set a flag to indicate explicit logout intent
    localStorage.setItem("explicitLogout", "true");

    // Call logout endpoint
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    // Clear user data from localStorage
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");

    // Clear session storage as well
    sessionStorage.clear();

    // Redirect to login page with replace to prevent back navigation
    navigate("/login", { replace: true });

    // Additional security: Use history API to modify history state
    if (window.history && window.history.pushState) {
      // Add a dummy history entry that redirects to login
      // This ensures if user presses back, they go to login
      window.history.pushState(null, "", "/login");
    }

    // Remove the explicit logout flag after a short delay
    setTimeout(() => {
      localStorage.removeItem("explicitLogout");
    }, 1000);
  }
}
