import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "admin" | "funeraria";
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "funeraria" | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        // Get all user roles
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentSession.user.id);

        if (rolesData && rolesData.length > 0) {
          // Check if user is admin
          const isAdmin = rolesData.some((r) => r.role === "admin");
          const isFuneraria = rolesData.some((r) => r.role === "funeraria");
          
          setUserRole(isAdmin ? "admin" : isFuneraria ? "funeraria" : null);

          if (requireRole) {
            setHasRole(rolesData.some((r) => r.role === requireRole));
          } else {
            setHasRole(true);
          }
        } else {
          setUserRole(null);
          setHasRole(!requireRole);
        }
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setHasRole(false);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [requireRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>A carregar...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Admins can access everything
  if (requireRole && !hasRole && userRole !== "admin") {
    // Redirect based on user's actual role
    if (userRole === "funeraria") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/auth" replace />;
    }
  }

  return <>{children}</>;
}
