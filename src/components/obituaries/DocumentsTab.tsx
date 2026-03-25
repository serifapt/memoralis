import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, Trash2, FileText, Edit2, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
import { fillPdfForm, TEMPLATE_FILES, type ObituaryFormData } from "@/lib/pdf-form-filler";

// Formulários oficiais da Segurança Social
const AUTO_DOCUMENT_TYPES = [
  { 
    id: "rp5033", 
    name: "RP-5033 — Subsídio de Funeral",
    description: "Requerimento de subsídio por morte para despesas de funeral",
    requiredFields: ["fullName", "deathDate", "familyName"]
  },
  { 
    id: "rp5075", 
    name: "RP-5075 — Prestações por Morte",
    description: "Pedido de prestações por morte (pensão de sobrevivência)",
    requiredFields: ["fullName", "deathDate", "familyName"]
  },
  { 
    id: "mg14", 
    name: "MG-14 — Registo/Alteração de IBAN",
    description: "Registo ou alteração de IBAN para recebimento de prestações",
    requiredFields: ["familyName", "familyNiss"]
  },
  { 
    id: "rp5018", 
    name: "RP-5018 — Prestações por Morte (Regime não contributivo)",
    description: "Prestações por morte para regime não contributivo",
    requiredFields: ["fullName", "deathDate", "familyName"]
  },
  { 
    id: "rp5076", 
    name: "RP-5076 — Reembolso Despesas de Funeral",
    description: "Pedido de reembolso de despesas de funeral",
    requiredFields: ["fullName", "deathDate", "familyName"]
  },
  { 
    id: "rp5077", 
    name: "RP-5077 — Pedido de Pensão à Instituição Estrangeira",
    description: "Pedido de pensão a instituição de segurança social estrangeira",
    requiredFields: ["fullName", "deathDate"]
  },
  { 
    id: "rp5078", 
    name: "RP-5078 — Declaração Ato de Responsabilidade de Terceiro",
    description: "Declaração quando o falecimento resulta de ato de terceiro",
    requiredFields: ["fullName", "deathDate"]
  },
  { 
    id: "rp5083", 
    name: "RP-5083 — Situação União de Facto",
    description: "Declaração de situação de união de facto",
    requiredFields: ["fullName", "familyName"]
  },
  { 
    id: "rv1017", 
    name: "RV-1017 — Identificação Cidadão Estrangeiro",
    description: "Formulário de identificação para cidadãos estrangeiros",
    requiredFields: ["fullName"]
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
  obituaryData: any;
}

export function DocumentsTab({ obituaryId, obituaryData }: DocumentsTabProps) {
  const { toast } = useToast();
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [autoDocs, setAutoDocs] = useState<AutoDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);

  useEffect(() => {
    loadUploadedDocuments();
    initializeAutoDocuments();
  }, [obituaryId]);

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

  const initializeAutoDocuments = () => {
    const docs: AutoDocument[] = AUTO_DOCUMENT_TYPES.map((type) => ({
      type: type.id,
      name: type.name,
      description: type.description,
      status: "not_generated",
    }));
    setAutoDocs(docs);
  };

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!uploadTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o documento",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Ficheiro muito grande",
          description: `${file.name} excede o limite de 10MB`,
          variant: "destructive",
        });
        continue;
      }

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

      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbError } = await (supabase as any)
        .from("obituary_documents")
        .insert({
          obituary_id: obituaryId,
          document_name: uploadTitle.trim(),
          document_type: "uploaded",
          file_path: filePath,
          file_size: file.size,
          uploaded_by: user?.id || "",
          notes: uploadNotes.trim() || null,
          is_required: false,
        });

      if (dbError) {
        toast({
          title: "Erro ao guardar documento",
          description: dbError.message,
          variant: "destructive",
        });
        await supabase.storage.from("obituary-documents").remove([filePath]);
        continue;
      }
    }

    setIsUploading(false);
    loadUploadedDocuments();
    
    setUploadTitle("");
    setUploadNotes("");
    toast({
      title: "Upload concluído",
      description: "Documentos carregados com sucesso",
    });

    event.target.value = "";
  };

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

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (docId: string, filePath: string) => {
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

  const checkRequiredFields = (docType: typeof AUTO_DOCUMENT_TYPES[0]) => {
    const missingFields = docType.requiredFields.filter(
      (field) => !obituaryData[field] || obituaryData[field] === ""
    );
    return missingFields;
  };

  // Download original blank template
  const handleDownloadTemplate = (docTypeId: string) => {
    const templatePath = TEMPLATE_FILES[docTypeId];
    if (!templatePath) return;
    
    const a = document.createElement("a");
    a.href = templatePath;
    a.download = templatePath.split('/').pop() || 'template.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Generate filled PDF using pdf-lib
  const handleGenerateAutoDoc = async (docType: string) => {
    const docConfig = AUTO_DOCUMENT_TYPES.find((d) => d.id === docType);
    if (!docConfig) return;

    const missingFields = checkRequiredFields(docConfig);
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios em falta",
        description: `Por favor preencha: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setGeneratingDoc(docType);

    try {
      // Map obituaryData to ObituaryFormData
      const formDataForPdf: ObituaryFormData = {
        fullName: obituaryData.fullName || '',
        birthDate: obituaryData.birthDate || '',
        deathDate: obituaryData.deathDate || '',
        deathTime: obituaryData.deathTime || '',
        birthPlace: obituaryData.birthPlace || '',
        nationality: obituaryData.nationality || '',
        civilStatus: obituaryData.civilStatus || '',
        profession: obituaryData.profession || '',
        taxId: obituaryData.taxId || '',
        socialSecurity: obituaryData.socialSecurity || '',
        deathLocation: obituaryData.deathLocation || '',
        cause: obituaryData.cause || '',
        doctor: obituaryData.doctor || '',
        beneficiary: obituaryData.beneficiary || '',
        idCard: obituaryData.idCard || '',
        familyName: obituaryData.familyName || '',
        familyRelationship: obituaryData.familyRelationship || '',
        familyEmail: obituaryData.familyEmail || '',
        familyPhone: obituaryData.familyPhone || '',
        familyNif: obituaryData.familyNif || '',
        familyNiss: obituaryData.familyNiss || '',
        familyNaturalidade: obituaryData.familyNaturalidade || '',
        familyIban: obituaryData.familyIban || '',
        familyAddress: obituaryData.familyAddress || '',
        familyLocality: obituaryData.familyLocality || '',
        familyPostalCode: obituaryData.familyPostalCode || '',
        familyBirthDate: obituaryData.familyBirthDate || '',
        familyCivilStatus: obituaryData.familyCivilStatus || '',
        familyIdCard: obituaryData.familyIdCard || '',
      };

      // Fill the PDF form
      const pdfBlob = await fillPdfForm(docType, formDataForPdf);

      // Upload to storage
      const fileName = `${docType}_${obituaryId}_${Date.now()}.pdf`;
      const filePath = `${obituaryId}/auto/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("obituary-documents")
        .upload(filePath, pdfBlob);

      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbError } = await (supabase as any)
        .from("obituary_documents")
        .insert({
          obituary_id: obituaryId,
          document_name: docConfig.name,
          document_type: docType,
          file_path: filePath,
          file_size: pdfBlob.size,
          uploaded_by: user?.id || "",
          notes: "Gerado automaticamente com dados do processo",
          is_required: false,
        });

      if (dbError) throw dbError;

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
    } finally {
      setGeneratingDoc(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-8 max-w-full">
      {/* Secção: Uploads de Documentos */}
      <Card className="p-4 md:p-6 max-w-full overflow-hidden">
        <h2 className="text-xl font-archivo font-semibold mb-6">
          Uploads de Documentos
        </h2>

        <div className="mb-6 space-y-4">
          <div>
            <Label htmlFor="upload-title">Título do Documento*</Label>
            <Input
              id="upload-title"
              placeholder="Ex: Bilhete de Identidade, Certidão de Nascimento..."
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="upload-notes">Notas (opcional)</Label>
            <Textarea
              id="upload-notes"
              placeholder="Adicione observações sobre este documento..."
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors mt-6">
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
            disabled={isUploading || !uploadTitle.trim()}
          />
        </div>

        {uploadedDocs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos Adicionados</h3>
            <div className="space-y-3">
              {uploadedDocs.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {editingDocId === doc.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-8"
                            placeholder="Título do documento"
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
                          <FileText className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold">{doc.document_name}</h4>
                        </div>
                      )}
                      
                      {doc.notes && (
                        <p className="text-sm text-muted-foreground pl-7">
                          {doc.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pl-7">
                        <span>
                          {new Date(doc.uploaded_at).toLocaleDateString("pt-PT")} às{" "}
                          {new Date(doc.uploaded_at).toLocaleTimeString("pt-PT", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span>{(doc.file_size / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleEditTitle(doc.id, doc.document_name)
                        }
                        title="Editar título"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDownload(doc.file_path, doc.document_name)
                        }
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" title="Remover">
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
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {uploadedDocs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum documento carregado ainda. Preencha o título e faça upload do primeiro documento.
          </p>
        )}
      </Card>

      {/* Secção: Formulários da Segurança Social */}
      <Card className="p-4 md:p-6 max-w-full overflow-hidden">
        <h2 className="text-xl font-archivo font-semibold mb-2">
          Formulários da Segurança Social
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Formulários oficiais pré-preenchidos automaticamente com os dados do processo de óbito.
          Pode descarregar o modelo original em branco ou gerar o formulário preenchido.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {AUTO_DOCUMENT_TYPES.map((docType) => {
            const missingFields = checkRequiredFields(docType);
            const hasAllFields = missingFields.length === 0;
            const isGenerated = uploadedDocs.some(
              (d) => d.document_type === docType.id
            );
            const isGenerating = generatingDoc === docType.id;

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
                    disabled={!hasAllFields || isGenerating}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isGenerating ? "A gerar..." : isGenerated ? "Regerar" : "Gerar Preenchido"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadTemplate(docType.id)}
                    title="Descarregar modelo em branco"
                  >
                    <Download className="w-4 h-4" />
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
                      title="Descarregar preenchido"
                    >
                      <FileText className="w-4 h-4" />
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
