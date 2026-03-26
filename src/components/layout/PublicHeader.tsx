import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo-memoralis.svg";

export const PublicHeader = () => {
  const location = useLocation();
  
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
            <img src={logo} alt="Memoralis" className="h-12" />
          </Link>

          {/* Centered Navigation */}
          <nav className="hidden md:flex gap-6 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              to="/" 
              className={`text-sm hover:text-primary transition-colors ${
                isActive("/") && !isActive("/obituario") && !isActive("/funerarias") 
                  ? "text-foreground font-medium" 
                  : "text-muted-foreground"
              }`}
            >
              Início
            </Link>
            <Link 
              to="/obituario" 
              className={`text-sm hover:text-primary transition-colors ${
                isActive("/obituario") ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              Obituário
            </Link>
            <Link 
              to="/funerarias" 
              className={`text-sm hover:text-primary transition-colors ${
                isActive("/funerarias") ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              Funerárias
            </Link>
            <Link 
              to="/sobre" 
              className={`text-sm hover:text-primary transition-colors ${
                isActive("/sobre") ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              Sobre
            </Link>
            <Link 
              to="/blog" 
              className={`text-sm hover:text-primary transition-colors ${
                isActive("/blog") ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              Blog
            </Link>
            <Link 
              to="/contactos" 
              className={`text-sm hover:text-primary transition-colors ${
                isActive("/contactos") ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              Contactos
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Registar</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
