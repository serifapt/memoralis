import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
import iconLogo from "@/assets/icon-memoralis.svg";
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

const COLLAPSED_BTN = "w-10 h-10 flex items-center justify-center rounded-lg p-0 transition-colors hover:bg-primary hover:text-primary-foreground text-foreground";
const EXPANDED_BTN = "flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors hover:bg-primary hover:text-primary-foreground text-foreground";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    const isActive = location.pathname === item.href || 
      (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => navigate(item.href)}
              className={cn(COLLAPSED_BTN, isActive && "bg-primary text-primary-foreground")}
            >
              <item.icon className="w-5 h-5 shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <NavLink
        to={item.href}
        end={item.href === "/dashboard"}
        className={({ isActive: active }) =>
          cn(EXPANDED_BTN, active && "bg-primary text-primary-foreground")
        }
      >
        <item.icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{item.name}</span>
      </NavLink>
    );
  };

  return (
    <aside className={cn(
      "border-r border-border bg-[hsl(var(--sidebar-bg))] flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-border flex items-center",
        collapsed ? "justify-center py-3" : "justify-between p-4"
      )}>
        {collapsed ? (
          <img src={iconLogo} alt="Memoralis" className="w-6 h-8 object-contain" />
        ) : (
          <div>
            <img src={logo} alt="Memoralis" className="h-10 mb-1" />
            <p className="text-xs text-muted-foreground">Gestão Funerária</p>
          </div>
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
        {/* Toggle */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={toggleCollapsed} className={COLLAPSED_BTN}>
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expandir</TooltipContent>
          </Tooltip>
        ) : (
          <button onClick={toggleCollapsed} className={EXPANDED_BTN}>
            <PanelLeftClose className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Recolher</span>
          </button>
        )}
      </nav>

      {/* Footer - Sair */}
      <div className={cn(
        "border-t border-border py-2",
        collapsed ? "flex flex-col items-center" : "px-2"
      )}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleLogout} className={COLLAPSED_BTN}>
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sair</TooltipContent>
          </Tooltip>
        ) : (
          <button onClick={handleLogout} className={EXPANDED_BTN}>
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
};
