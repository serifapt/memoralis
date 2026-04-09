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
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRolesForSession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);

      if (!nextSession) {
        setHasRole(false);
        setUserRole(null);
        setLoading(false);
        setInitialLoadDone(true);
        return;
      }

      // Only show loading spinner on initial load, not on background re-checks
      if (!initialLoadDone) {
        setLoading(true);
      }

      const [adminRes, funerariaRes, memberRes] = await Promise.all([
        supabase.rpc("has_role", { _user_id: nextSession.user.id, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: nextSession.user.id, _role: "funeraria" }),
        supabase.from("funeraria_members").select("id").eq("user_id", nextSession.user.id).limit(1),
      ]);

      if (adminRes.error || funerariaRes.error) {
        console.error("Erro ao verificar permissões (ProtectedRoute):", adminRes.error || funerariaRes.error);
        setHasRole(false);
        setUserRole(null);
        setLoading(false);
        return;
      }

      const isAdmin = Boolean(adminRes.data);
      const isFuneraria = Boolean(funerariaRes.data);
      const isMember = (memberRes.data && memberRes.data.length > 0);

      if (!isAdmin && !isFuneraria && !isMember) {
        // User has no roles - orphan user, force logout
        console.warn("User has no roles in ProtectedRoute, signing out");
        await supabase.auth.signOut();
        setUserRole(null);
        setHasRole(false);
        setLoading(false);
        return;
      }

      setUserRole(isAdmin ? "admin" : (isFuneraria || isMember) ? "funeraria" : null);

      if (requireRole) {
        setHasRole(requireRole === "admin" ? isAdmin : isFuneraria);
      } else {
        setHasRole(true);
      }

      setLoading(false);
      setInitialLoadDone(true);
    };

    // Subscribe first to avoid missing a fast SIGNED_IN event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Only react to actual sign-in/sign-out, not token refreshes
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setTimeout(() => {
          fetchRolesForSession(nextSession);
        }, 0);
      }
    });

    // Initial load
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => fetchRolesForSession(currentSession))
      .catch((err) => {
        console.error("Erro ao obter sessão (ProtectedRoute):", err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requireRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>A carregar...</p>
      </div>
    );
  }

  if (!session) {
    const loginPath = requireRole === "admin" ? "/admin/auth" : "/login";
    return <Navigate to={loginPath} replace />;
  }

  // Admins can access everything
  if (requireRole && !hasRole && userRole !== "admin") {
    // Redirect based on user's actual role
    if (userRole === "funeraria") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
