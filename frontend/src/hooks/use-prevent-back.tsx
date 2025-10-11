import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to prevent browser back navigation after logout
 * This sets cache control headers to prevent caching of protected pages
 * but only enforces logout security on explicit logout events
 */
export function usePreventBackAfterLogout() {
  const location = useLocation();
  const [wasLoggedOut, setWasLoggedOut] = useState(false);

  useEffect(() => {
    // Check for explicit logout flag
    const explicitLogout = localStorage.getItem("explicitLogout") === "true";
    if (explicitLogout) {
      setWasLoggedOut(true);
    }

    // Set cache-control headers only when needed
    const preventCaching = () => {
      const isAuthenticated = localStorage.getItem("currentUser");
      
      // Add cache control only for authenticated sessions
      // or when user has explicitly logged out
      if (isAuthenticated || wasLoggedOut) {
        document.querySelector('meta[http-equiv="Cache-Control"]')?.remove();
        document.querySelector('meta[http-equiv="Pragma"]')?.remove();
        document.querySelector('meta[http-equiv="Expires"]')?.remove();
        
        const metaCacheControl = document.createElement('meta');
        metaCacheControl.setAttribute('http-equiv', 'Cache-Control');
        metaCacheControl.setAttribute('content', 'no-cache, no-store, must-revalidate');
        
        const metaPragma = document.createElement('meta');
        metaPragma.setAttribute('http-equiv', 'Pragma');
        metaPragma.setAttribute('content', 'no-cache');
        
        const metaExpires = document.createElement('meta');
        metaExpires.setAttribute('http-equiv', 'Expires');
        metaExpires.setAttribute('content', '0');
        
        document.head.appendChild(metaCacheControl);
        document.head.appendChild(metaPragma);
        document.head.appendChild(metaExpires);
      }
    };

    preventCaching();
    
    // Reset wasLoggedOut state when user logs back in
    if (localStorage.getItem("currentUser") && wasLoggedOut) {
      setWasLoggedOut(false);
    }
    
    // Clean up when component unmounts
    return () => {
      document.querySelector('meta[http-equiv="Cache-Control"]')?.remove();
      document.querySelector('meta[http-equiv="Pragma"]')?.remove();
      document.querySelector('meta[http-equiv="Expires"]')?.remove();
    };
  }, [location.pathname, wasLoggedOut]);
}