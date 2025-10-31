import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  FolderOpen, 
  Settings,
  LogOut,
  MessageSquare,
  Building2,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-memoralis.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const funerariaNavigation = [
  { name: "Chat de Suporte", href: "/support", icon: MessageSquare },
];

const adminNavigation = [
  { name: "Dashboard Admin", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Funerárias", href: "/admin/funerarias", icon: Building2 },
  { name: "Utilizadores", href: "/admin/users", icon: Shield },
  { name: "Chat Suporte", href: "/admin/chat", icon: MessageSquare },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      setIsAdmin(roles?.some((r) => r.role === "admin") || false);
    } catch (error) {
      console.error("Erro ao verificar papel do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Sessão terminada com sucesso");
      navigate("/");
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-[hsl(var(--sidebar-bg))] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <img src={logo} alt="Memoralis" className="h-12 mb-2" />
        <p className="text-xs text-muted-foreground mt-1">
          Gestão Funerária
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground px-4">A carregar...</p>
        ) : (
          <div className="space-y-1">
            {(isAdmin ? adminNavigation : funerariaNavigation).map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-[hsl(var(--sidebar-hover))]",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-[hsl(var(--sidebar-hover))] transition-colors text-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};
