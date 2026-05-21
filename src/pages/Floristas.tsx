import { ComingSoonPage } from "@/components/public/ComingSoonPage";

export default function Floristas() {
  return (
    <ComingSoonPage
      page="floristas"
      eyebrow="Brevemente"
      title={<>Diretório nacional de <span className="text-primary">floristas</span></>}
      description="Estamos a construir o maior diretório de floristas de Portugal, para que famílias e funerárias encontrem facilmente quem entrega flores em cada localidade, com confiança e rapidez."
      bullets={[
        "Floristas verificadas em todos os distritos",
        "Encomendas integradas com obituários Memoralis",
        "Avaliações reais de clientes",
        "Notificação imediata quando ficar disponível",
      ]}
    />
  );
}
