import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-memoralis.svg";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const nav = [
  { href: "#inicio", label: "Início" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#planos", label: "Planos" },
  { href: "#cemiterios", label: "Cemitérios" },
  { href: "#faq", label: "FAQ" },
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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/care" className="flex items-center">
            <img src={logo} alt="Memoralis" className="w-[165px] md:w-[220px]" />
          </Link>

          <nav className="hidden md:flex gap-6 absolute left-1/2 transform -translate-x-1/2">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {authed ? (
              <Button size="sm" asChild className="hidden md:inline-flex">
                <Link to="/account/care">A minha conta</Link>
              </Button>
            ) : (
              <Button size="sm" asChild className="hidden md:inline-flex">
                <Link to="/care/aderir">Aderir</Link>
              </Button>
            )}

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
                  {nav.map((n) => (
                    <a
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {n.label}
                    </a>
                  ))}
                  {authed ? (
                    <Button size="sm" asChild className="mt-4 w-full">
                      <Link to="/account/care" onClick={() => setOpen(false)}>A minha conta</Link>
                    </Button>
                  ) : (
                    <Button size="sm" asChild className="mt-4 w-full">
                      <Link to="/care/aderir" onClick={() => setOpen(false)}>Aderir</Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}