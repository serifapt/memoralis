import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  FolderOpen, 
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Obituários", href: "/obituaries", icon: FileText },
  { name: "Cerimónias", href: "/ceremonies", icon: Calendar },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Documentos", href: "/documents", icon: FolderOpen },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-border bg-[hsl(var(--sidebar-bg))] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-archivo font-bold text-primary">
          Memoralis
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Gestão Funerária
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
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
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-[hsl(var(--sidebar-hover))] transition-colors text-foreground">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};
