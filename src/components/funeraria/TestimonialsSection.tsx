import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, Loader2, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  author_name: string;
  rating: number;
  message: string;
  created_at: string;
}

interface TestimonialsSectionProps {
  funerariaId: string;
  funerariaName: string;
}

export function TestimonialsSection({ funerariaId, funerariaName }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", rating: 5, message: "" });

  useEffect(() => {
    loadTestimonials();
  }, [funerariaId]);

  const loadTestimonials = async () => {
    const { data } = await supabase
      .from("funeraria_testimonials")
      .select("id, author_name, rating, message, created_at")
      .eq("funeraria_id", funerariaId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(12);

    if (data) setTestimonials(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const message = form.message.trim();

    if (!name || name.length > 100) {
      toast.error("Nome é obrigatório (máx. 100 caracteres)");
      return;
    }
    if (!message || message.length > 1000) {
      toast.error("Mensagem é obrigatória (máx. 1000 caracteres)");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      toast.error("Avaliação inválida");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("funeraria_testimonials").insert({
      funeraria_id: funerariaId,
      author_name: name,
      author_email: form.email.trim() || null,
      rating: form.rating,
      message: message,
    });

    if (error) {
      toast.error("Erro ao enviar testemunho");
      console.error(error);
    } else {
      toast.success("Testemunho enviado! Será publicado após aprovação.");
      setForm({ name: "", email: "", rating: 5, message: "" });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 transition-colors ${
            star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          } ${onChange ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={() => onChange?.(star)}
        />
      ))}
    </div>
  );

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : null;

  if (loading) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-archivo font-bold text-foreground">Testemunhos</h2>
          {avgRating && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(Number(avgRating))} />
              <span className="text-sm text-muted-foreground">
                {avgRating} ({testimonials.length} {testimonials.length === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <MessageSquareQuote className="w-4 h-4 mr-2" />
          Deixar testemunho
        </Button>
      </div>

      {/* Submission form */}
      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-archivo font-semibold text-foreground mb-4">
              Partilhe a sua experiência com {funerariaName}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Nome *</label>
                  <Input
                    placeholder="O seu nome"
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email (opcional)</label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    maxLength={255}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Avaliação *</label>
                <StarRating value={form.rating} onChange={(v) => setForm(p => ({ ...p, rating: v }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Mensagem *</label>
                <Textarea
                  placeholder="Partilhe a sua experiência..."
                  value={form.message}
                  onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={4}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{form.message.length}/1000</p>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Enviar testemunho
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O testemunho será publicado após revisão.
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Testimonial cards */}
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-3">
                <StarRating value={t.rating} />
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  "{t.message}"
                </p>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground">{t.author_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !showForm ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquareQuote className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Ainda sem testemunhos. Seja o primeiro a partilhar a sua experiência.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
