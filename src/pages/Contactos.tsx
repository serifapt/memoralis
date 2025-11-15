import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, Send, Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import logo from "@/assets/logo-memoralis.png";
const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().trim().min(9, "Telefone inválido").max(20, "Telefone muito longo").optional().or(z.literal("")),
  subject: z.string().trim().min(1, "Assunto é obrigatório").max(200, "Assunto muito longo"),
  message: z.string().trim().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(1000, "Mensagem muito longa")
});
type ContactFormData = z.infer<typeof contactSchema>;
const Contactos = () => {
  const {
    toast
  } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });
  const onSubmit = async (data: ContactFormData) => {
    try {
      // Aqui será implementado o envio do email quando necessário
      console.log("Form data:", data);
      toast({
        title: "Mensagem enviada!",
        description: "Entraremos em contacto em breve."
      });
      reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative px-4 bg-gradient-to-br from-background via-muted/30 to-primary/10 my-0 py-[39px]">
        <div className="container mx-auto max-w-4xl text-center py-[56px]">
          <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Entre em Contacto</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Estamos Aqui para Ajudar
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Tem alguma dúvida ou precisa de mais informações? A nossa equipa está disponível 
            para responder a todas as suas questões.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-4 -mt-8 py-0">
        <div className="container mx-auto max-w-6xl my-0 py-0">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Email</h3>
              <p className="text-xs text-muted-foreground">
                <a href="mailto:info@memoralis.pt" className="hover:text-primary transition-colors">
                  info@memoralis.pt
                </a>
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Telefone</h3>
              <p className="text-xs text-muted-foreground">
                <a href="tel:+351123456789" className="hover:text-primary transition-colors">
                  +351 123 456 789
                </a>
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Morada</h3>
              <p className="text-xs text-muted-foreground">
                Lisboa, Portugal
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Horário</h3>
              <p className="text-xs text-muted-foreground">
                Seg-Sex: 9h-18h
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Left Column - Info */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Fale Connosco</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Preencha o formulário e a nossa equipa entrará em contacto consigo 
                o mais brevemente possível. Estamos disponíveis para esclarecer 
                todas as suas dúvidas.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Apoio Dedicado</h3>
                    <p className="text-xs text-muted-foreground">
                      Equipa especializada pronta para ajudar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Resposta Rápida</h3>
                    <p className="text-xs text-muted-foreground">
                      Respondemos em menos de 24 horas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Email Direto</h3>
                    <p className="text-xs text-muted-foreground">
                      Também pode enviar email para info@memoralis.pt
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <Card className="md:col-span-3 p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" {...register("name")} placeholder="O seu nome" className="mt-1" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="seu@email.com" className="mt-1" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" {...register("phone")} placeholder="+351 123 456 789" className="mt-1" />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input id="subject" {...register("subject")} placeholder="Qual é o motivo do contacto?" className="mt-1" />
                  {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea id="message" {...register("message")} placeholder="Escreva a sua mensagem aqui..." rows={6} className="mt-1 resize-none" />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "A enviar..." : <>
                      Enviar Mensagem
                      <Send className="ml-2 w-4 h-4" />
                    </>}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ao enviar este formulário, concorda com a nossa política de privacidade.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">É uma Funerária?</h2>
          <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
            Junte-se à nossa plataforma e ofereça o melhor serviço às famílias que serve.
          </p>
          <Button size="lg" asChild>
            <Link to="/funeraria/register">
              Registar Funerária
              <Send className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img src={logo} alt="Memoralis" className="h-8" />
              </div>
              <p className="text-sm opacity-80">
                Homenagens que eternizam memórias e sentimentos.
              </p>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Início</Link></li>
                <li><Link to="/sobre" className="opacity-80 hover:opacity-100 transition-opacity">Sobre</Link></li>
                <li><Link to="/blog" className="opacity-80 hover:opacity-100 transition-opacity">Blog</Link></li>
                <li><Link to="/contactos" className="opacity-80 hover:opacity-100 transition-opacity">Contactos</Link></li>
                <li><Link to="/admin/auth" className="opacity-60 hover:opacity-80 text-xs transition-opacity">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/ajuda" className="opacity-80 hover:opacity-100 transition-opacity">Ajuda</Link></li>
                <li><Link to="/privacidade" className="opacity-80 hover:opacity-100 transition-opacity">Privacidade</Link></li>
                <li><Link to="/termos" className="opacity-80 hover:opacity-100 transition-opacity">Termos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Newsletter</h4>
              <p className="text-sm opacity-80 mb-4">
                Receba as últimas notícias e atualizações
              </p>
              <div className="flex gap-2">
                <Input placeholder="Email" className="bg-background/10 border-background/20 text-foreground placeholder:text-muted-foreground" />
                <Button className="bg-primary hover:bg-primary/90">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-80">
            © 2025 Memoralis. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>;
};
export default Contactos;