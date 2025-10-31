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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession && requireRole) {
        // Check user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentSession.user.id)
          .eq("role", requireRole)
          .single();

        setHasRole(!!roleData);
      } else if (currentSession) {
        setHasRole(true);
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setHasRole(false);
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

  if (requireRole && !hasRole) {
    // Redirect based on actual role
    if (requireRole === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
