import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("currentUser");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Determine where to navigate back to based on authentication status
  const handleReturn = () => {
    if (isAuthenticated) {
      // Get user role from stored user data
      try {
        const user = JSON.parse(isAuthenticated);
        const role = user.role?.toLowerCase() || 'citizen';
        
        // Navigate to the appropriate dashboard based on role
        navigate(`/dashboard/${role}`);
      } catch (e) {
        // If parsing fails, use a fallback
        navigate("/dashboard/citizen");
      }
    } else {
      // If not authenticated, go to landing page
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <button 
          onClick={handleReturn}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          {isAuthenticated ? 'Return to Dashboard' : 'Return to Home'}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
