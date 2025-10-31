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
  Building2,
  Shield,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-memoralis.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Obituários", href: "/obituaries", icon: FileText },
  { name: "Cerimónias", href: "/ceremonies", icon: Calendar },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Documentos", href: "/documents", icon: FolderOpen },
  { name: "Configurações", href: "/settings", icon: Settings },
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

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    setIsAdmin(roles?.some((r) => r.role === "admin") || false);
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
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/dashboard"}
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

        {isAdmin && (
          <div className="space-y-1 pt-4 border-t border-border">
            <p className="px-4 text-xs font-semibold text-muted-foreground mb-2">
              ADMINISTRAÇÃO
            </p>
            {adminNavigation.map((item) => (
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
