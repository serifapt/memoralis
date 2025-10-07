import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, FileText, Upload, Download } from "lucide-react";

const documentFolders = [
  {
    id: 1,
    name: "Certidões de Óbito",
    count: 24,
    lastUpdated: "Hoje",
  },
  {
    id: 2,
    name: "Contratos",
    count: 18,
    lastUpdated: "Ontem",
  },
  {
    id: 3,
    name: "Autorizações",
    count: 32,
    lastUpdated: "2 dias atrás",
  },
];

export default function Documents() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de ficheiros e templates
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          Carregar Documento
        </Button>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documentFolders.map((folder) => (
          <Card key={folder.id} className="p-6 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-archivo font-semibold text-foreground">
                  {folder.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {folder.count} documentos
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {folder.lastUpdated}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Documents */}
      <Card className="p-6">
        <h2 className="text-xl font-archivo font-semibold text-foreground mb-4">
          Documentos Recentes
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Certidão_{i}.pdf
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Carregado há {i} dias
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
