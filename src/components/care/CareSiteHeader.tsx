import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-memoralis.svg";
import { Menu, X } from "lucide-react";

const nav = [
  { href: "#inicio", label: "Início" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#planos", label: "Planos" },
  { href: "#cemiterios", label: "Cemitérios" },
  { href: "#faq", label: "Perguntas Frequentes" },
  { href: "#contacto", label: "Contacto" },
];

export function CareSiteHeader() {
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
        <Link to="/care" className="flex items-center">
          <img src={logo} alt="Memoralis" className="h-9" />
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-[15px]">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="text-muted-foreground hover:text-primary transition-colors">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          {authed ? (
            <Button asChild size="lg"><Link to="/account/care">A minha conta</Link></Button>
          ) : (
            <Button asChild size="lg" className="px-6"><Link to="/care/aderir">Aderir ao serviço</Link></Button>
          )}
        </div>
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3 text-base">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="py-2 text-foreground" onClick={() => setOpen(false)}>
                {n.label}
              </a>
            ))}
            {authed ? (
              <Button asChild size="lg"><Link to="/account/care">A minha conta</Link></Button>
            ) : (
              <Button asChild size="lg"><Link to="/care/aderir">Aderir ao serviço</Link></Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}