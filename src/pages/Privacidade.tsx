import { PublicHeader } from "@/components/layout/PublicHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import logo from "@/assets/logo-memoralis.svg";

const Privacidade = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="px-4 py-16 bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Informação Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Política de Privacidade</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Última atualização: 22 de maio de 2026
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-3xl prose prose-sm md:prose-base prose-headings:font-archivo prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary max-w-none">
          <h2>1. Identificação do Responsável pelo Tratamento</h2>
          <p>
            A entidade responsável pelo tratamento dos seus dados pessoais é a <strong>Memoralis, Lda</strong>,
            com sede em Incubo, 4970-786 Arcos de Valdevez, Portugal.
          </p>
          <ul>
            <li><a href="mailto:info@memoralis.pt">info@memoralis.pt</a></li>
            <li>Telefone: <a href="tel:+351928282582">+351 928 282 582</a></li>
          </ul>

          <h2>2. Enquadramento</h2>
          <p>
            A Memoralis respeita a sua privacidade e está empenhada em proteger os dados pessoais que nos confia.
            A presente Política de Privacidade descreve como recolhemos, utilizamos, partilhamos e protegemos os
            seus dados pessoais, em conformidade com o Regulamento Geral sobre a Proteção de Dados
            (Regulamento (UE) 2016/679 – "RGPD") e demais legislação nacional aplicável.
          </p>

          <h2>3. Dados Pessoais Recolhidos</h2>
          <p>Podemos recolher e tratar as seguintes categorias de dados pessoais:</p>
          <ul>
            <li><strong>Dados de identificação e contacto:</strong> nome, email, telefone, morada;</li>
            <li><strong>Dados de conta:</strong> credenciais de acesso, função (funerária, técnico, cliente, administrador);</li>
            <li><strong>Dados relativos a obituários:</strong> informação sobre pessoas falecidas publicada por funerárias parceiras ou familiares;</li>
            <li><strong>Dados de pagamento:</strong> tratados por prestadores certificados (ex.: Stripe), nunca armazenados nos nossos sistemas;</li>
            <li><strong>Dados de navegação:</strong> endereço IP, tipo de dispositivo, browser, páginas visitadas, cookies;</li>
            <li><strong>Comunicações:</strong> mensagens enviadas através de formulários, condolências e testemunhos.</li>
          </ul>

          <h2>4. Finalidades e Fundamentos do Tratamento</h2>
          <p>Tratamos os seus dados pessoais para as seguintes finalidades:</p>
          <ul>
            <li>Prestação dos serviços disponibilizados na plataforma (execução de contrato);</li>
            <li>Criação e gestão de contas de utilizador (execução de contrato);</li>
            <li>Publicação de obituários, condolências e cerimónias (execução de contrato e interesse legítimo);</li>
            <li>Resposta a pedidos de contacto (interesse legítimo);</li>
            <li>Envio de comunicações informativas e newsletters (consentimento, com possibilidade de cancelamento a qualquer momento);</li>
            <li>Cumprimento de obrigações legais (fiscais, contabilísticas e judiciais);</li>
            <li>Melhoria contínua e segurança da plataforma (interesse legítimo).</li>
          </ul>

          <h2>5. Partilha de Dados com Terceiros</h2>
          <p>
            Os seus dados podem ser partilhados com subcontratantes que prestam serviços à Memoralis,
            nomeadamente: alojamento e infraestrutura cloud, processamento de pagamentos, envio de emails
            transacionais e ferramentas de análise. Todos os subcontratantes estão vinculados por contrato a
            assegurar a confidencialidade e a segurança dos dados.
          </p>
          <p>
            Não vendemos nem cedemos os seus dados pessoais a terceiros para fins de marketing.
          </p>

          <h2>6. Transferências Internacionais</h2>
          <p>
            Sempre que existam transferências de dados para fora do Espaço Económico Europeu, garantimos a
            existência de cláusulas contratuais-tipo aprovadas pela Comissão Europeia ou outras garantias
            adequadas previstas no RGPD.
          </p>

          <h2>7. Prazos de Conservação</h2>
          <p>
            Conservamos os seus dados apenas pelo período necessário às finalidades para as quais foram
            recolhidos, ou conforme exigido por obrigações legais. Os obituários publicados podem permanecer
            disponíveis enquanto subsistir o interesse legítimo da família e da funerária responsável.
          </p>

          <h2>8. Direitos dos Titulares dos Dados</h2>
          <p>Nos termos do RGPD, tem o direito de:</p>
          <ul>
            <li>Aceder aos seus dados pessoais;</li>
            <li>Solicitar a retificação de dados incorretos ou incompletos;</li>
            <li>Solicitar o apagamento ("direito a ser esquecido");</li>
            <li>Solicitar a limitação ou opor-se ao tratamento;</li>
            <li>Solicitar a portabilidade dos dados;</li>
            <li>Retirar o consentimento a qualquer momento;</li>
            <li>Apresentar reclamação junto da Comissão Nacional de Proteção de Dados (CNPD – <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>).</li>
          </ul>
          <p>
            Para exercer estes direitos, contacte-nos através de <a href="mailto:info@memoralis.pt">info@memoralis.pt</a>.
          </p>

          <h2>9. Cookies</h2>
          <p>
            Utilizamos cookies próprios e de terceiros para garantir o funcionamento da plataforma, recordar
            preferências e analisar a sua utilização. Pode gerir as suas preferências de cookies nas
            configurações do seu browser.
          </p>

          <h2>10. Segurança</h2>
          <p>
            Implementamos medidas técnicas e organizativas adequadas para proteger os seus dados pessoais
            contra acessos não autorizados, perdas, alterações ou divulgação indevida, incluindo encriptação,
            controlo de acessos, monitorização e cópias de segurança.
          </p>

          <h2>11. Alterações a esta Política</h2>
          <p>
            A Memoralis poderá atualizar a presente Política de Privacidade. A versão em vigor estará
            permanentemente disponível nesta página, com indicação da data da última atualização.
          </p>

          <h2>12. Contactos</h2>
          <p>
            Para qualquer questão relacionada com privacidade e proteção de dados, contacte-nos para:
            <br />
            Memoralis, Lda – Incubo, 4970-786 Arcos de Valdevez
            <br />
            <a href="mailto:info@memoralis.pt">info@memoralis.pt</a> · Telefone: <a href="tel:+351928282582">+351 928 282 582</a>
          </p>
        </div>
      </section>

      <footer className="bg-foreground text-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-1">
              <Link to="/" className="inline-block mb-4">
                <img src={logo} alt="Memoralis" className="h-10 brightness-0 invert" />
              </Link>
              <p className="text-sm opacity-80">
                Plataforma digital para honrar e preservar memórias.
              </p>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/sobre" className="opacity-80 hover:opacity-100">Sobre</Link></li>
                <li><Link to="/blog" className="opacity-80 hover:opacity-100">Blog</Link></li>
                <li><Link to="/contactos" className="opacity-80 hover:opacity-100">Contactos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Diretórios</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/obituarios" className="opacity-80 hover:opacity-100">Obituários</Link></li>
                <li><Link to="/funerarias" className="opacity-80 hover:opacity-100">Funerárias</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/ajuda" className="opacity-80 hover:opacity-100">Ajuda</Link></li>
                <li><Link to="/privacidade" className="opacity-80 hover:opacity-100">Privacidade</Link></li>
                <li><Link to="/termos" className="opacity-80 hover:opacity-100">Termos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-archivo font-semibold mb-4">Newsletter</h4>
              <p className="text-sm opacity-80 mb-4">Receba as últimas notícias e atualizações</p>
              <div className="flex gap-2">
                <Input placeholder="Email" className="bg-background/10 border-background/20 text-foreground placeholder:text-muted-foreground" />
                <Button className="bg-primary hover:bg-primary/90"><Heart className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-80">
            © 2025 Memoralis. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacidade;