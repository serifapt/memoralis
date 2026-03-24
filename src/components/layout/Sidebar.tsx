import { useState } from "react";
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
  Mail,
  MessageSquareQuote,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-memoralis.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFlowerService } from "@/hooks/useFlowerService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const baseNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Obituários", href: "/obituaries", icon: FileText },
  { name: "Cerimónias", href: "/ceremonies", icon: Calendar },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Contactos", href: "/contacts", icon: Mail },
  { name: "Testemunhos", href: "/testimonials", icon: MessageSquareQuote },
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
  const [collapsed, setCollapsed] = useState(() => 
    localStorage.getItem("sidebar-collapsed") === "true"
  );

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
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

  const navItems = [
    ...baseNavigation,
    ...(isFlowerServiceActive ? flowerNavigation : []),
    ...bottomNavigation,
  ];

  const NavItem = ({ item }: { item: typeof baseNavigation[0] }) => {
    const link = (
      <NavLink
        to={item.href}
        end={item.href === "/dashboard"}
        className={({ isActive }) =>
          cn(
            "flex items-center rounded-lg transition-colors",
            collapsed
              ? "justify-center w-10 h-10 mx-auto p-0 hover:bg-primary hover:text-primary-foreground"
              : "gap-3 px-4 py-3 hover:bg-[hsl(var(--sidebar-hover))]",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-foreground"
          )
        }
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  const collapsedBtn = "w-10 h-10 flex items-center justify-center rounded-lg p-0 transition-colors hover:bg-primary hover:text-primary-foreground text-foreground";

  return (
    <aside className={cn(
      "border-r border-border bg-[hsl(var(--sidebar-bg))] flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn(
        "border-b border-border",
        collapsed ? "flex flex-col items-center py-3" : "p-4 flex items-center justify-between"
      )}>
        {!collapsed && (
          <div>
            <img src={logo} alt="Memoralis" className="h-10 mb-1" />
            <p className="text-xs text-muted-foreground">Gestão Funerária</p>
          </div>
        )}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={toggleCollapsed} className={collapsedBtn}>
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expandir</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-lg text-muted-foreground hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-2",
        collapsed ? "flex flex-col items-center gap-1" : "px-2 space-y-1"
      )}>
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-border py-2",
        collapsed ? "flex flex-col items-center" : "px-2"
      )}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleLogout} className={collapsedBtn}>
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sair</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-[hsl(var(--sidebar-hover))] transition-colors text-foreground"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
};
