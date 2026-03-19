import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  FolderOpen, 
  Settings,
  LogOut,
  MessageSquare,
  Flower2,
  ShoppingBag,
  Receipt,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-memoralis.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFlowerService } from "@/hooks/useFlowerService";

const baseNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Obituários", href: "/obituaries", icon: FileText },
  { name: "Cerimónias", href: "/ceremonies", icon: Calendar },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Orçamentos", href: "/budgets", icon: Receipt },
  { name: "Documentos", href: "/documents", icon: FolderOpen },
];

const flowerNavigation = [
  { name: "Catálogo de Flores", href: "/flowers/catalog", icon: Flower2 },
  { name: "Pedidos de Flores", href: "/flowers/orders", icon: ShoppingBag },
];

const bottomNavigation = [
  { name: "Chat de Suporte", href: "/support", icon: MessageSquare },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const { isFlowerServiceActive } = useFlowerService();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Sessão terminada com sucesso");
      navigate("/");
    }
  };

  const navItems = [
    ...baseNavigation,
    ...(isFlowerServiceActive ? flowerNavigation : []),
    ...bottomNavigation,
  ];

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
          {navItems.map((item) => (
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
