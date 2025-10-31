import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Clock, Edit, Eye, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const events = [
  {
    type: "Velório",
    date: "15/01/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
  },
  {
    type: "Cerimónia",
    date: "16/01/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
  },
  {
    type: "Funeral",
    date: "16/01/2025",
    time: "18:00",
    location: "Casa Mortuária do AVV",
  },
];

export default function ObituaryDashboardDetail() {
  const { id } = useParams();

  return (
    <div className="p-8 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/obituaries">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            José Manuel Osório
          </h1>
          <p className="text-muted-foreground mt-1">
            1930 - 2025 | 94 anos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/obituario/${id}`} target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              Ver Público
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/obituaries/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informação Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
              <p className="text-foreground">José Manuel Osório</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Local</p>
              <p className="text-foreground">Oreira - Arcos de Valdevez</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
              <p className="text-foreground">01/01/1930</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Falecimento</p>
              <p className="text-foreground">15/01/2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informação Família / Responsável */}
      <Card id="informacao-familia">
        <CardHeader>
          <CardTitle>Informação Família / Responsável</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Responsável</p>
              <p className="text-foreground">Maria Silva Osório</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contacto</p>
              <p className="text-foreground">962 123 456</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-foreground">maria.osorio@example.com</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Parentesco</p>
              <p className="text-foreground">Filha</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Mensagem da Família</p>
            <p className="text-foreground leading-relaxed">
              Sua Família anuncia o falecimento e convida a todos os parentes e amigos para o seu Velório e 
              com a intenção de informar os amigos, que por falta de tempo não foi possível avisar Pessoalmente 
              convidamos para assistir na Igreja de Santa Maria de Aires Pessoal de Fortuna.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações Fúnebres */}
      <Card id="informacoes-funebres">
        <CardHeader>
          <CardTitle>Informações Fúnebres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{event.type}</h3>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
