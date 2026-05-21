import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2,
  Users, 
  MessageSquare,
  LogOut,
  FileText,
  Wrench,
  CreditCard,
  ClipboardList,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-memoralis.svg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const mainNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Funerárias", href: "/admin/funerarias", icon: Building2 },
  { name: "Utilizadores", href: "/admin/users", icon: Users },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Chat Suporte", href: "/admin/chat", icon: MessageSquare },
];

const careNavigation = [
  { name: "Subscrições", href: "/admin/care/subscriptions", icon: CreditCard },
  { name: "Tarefas", href: "/admin/care/tasks", icon: ClipboardList },
  { name: "Técnicos", href: "/admin/care/technicians", icon: Wrench },
];

export const AdminSidebar = () => {
  const navigate = useNavigate();

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
          Administração
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/admin/dashboard"}
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

        {/* Care Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            <span>Cuidado & Homenagem</span>
          </div>
          {careNavigation.map((item) => (
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
