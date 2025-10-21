import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegisterStep2Props {
  onComplete: (documents: any[]) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function RegisterStep2({ onComplete, onBack, isSubmitting }: RegisterStep2Props) {
  const [documents, setDocuments] = useState<any[]>([]);

  const handleFileUpload = (tipo: string, file: File, metadata: any) => {
    setDocuments((prev) => [
      ...prev.filter((d) => d.tipo !== tipo),
      { tipo, file, ...metadata },
    ]);
  };

  const handleCodigoSubmit = (tipo: string, codigo: string, metadata: any) => {
    setDocuments((prev) => [
      ...prev.filter((d) => d.tipo !== tipo),
      { tipo, codigo_acesso: codigo, ...metadata },
    ]);
  };

  const canSubmit = documents.length >= 1;

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Envie pelo menos 1 documento para verificação. Formatos aceites: PDF, JPG, PNG (máx. 10 MB por ficheiro).
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <DocumentUploadCard
          tipo="licenca_atividade"
          title="Licença de Atividade Funerária"
          description="Documento emitido pela entidade competente"
          onUpload={handleFileUpload}
          hasDocument={documents.some((d) => d.tipo === "licenca_atividade")}
        />

        <Card className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certidão Permanente
          </h3>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="codigo">Código de Acesso</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <DocumentUploadCard
                tipo="certidao_permanente_upload"
                title=""
                description="Upload da certidão permanente"
                onUpload={handleFileUpload}
                hasDocument={documents.some((d) => d.tipo === "certidao_permanente_upload")}
                compact
              />
            </TabsContent>
            <TabsContent value="codigo">
              <CodigoAcessoForm
                tipo="certidao_permanente_codigo"
                onSubmit={handleCodigoSubmit}
                hasDocument={documents.some((d) => d.tipo === "certidao_permanente_codigo")}
              />
            </TabsContent>
          </Tabs>
        </Card>

        <DocumentUploadCard
          tipo="inicio_atividade_at"
          title="Declaração de Início de Atividade (AT)"
          description="Documento da Autoridade Tributária"
          onUpload={handleFileUpload}
          hasDocument={documents.some((d) => d.tipo === "inicio_atividade_at")}
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={isSubmitting}
        >
          Voltar
        </Button>
        <Button
          type="button"
          onClick={() => onComplete(documents)}
          className="flex-1"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? "A submeter..." : "Submeter para verificação"}
        </Button>
      </div>
    </div>
  );
}

function DocumentUploadCard({
  tipo,
  title,
  description,
  onUpload,
  hasDocument,
  compact = false,
}: any) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    numero_documento: "",
    entidade_emissora: "",
    data_emissao: "",
    data_validade: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Ficheiro demasiado grande. Máximo 10 MB.");
        return;
      }
      setFile(selectedFile);
      onUpload(tipo, selectedFile, metadata);
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="flex-1"
          />
          {hasDocument && <span className="text-green-600">✓</span>}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-medium mb-1 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="flex-1"
              />
              {hasDocument && <span className="text-green-600 font-medium">✓ Enviado</span>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CodigoAcessoForm({ tipo, onSubmit, hasDocument }: any) {
  const [codigo, setCodigo] = useState("");
  const [metadata, setMetadata] = useState({
    numero_documento: "",
    entidade_emissora: "Conservatória do Registo Comercial",
    data_emissao: "",
    data_validade: "",
  });

  const handleSubmit = () => {
    if (codigo.trim()) {
      onSubmit(tipo, codigo, metadata);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="codigo">Código de Acesso</Label>
        <Input
          id="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="XXXX-XXXX-XXXX"
        />
      </div>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!codigo.trim()}
        className="w-full"
      >
        {hasDocument ? "Atualizar" : "Guardar Código"}
      </Button>
      {hasDocument && <p className="text-sm text-green-600">✓ Código guardado</p>}
    </div>
  );
}
