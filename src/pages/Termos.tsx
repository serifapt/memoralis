import { PublicHeader } from "@/components/layout/PublicHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import logo from "@/assets/logo-memoralis.svg";

const Termos = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="px-4 py-16 bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block px-3 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Informação Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Termos e Condições</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Última atualização: 22 de maio de 2026
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-3xl prose prose-sm md:prose-base prose-headings:font-archivo prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary max-w-none">
          <h2>1. Identificação</h2>
          <p>
            A plataforma Memoralis (acessível em memoralis.pt e respetivos subdomínios) é detida e operada pela
            <strong> Memoralis, Lda</strong>, com sede em Incubo, 4970-786 Arcos de Valdevez, Portugal.
            Contactos: <a href="mailto:info@memoralis.pt">info@memoralis.pt</a> · <a href="tel:+351928282582">+351 928 282 582</a>.
          </p>

          <h2>2. Objeto</h2>
          <p>
            Os presentes Termos e Condições regulam o acesso e a utilização da plataforma Memoralis,
            disponibilizada a funerárias, técnicos, famílias e ao público em geral, com vista à criação e
            consulta de obituários digitais, gestão de cerimónias, contratação de serviços de manutenção
            memorial e demais funcionalidades disponibilizadas.
          </p>

          <h2>3. Aceitação</h2>
          <p>
            A utilização da plataforma pressupõe a leitura, compreensão e aceitação integral dos presentes
            Termos e Condições, bem como da <Link to="/privacidade">Política de Privacidade</Link>. Caso não
            concorde com algum dos termos, deverá abster-se de utilizar a plataforma.
          </p>

          <h2>4. Acesso e Registo</h2>
          <ul>
            <li>A consulta de conteúdos públicos não exige registo;</li>
            <li>O acesso a áreas reservadas (funerária, técnico, administrador, cliente) requer criação de conta;</li>
            <li>O utilizador é responsável pela veracidade dos dados fornecidos e pela confidencialidade das credenciais de acesso;</li>
            <li>A Memoralis reserva-se o direito de suspender ou cancelar contas em caso de utilização indevida.</li>
          </ul>

          <h2>5. Conteúdos Publicados</h2>
          <p>
            As funerárias parceiras e, quando aplicável, os familiares, são responsáveis pelos conteúdos
            (textos, fotografias, datas) publicados nos obituários e cerimónias. Ao submeter conteúdos,
            o utilizador declara dispor das autorizações necessárias e garante que estes não violam
            direitos de terceiros nem a legislação aplicável.
          </p>
          <p>
            A Memoralis reserva-se o direito de remover, sem aviso prévio, qualquer conteúdo que considere
            ilícito, ofensivo, desrespeitoso, falso ou contrário aos presentes Termos.
          </p>

          <h2>6. Condolências e Testemunhos</h2>
          <p>
            As mensagens de condolências, velas virtuais e testemunhos podem estar sujeitas a moderação.
            É proibida a publicação de conteúdo discriminatório, ofensivo, comercial não autorizado ou
            que viole direitos de terceiros.
          </p>

          <h2>7. Serviços Pagos</h2>
          <p>
            Determinadas funcionalidades (subscrições Memoralis Care, serviços para funerárias, encomenda de
            flores, etc.) implicam o pagamento de preços comunicados previamente. Os pagamentos são
            processados através de prestadores certificados. As condições específicas de cada serviço
            (preço, periodicidade, cancelamento) são apresentadas no respetivo processo de contratação.
          </p>

          <h2>8. Propriedade Intelectual</h2>
          <p>
            A marca Memoralis, o logotipo, o software, as bases de dados, os textos, as imagens e demais
            elementos da plataforma são propriedade da Memoralis, Lda ou dos seus licenciadores, estando
            protegidos pela legislação de propriedade intelectual aplicável. É proibida qualquer utilização,
            reprodução ou redistribuição não autorizada.
          </p>

          <h2>9. Limitação de Responsabilidade</h2>
          <p>
            A Memoralis envida todos os esforços para garantir a disponibilidade, segurança e exatidão da
            plataforma, não podendo, no entanto, garantir a inexistência de interrupções, erros ou falhas.
            A Memoralis não se responsabiliza por danos diretos, indiretos ou consequenciais resultantes
            da utilização ou impossibilidade de utilização da plataforma, exceto nos termos legalmente
            imperativos.
          </p>

          <h2>10. Hiperligações</h2>
          <p>
            A plataforma pode conter ligações a sítios de terceiros. A Memoralis não controla nem é
            responsável pelos conteúdos, políticas ou práticas dessas entidades.
          </p>

          <h2>11. Proteção de Dados</h2>
          <p>
            O tratamento de dados pessoais é regulado pela nossa <Link to="/privacidade">Política de Privacidade</Link>,
            que faz parte integrante destes Termos.
          </p>

          <h2>12. Alterações</h2>
          <p>
            A Memoralis reserva-se o direito de alterar a qualquer momento os presentes Termos e Condições,
            sendo as alterações publicadas nesta página com indicação da data da última atualização.
          </p>

          <h2>13. Lei Aplicável e Foro</h2>
          <p>
            Os presentes Termos regem-se pela lei portuguesa. Para a resolução de qualquer litígio
            emergente da sua aplicação, as partes elegem como competente o foro da Comarca de Viana do
            Castelo, com expressa renúncia a qualquer outro.
          </p>

          <h2>14. Resolução Alternativa de Litígios</h2>
          <p>
            Nos termos da Lei n.º 144/2015, de 8 de setembro, em caso de litígio de consumo, o consumidor
            pode recorrer às entidades de resolução alternativa de litígios de consumo, designadamente ao
            CIAB – Centro de Informação, Mediação e Arbitragem de Consumo (Tribunal Arbitral de Consumo)
            ou à plataforma europeia de resolução de litígios em linha (<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>).
          </p>

          <h2>15. Contactos</h2>
          <p>
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

export default Termos;