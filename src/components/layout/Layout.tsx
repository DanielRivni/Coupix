
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "./NavBar";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout = ({ children, requireAuth = false }: LayoutProps) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Add an effect to handle redirection when auth state changes
  useEffect(() => {
    if (!loading) {
      if (requireAuth && !currentUser) {
        navigate("/login", { state: { from: location }, replace: true });
      } else if (currentUser && ["/login", "/signup"].includes(location.pathname)) {
        navigate("/", { replace: true });
      }
    }
  }, [currentUser, loading, location, navigate, requireAuth]);

  // If still loading, show spinner
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 container py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, render nothing (handled by useEffect)
  if (requireAuth && !currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 container py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
