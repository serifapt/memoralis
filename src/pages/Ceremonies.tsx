import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const upcomingCeremonies = [
  {
    id: 1,
    deceased: "Maria Silva Santos",
    date: "17/01/2025",
    time: "10:00",
    location: "Capela São João",
    type: "Velório",
    attendees: 45,
    obituaryId: 1,
  },
  {
    id: 2,
    deceased: "João Pedro Costa",
    date: "16/01/2025",
    time: "15:00",
    location: "Igreja Nossa Senhora",
    type: "Missa",
    attendees: 32,
    obituaryId: 2,
  },
  {
    id: 3,
    deceased: "Ana Beatriz Oliveira",
    date: "15/01/2025",
    time: "11:00",
    location: "Cemitério Municipal",
    type: "Sepultamento",
    attendees: 28,
    obituaryId: 3,
  },
];

export default function Ceremonies() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Cerimónias
          </h1>
          <p className="text-muted-foreground mt-1">
            Calendário e gestão de cerimónias
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Agendar Cerimónia
        </Button>
      </div>

      {/* Calendar View */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-archivo font-semibold text-foreground">
            Próximas Cerimónias
          </h2>
        </div>
        
        <div className="space-y-4">
          {upcomingCeremonies.map((ceremony) => (
            <div
              key={ceremony.id}
              className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary">
                      <span className="text-2xl font-bold">
                        {ceremony.date.split("/")[0]}
                      </span>
                      <span className="text-xs">JAN</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-archivo font-semibold text-foreground text-lg">
                        {ceremony.deceased}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{ceremony.time}</span>
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
                            {ceremony.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{ceremony.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {ceremony.attendees} participantes
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to={`/obituaries/${ceremony.obituaryId}#informacoes-funebres`}>
                      Detalhes
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
