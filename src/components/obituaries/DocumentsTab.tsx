import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, Trash2, FileText, Edit2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Tipos de documentos automáticos disponíveis
// Para adicionar novos documentos: adicionar aqui e criar o template correspondente
const AUTO_DOCUMENT_TYPES = [
  { 
    id: "cmo", 
    name: "Certificado Médico de Óbito (CMO)",
    description: "Certificado médico que atesta o óbito",
    requiredFields: ["fullName", "deathDate", "doctor"]
  },
  { 
    id: "registo_obito", 
    name: "Registo/Assento de Óbito",
    description: "Documento oficial de registo do óbito",
    requiredFields: ["fullName", "deathDate", "birthDate", "birthPlace"]
  },
  { 
    id: "certidao_obito", 
    name: "Certidão de Óbito",
    description: "Certidão oficial emitida pela conservatória",
    requiredFields: ["fullName", "deathDate", "deathLocation"]
  },
  { 
    id: "requisicao_inumacao", 
    name: "Requisição de Inumação/Cremação",
    description: "Autorização para inumação ou cremação",
    requiredFields: ["fullName", "deathDate", "funeralCemetery"]
  },
  { 
    id: "guia_transporte", 
    name: "Guias de Transporte",
    description: "Documento para transporte do corpo",
    requiredFields: ["fullName", "deathLocation", "funeralCemetery"]
  },
  { 
    id: "autorizacao_entidades", 
    name: "Autorizações das Entidades",
    description: "Autorizações de cemitério, conservatória, etc.",
    requiredFields: ["fullName", "deathDate"]
  },
  { 
    id: "seg_social", 
    name: "Certidões para Segurança Social",
    description: "Documentos para subsídio de funeral",
    requiredFields: ["fullName", "deathDate", "socialSecurity"]
  },
  { 
    id: "financas", 
    name: "Documentos para Finanças",
    description: "Declarações fiscais relacionadas",
    requiredFields: ["fullName", "taxId"]
  },
  { 
    id: "consulares", 
    name: "Processos Consulares",
    description: "Documentos para cidadãos estrangeiros",
    requiredFields: ["fullName", "nationality"]
  },
  { 
    id: "seguros", 
    name: "Documentos de Seguros",
    description: "Documentação para companhias de seguros",
    requiredFields: ["fullName", "deathDate"]
  },
  { 
    id: "certificado_sanitario", 
    name: "Certificados Sanitários",
    description: "Para transporte internacional ou especial",
    requiredFields: ["fullName", "deathDate", "doctor"]
  },
];

interface UploadedDocument {
  id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  notes?: string | null;
  obituary_id: string;
  is_required: boolean;
}

interface AutoDocument {
  type: string;
  name: string;
  description: string;
  status: "not_generated" | "generated" | "error";
  generatedAt?: string;
  filePath?: string;
  error?: string;
}

interface DocumentsTabProps {
  obituaryId: string;
  obituaryData: any; // Todos os dados do óbito para preencher templates
}

