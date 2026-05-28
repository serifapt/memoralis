import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, Building2, Users, Sparkles, ChevronDown } from "lucide-react";
import logo from "@/assets/logo-memoralis.svg";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/obituario", label: "Obituário" },
  { to: "/funerarias", label: "Funerárias" },
  { to: "/sobre", label: "Sobre" },
  { to: "/blog", label: "Blog" },
  { to: "/contactos", label: "Contactos" },
];

const SOBRE_TABS = [
  { to: "/sobre#profissional", label: "Agências Funerárias", icon: Building2 },
  { to: "/sobre#publico", label: "Público / Famílias", icon: Users },
  { to: "/sobre#servicos", label: "Serviços", icon: Sparkles },
];

export const PublicHeader = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Memoralis" className="w-[165px] md:w-[220px]" />
          </Link>

          {/* Centered Navigation (desktop) */}
          <nav className="hidden md:flex gap-6 absolute left-1/2 transform -translate-x-1/2">
            {NAV_LINKS.map((link) => {
              const active =
                isActive(link.to) &&
                !(link.to === "/" && (isActive("/obituario") || isActive("/funerarias")));
              if (link.to === "/sobre") {
                return (
                  <div key={link.to} className="relative group">
                    <Link
                      to={link.to}
                      className={`text-sm hover:text-primary transition-colors inline-flex items-center gap-1 ${
                        active ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    </Link>
                    {/* Hover bridge to avoid menu closing */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block z-50">
                      <div className="min-w-[240px] rounded-md border border-border bg-popover shadow-lg p-1">
                        {SOBRE_TABS.map(({ to, label, icon: Icon }) => (
                          <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm hover:text-primary transition-colors ${
                    active ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" asChild className="hidden md:inline-flex">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild className="hidden md:inline-flex">
              <Link to="/funeraria/register">Registar</Link>
            </Button>

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>
                    <img src={logo} alt="Memoralis" className="w-[140px]" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={`text-sm hover:text-primary transition-colors ${
                        isActive(link.to) ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Button size="sm" variant="outline" asChild className="mt-4 w-full">
                    <Link to="/login" onClick={() => setOpen(false)}>Entrar</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full">
                    <Link to="/funeraria/register" onClick={() => setOpen(false)}>Registar</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
