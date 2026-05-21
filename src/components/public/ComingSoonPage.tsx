import { useState, ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComingSoonPageProps {
  page: "floristas" | "missas";
  eyebrow: string;
  title: ReactNode;
  description: string;
  bullets?: string[];
}

export const ComingSoonPage = ({ page, eyebrow, title, description, bullets = [] }: ComingSoonPageProps) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Indique um email válido");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("coming_soon_leads").insert({ page, email: email.toLowerCase().trim() });
    setSubmitting(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Não foi possível registar. Tente novamente.");
      return;
    }
    setDone(true);
    toast.success("Obrigado! Avisamos quando lançarmos.");
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-28 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-archivo font-bold mb-6 leading-tight">{title}</h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">{description}</p>

          {bullets.length > 0 && (
            <ul className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto mb-10">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {done ? (
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-lg text-primary font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Avisamos quando estiver disponível.
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="O seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? "A enviar..." : "Avisem-me"}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-6">Brevemente disponível na Memoralis.</p>
        </div>
      </section>
    </div>
  );
};