export function DocumentsTab({ obituaryId, obituaryData }: DocumentsTabProps) {
  const { toast } = useToast();
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [autoDocs, setAutoDocs] = useState<AutoDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Carregar documentos ao montar o componente
  useEffect(() => {
    loadUploadedDocuments();
    initializeAutoDocuments();
  }, [obituaryId]);

  // Carregar documentos uploadados da base de dados
  const loadUploadedDocuments = async () => {
    const { data, error } = await (supabase as any)
      .from("obituary_documents")
      .select("*")
      .eq("obituary_id", obituaryId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar documentos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setUploadedDocs((data as any) || []);
  };

  // Inicializar lista de documentos automáticos
  const initializeAutoDocuments = () => {
    const docs: AutoDocument[] = AUTO_DOCUMENT_TYPES.map((type) => ({
      type: type.id,
      name: type.name,
      description: type.description,
      status: "not_generated",
    }));
    setAutoDocs(docs);
  };

  // Upload de ficheiro
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Ficheiro muito grande",
          description: `${file.name} excede o limite de 10MB`,
          variant: "destructive",
        });
        continue;
      }

      // Validar tipo
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de ficheiro não permitido",
          description: `${file.name} - Apenas PDF, DOC, DOCX, JPG, PNG são permitidos`,
          variant: "destructive",
        });
        continue;
      }

      // Upload para storage
      const filePath = `${obituaryId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("obituary-documents")
        .upload(filePath, file);

      if (uploadError) {
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive",
        });
        continue;
      }

      // Obter ID do utilizador atual
      const { data: { user } } = await supabase.auth.getUser();

      // Guardar registo na base de dados
      const { error: dbError } = await (supabase as any)
        .from("obituary_documents")
        .insert({
          obituary_id: obituaryId,
          document_name: file.name,
          document_type: "uploaded",
          file_path: filePath,
          file_size: file.size,
          uploaded_by: user?.id || "",
          is_required: false,
        });

      if (dbError) {
        toast({
          title: "Erro ao guardar documento",
          description: dbError.message,
          variant: "destructive",
        });
        // Limpar ficheiro do storage se falhar guardar na DB
        await supabase.storage.from("obituary-documents").remove([filePath]);
        continue;
      }
    }

    setIsUploading(false);
    loadUploadedDocuments();
    toast({
      title: "Upload concluído",
      description: "Documentos carregados com sucesso",
    });

    // Limpar input
    event.target.value = "";
  };

  // Download de documento
  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("obituary-documents")
      .download(filePath);

    if (error) {
      toast({
        title: "Erro no download",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Criar link de download
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Remover documento
  const handleDelete = async (docId: string, filePath: string) => {
    // Remover da base de dados
    const { error: dbError } = await (supabase as any)
      .from("obituary_documents")
      .delete()
      .eq("id", docId);

    if (dbError) {
      toast({
        title: "Erro ao remover documento",
        description: dbError.message,
        variant: "destructive",
      });
      return;
    }

    // Remover do storage
    const { error: storageError } = await supabase.storage
      .from("obituary-documents")
      .remove([filePath]);

    if (storageError) {
      console.error("Erro ao remover do storage:", storageError);
    }

    loadUploadedDocuments();
    toast({
      title: "Documento removido",
      description: "Documento eliminado com sucesso",
    });
  };

  // Editar título do documento
  const handleEditTitle = (docId: string, currentName: string) => {
    setEditingDocId(docId);
    setEditingTitle(currentName);
  };

  const handleSaveTitle = async (docId: string) => {
    if (!editingTitle.trim()) {
      toast({
        title: "Título inválido",
        description: "O título não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    const { error } = await (supabase as any)
      .from("obituary_documents")
      .update({ document_name: editingTitle })
      .eq("id", docId);

    if (error) {
      toast({
        title: "Erro ao atualizar título",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setEditingDocId(null);
    setEditingTitle("");
    loadUploadedDocuments();
    toast({
      title: "Título atualizado",
      description: "Nome do documento atualizado com sucesso",
    });
  };

  const handleCancelEdit = () => {
    setEditingDocId(null);
    setEditingTitle("");
  };

  // Verificar se os campos obrigatórios estão preenchidos
  const checkRequiredFields = (docType: typeof AUTO_DOCUMENT_TYPES[0]) => {
    const missingFields = docType.requiredFields.filter(
      (field) => !obituaryData[field] || obituaryData[field] === ""
    );
    return missingFields;
  };

  // Gerar documento automático (PDF)
  const handleGenerateAutoDoc = async (docType: string) => {
    const docConfig = AUTO_DOCUMENT_TYPES.find((d) => d.id === docType);
    if (!docConfig) return;

    // Verificar campos obrigatórios
    const missingFields = checkRequiredFields(docConfig);
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios em falta",
        description: `Por favor preencha: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "A gerar documento...",
      description: "Por favor aguarde",
    });

    // Aqui seria chamado um serviço que gera o PDF
    // Por agora, criar um placeholder
    try {
      // Importar jsPDF dinamicamente
      const { default: jsPDF } = await import("jspdf");
      
      const doc = new jsPDF();
      
      // Adicionar conteúdo ao PDF baseado no tipo de documento
      doc.setFontSize(20);
      doc.text(docConfig.name, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Nome: ${obituaryData.fullName || "N/A"}`, 20, 40);
      doc.text(`Data de Óbito: ${obituaryData.deathDate || "N/A"}`, 20, 50);
      doc.text(`Data de Nascimento: ${obituaryData.birthDate || "N/A"}`, 20, 60);
      doc.text(`Local de Nascimento: ${obituaryData.birthPlace || "N/A"}`, 20, 70);
      
      // Adicionar mais campos conforme o tipo de documento
      if (docType === "cmo") {
        doc.text(`Médico: ${obituaryData.doctor || "N/A"}`, 20, 80);
        doc.text(`Causa: ${obituaryData.cause || "N/A"}`, 20, 90);
      }
      
      doc.setFontSize(10);
      doc.text(`Gerado automaticamente em ${new Date().toLocaleString("pt-PT")}`, 20, 280);
      
      // Salvar PDF
      const pdfBlob = doc.output("blob");
      const fileName = `${docType}_${obituaryId}_${Date.now()}.pdf`;
      const filePath = `${obituaryId}/auto/${fileName}`;
      
      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from("obituary-documents")
        .upload(filePath, pdfBlob);

      if (uploadError) {
        throw uploadError;
      }

      // Obter ID do utilizador atual
      const { data: { user } } = await supabase.auth.getUser();

      // Guardar registo na base de dados
      const { error: dbError } = await (supabase as any)
        .from("obituary_documents")
        .insert({
          obituary_id: obituaryId,
          document_name: docConfig.name,
          document_type: docType,
          file_path: filePath,
          file_size: pdfBlob.size,
          uploaded_by: user?.id || "",
          notes: "Gerado automaticamente",
          is_required: false,
        });

      if (dbError) {
        throw dbError;
      }

      // Atualizar estado dos documentos automáticos
      setAutoDocs((prev) =>
        prev.map((d) =>
          d.type === docType
            ? {
                ...d,
                status: "generated",
                generatedAt: new Date().toISOString(),
                filePath,
              }
            : d
        )
      );

      loadUploadedDocuments();

      toast({
        title: "Documento gerado",
        description: `${docConfig.name} criado com sucesso`,
      });
    } catch (error: any) {
      console.error("Erro ao gerar documento:", error);
      
      setAutoDocs((prev) =>
        prev.map((d) =>
          d.type === docType
            ? {
                ...d,
                status: "error",
                error: error.message,
              }
            : d
        )
      );

      toast({
        title: "Erro ao gerar documento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Secção: Uploads de Documentos */}
      <Card className="p-6">
        <h2 className="text-xl font-archivo font-semibold mb-6">
          Uploads de Documentos
        </h2>

        {/* Área de Upload */}
        <div className="mb-6">
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Arraste ficheiros ou clique para fazer upload
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX, JPG, PNG (máx. 10MB por ficheiro)
              </p>
            </div>
          </Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </div>

        {/* Lista de Documentos Uploadados */}
        {uploadedDocs.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data de Upload</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      {editingDocId === doc.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-8"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSaveTitle(doc.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>{doc.document_name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(doc.uploaded_at).toLocaleDateString("pt-PT")}
                    </TableCell>
                    <TableCell>
                      {(doc.file_size / 1024).toFixed(2)} KB
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleEditTitle(doc.id, doc.document_name)
                          }
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDownload(doc.file_path, doc.document_name)
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remover documento?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser revertida. O documento
                                será permanentemente eliminado.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(doc.id, doc.file_path)
                                }
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum documento carregado ainda
          </p>
        )}
      </Card>

      {/* Secção: Certidões e Documentos Automáticos */}
      <Card className="p-6">
        <h2 className="text-xl font-archivo font-semibold mb-6">
          Certidões e Documentos Automáticos
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Gere automaticamente documentos oficiais com base nos dados do óbito
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {AUTO_DOCUMENT_TYPES.map((docType) => {
            const autoDoc = autoDocs.find((d) => d.type === docType.id);
            const missingFields = checkRequiredFields(docType);
            const hasAllFields = missingFields.length === 0;
            const isGenerated = uploadedDocs.some(
              (d) => d.document_type === docType.id
            );

            return (
              <Card key={docType.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">{docType.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {docType.description}
                    </p>
                    {!hasAllFields && (
                      <p className="text-xs text-destructive">
                        Campos em falta: {missingFields.join(", ")}
                      </p>
                    )}
                    {isGenerated && (
                      <p className="text-xs text-green-600">
                        ✓ Documento gerado
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isGenerated ? "outline" : "default"}
                    onClick={() => handleGenerateAutoDoc(docType.id)}
                    disabled={!hasAllFields}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isGenerated ? "Regerar" : "Gerar PDF"}
                  </Button>
                  {isGenerated && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const doc = uploadedDocs.find(
                          (d) => d.document_type === docType.id
                        );
                        if (doc) {
                          handleDownload(doc.file_path, doc.document_name);
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
