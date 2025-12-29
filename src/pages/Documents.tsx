import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/alert-dialog";
import { Upload, Download, Trash2, FileText, Pencil, X, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface GeneralDocument {
  id: string;
  document_name: string;
  file_path: string;
  file_size: number | null;
  notes: string | null;
  uploaded_at: string;
}

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Documents() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [documents, setDocuments] = useState<GeneralDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [funerariaId, setFunerariaId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form state
  const [docTitle, setDocTitle] = useState("");
  const [docNotes, setDocNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<GeneralDocument | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Utilizador não autenticado",
          variant: "destructive",
        });
        return;
      }
      
      setUserId(user.id);
      
      // Get funeraria
      const { data: funeraria, error: funerariaError } = await supabase
        .from("funerarias")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (funerariaError) throw funerariaError;
      
      if (funeraria) {
        setFunerariaId(funeraria.id);
        await loadDocuments(funeraria.id);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async (funId: string) => {
    try {
      const { data, error } = await supabase
        .from("funeraria_general_docs")
        .select("*")
        .eq("funeraria_id", funId)
        .order("uploaded_at", { ascending: false });
        
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de ficheiro não permitido",
        description: "Apenas PDF, DOC, DOCX, JPG e PNG são permitidos.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Ficheiro muito grande",
        description: "O tamanho máximo permitido é 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de ficheiro não permitido",
        description: "Apenas PDF, DOC, DOCX, JPG e PNG são permitidos.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Ficheiro muito grande",
        description: "O tamanho máximo permitido é 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!docTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o documento.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedFile) {
      toast({
        title: "Ficheiro obrigatório",
        description: "Por favor, selecione um ficheiro para carregar.",
        variant: "destructive",
      });
      return;
    }
    
    if (!funerariaId || !userId) {
      toast({
        title: "Erro",
        description: "Funerária não encontrada.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("funeraria-general-docs")
        .upload(fileName, selectedFile);
        
      if (uploadError) throw uploadError;
      
      // Save to database
      const { error: dbError } = await supabase
        .from("funeraria_general_docs")
        .insert({
          funeraria_id: funerariaId,
          document_name: docTitle.trim(),
          file_path: fileName,
          file_size: selectedFile.size,
          notes: docNotes.trim() || null,
        });
        
      if (dbError) throw dbError;
      
      toast({
        title: "Sucesso",
        description: "Documento carregado com sucesso!",
      });
      
      // Reset form
      setDocTitle("");
      setDocNotes("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Reload documents
      await loadDocuments(funerariaId);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: GeneralDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from("funeraria-general-docs")
        .download(doc.file_path);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.document_name + "." + doc.file_path.split(".").pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Erro",
        description: "Erro ao descarregar o documento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (doc: GeneralDocument) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete || !funerariaId) return;
    
    try {
      // Delete from storage
      await supabase.storage
        .from("funeraria-general-docs")
        .remove([documentToDelete.file_path]);
      
      // Delete from database
      const { error } = await supabase
        .from("funeraria_general_docs")
        .delete()
        .eq("id", documentToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Documento eliminado com sucesso!",
      });
      
      await loadDocuments(funerariaId);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar o documento.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleEditStart = (doc: GeneralDocument) => {
    setEditingId(doc.id);
    setEditingTitle(doc.document_name);
  };

  const handleEditSave = async (docId: string) => {
    if (!editingTitle.trim() || !funerariaId) return;
    
    try {
      const { error } = await supabase
        .from("funeraria_general_docs")
        .update({ document_name: editingTitle.trim() })
        .eq("id", docId);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Título atualizado!",
      });
      
      setEditingId(null);
      await loadDocuments(funerariaId);
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o título.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-archivo font-bold text-foreground">
          Documentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestão de documentos gerais da funerária
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6 border-dashed">
        <h2 className="text-xl font-archivo font-semibold text-foreground mb-4">
          Uploads de Documentos
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="docTitle">Título do Documento*</Label>
            <Input
              id="docTitle"
              placeholder="Ex: Bilhete de Identidade, Certidão de Nascimento..."
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="docNotes">Notas (opcional)</Label>
            <Textarea
              id="docNotes"
              placeholder="Adicione observações sobre este documento..."
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          {/* Drop Zone */}
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">
              {selectedFile ? selectedFile.name : "Arraste ficheiros ou clique para fazer upload"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, DOC, DOCX, JPG, PNG (máx. 10MB por ficheiro)
            </p>
          </div>
          
          {selectedFile && (
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={isUploading || !docTitle.trim() || !selectedFile}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A carregar...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Carregar Documento
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Documents List */}
      <Card className="p-6">
        <h2 className="text-xl font-archivo font-semibold text-foreground mb-4">
          Documentos Carregados
        </h2>
        
        {documents.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum documento carregado ainda. Preencha o título e faça upload do primeiro documento.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {editingId === doc.id ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="h-8 w-48"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(doc.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground">{doc.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>
                    {format(new Date(doc.uploaded_at), "dd MMM yyyy", { locale: pt })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === doc.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSave(doc.id)}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStart(doc)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(doc)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. O documento "{documentToDelete?.document_name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
