import { ComingSoonPage } from "@/components/public/ComingSoonPage";

export default function Missas() {
  return (
    <ComingSoonPage
      page="missas"
      eyebrow="Brevemente"
      title={<>Missas por paróquia <span className="text-primary">a nível nacional</span></>}
      description="Vamos reunir, num só lugar, os horários de missas e celebrações de todas as paróquias do país, para que possa facilmente acompanhar a sua comunidade e participar nas missas pelos seus entes queridos."
      bullets={[
        "Horários atualizados por paróquia",
        "Pesquisa por localidade e diocese",
        "Missas de 7º dia e aniversários destacadas",
        "Notificação imediata quando ficar disponível",
      ]}
    />
  );
}
