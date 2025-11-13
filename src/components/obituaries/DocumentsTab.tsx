import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Download, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentsTabProps {
  obituaryId: string;
}

export const DocumentsTab = ({ obituaryId }: DocumentsTabProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentNotes, setDocumentNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
    fetchTemplates();
  }, [obituaryId]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("obituary_documents")
      .select("*")
      .eq("obituary_id", obituaryId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      setDocuments(data || []);
    }
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("document_templates")
      .select("*")
      .eq("is_active", true)
      .order("template_category", { ascending: false })
      .order("template_name", { ascending: true });

    if (error) {
      console.error("Error fetching templates:", error);
    } else {
      setTemplates(data || []);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill document name with file name if empty
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um ficheiro e dê-lhe um nome.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${obituaryId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("obituary-documents")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Save document metadata
      const { error: dbError } = await supabase
        .from("obituary_documents")
        .insert({
          obituary_id: obituaryId,
          document_name: documentName,
          document_type: selectedFile.type,
          file_path: fileName,
          file_size: selectedFile.size,
          uploaded_by: user.id,
          notes: documentNotes || null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Documento carregado",
        description: "O documento foi carregado com sucesso.",
      });

      // Reset form
      setSelectedFile(null);
      setDocumentName("");
      setDocumentNotes("");
      fetchDocuments();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast({
        title: "Erro ao carregar documento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("obituary-documents")
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({
        title: "Erro ao descarregar documento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (documentId: string, filePath: string) => {
    if (!confirm("Tem certeza que deseja eliminar este documento?")) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("obituary-documents")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("obituary_documents")
        .delete()
        .eq("id", documentId);

      if (dbError) throw dbError;

      toast({
        title: "Documento eliminado",
        description: "O documento foi eliminado com sucesso.",
      });

      fetchDocuments();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        title: "Erro ao eliminar documento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const obrigatoriasTemplates = templates.filter((t) => t.template_category === "obrigatoria");
  const complementaresTemplates = templates.filter((t) => t.template_category === "complementar");

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Carregar Documento</CardTitle>
          <CardDescription>
            Faça upload de documentos relacionados com este óbito
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Ficheiro *</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Ficheiro selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentName">Nome do Documento *</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Ex: Certificado Médico de Óbito"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNotes">Notas (opcional)</Label>
            <Textarea
              id="documentNotes"
              value={documentNotes}
              onChange={(e) => setDocumentNotes(e.target.value)}
              placeholder="Observações sobre este documento..."
              disabled={uploading}
              rows={3}
            />
          </div>

          <Button onClick={handleUpload} disabled={uploading || !selectedFile || !documentName}>
            {uploading ? (
              <>A carregar...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Carregar Documento
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Carregados</CardTitle>
          <CardDescription>
            {documents.length} documento{documents.length !== 1 ? "s" : ""} carregado{documents.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Ainda não foram carregados documentos para este óbito.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{doc.document_name}</p>
                      {doc.notes && (
                        <p className="text-sm text-muted-foreground truncate">{doc.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.uploaded_at).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc.file_path, doc.document_name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(doc.id, doc.file_path)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Certidões e Documentos Necessários</CardTitle>
          <CardDescription>
            Lista de documentos obrigatórios e complementares para este processo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="obrigatorias" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="obrigatorias">
                Obrigatórias ({obrigatoriasTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="complementares">
                Complementares ({complementaresTemplates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="obrigatorias" className="space-y-3 mt-4">
              {obrigatoriasTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma certidão obrigatória definida.
                </p>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Certidões obrigatórias para o processo de óbito
                  </AlertDescription>
                </Alert>
              )}
              {obrigatoriasTemplates.map((template) => (
                <Card key={template.id} className="border-l-4 border-l-primary">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{template.template_name}</CardTitle>
                    <CardDescription className="text-xs">
                      Documento obrigatório - Template disponível
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="complementares" className="space-y-3 mt-4">
              {complementaresTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma certidão complementar definida.
                </p>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Certidões complementares que podem ser necessárias
                  </AlertDescription>
                </Alert>
              )}
              {complementaresTemplates.map((template) => (
                <Card key={template.id} className="border-l-4 border-l-secondary">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{template.template_name}</CardTitle>
                    <CardDescription className="text-xs">
                      Documento complementar - Template disponível
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
