import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo-memoralis.svg";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";

export const CareHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const scrollToPlans = () => {
    const plansSection = document.getElementById('plans');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/care" className="flex items-center gap-2">
            <img src={logo} alt="Memoralis" className="w-[165px] md:w-[220px]" />
            <span className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary border-l border-border pl-2 ml-2">
              <Heart className="w-3.5 h-3.5" />
              Cuidado & Homenagem
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/care" 
              className={`text-sm hover:text-primary transition-colors ${
                isActive("/care") ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              Início
            </Link>
            <button 
              onClick={scrollToPlans}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Planos
            </button>
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Memoralis
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/care/auth">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/care/auth?tab=register">Criar Conta</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-border mt-4">
            <nav className="flex flex-col gap-3">
              <Link 
                to="/care" 
                className={`text-sm py-2 ${isActive("/care") ? "text-foreground font-medium" : "text-muted-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Início
              </Link>
              <button 
                onClick={scrollToPlans}
                className="text-sm text-muted-foreground text-left py-2"
              >
                Planos
              </button>
              <Link 
                to="/" 
                className="text-sm text-muted-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Memoralis
              </Link>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to="/care/auth">Entrar</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link to="/care/auth?tab=register">Criar Conta</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
