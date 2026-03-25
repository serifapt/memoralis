import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  FileText, 
  Archive, 
  Send, 
  CheckCircle, 
  MoreVertical,
  ChevronDown,
  Eye,
  Copy,
  Trash2,
  Mail
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBudgetQuotes, BudgetQuoteStatus } from "@/hooks/useBudgetQuotes";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const statusConfig: Record<BudgetQuoteStatus, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: FileText },
  SENT: { label: "Enviado", color: "bg-blue-100 text-blue-700", icon: Send },
  ACCEPTED: { label: "Aceite", color: "bg-green-100 text-green-700", icon: CheckCircle },
  ARCHIVED: { label: "Arquivado", color: "bg-gray-100 text-gray-500", icon: Archive },
};

export default function BudgetQuotes() {
  const navigate = useNavigate();
  const { quotes, loading, fetchQuotes, updateQuoteStatus, duplicateQuote, deleteQuote } = useBudgetQuotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchQuery === "" || 
      quote.quote_number.toString().includes(searchQuery) ||
      quote.client?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.deceased_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === "archived" 
      ? quote.status === "ARCHIVED" 
      : quote.status !== "ARCHIVED";

    return matchesSearch && matchesTab;
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as "active" | "archived");
    fetchQuotes(value === "archived");
  };

  const handleDuplicate = async (id: string) => {
    const newId = await duplicateQuote(id);
    if (newId) {
      navigate(`/budgets/${newId}`);
    }
  };

  const handleDelete = async () => {
    if (quoteToDelete) {
      await deleteQuote(quoteToDelete);
      setQuoteToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleArchive = async (id: string) => {
    await updateQuoteStatus(id, "ARCHIVED");
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-archivo font-bold text-foreground">
            Orçamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de orçamentos e propostas
          </p>
        </div>
        <Link to="/budgets/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="archived">Arquivados</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Pesquisar por nº, cliente ou falecido..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quotes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">A carregar...</div>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {activeTab === "archived" 
              ? "Não existem orçamentos arquivados" 
              : "Crie o seu primeiro orçamento"}
          </p>
          {activeTab === "active" && (
            <Link to="/budgets/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((quote) => {
            const status = statusConfig[quote.status];
            const StatusIcon = status.icon;
            
            return (
              <Card key={quote.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 text-center">
                      <span className="text-lg font-bold text-primary">
                        #{quote.quote_number}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {quote.client?.full_name || "Cliente não definido"}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="focus:outline-none">
                              <Badge className={`${status.color} cursor-pointer hover:opacity-80 transition-opacity`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                                <ChevronDown className="ml-1 h-3 w-3 inline" />
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {(Object.entries(statusConfig) as [BudgetQuoteStatus, { label: string; color: string; icon: any }][]).map(([key, config]) => {
                              const Icon = config.icon;
                              return (
                                <DropdownMenuItem
                                  key={key}
                                  disabled={key === quote.status}
                                  onClick={() => updateQuoteStatus(quote.id, key)}
                                >
                                  <Badge className={`${config.color} mr-2`}>
                                    <Icon className="w-3 h-3 mr-1" />
                                    {config.label}
                                  </Badge>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        {quote.deceased_name && (
                          <span>Falecido: {quote.deceased_name}</span>
                        )}
                        <span>
                          Data: {format(new Date(quote.issue_date), "dd MMM yyyy", { locale: pt })}
                        </span>
                        <span className="font-medium text-foreground">
                          Total: {Number(quote.total_quote).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/budgets/${quote.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicate(quote.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        {quote.status !== "ARCHIVED" && (
                          <DropdownMenuItem onClick={() => handleArchive(quote.id)}>
                            <Archive className="w-4 h-4 mr-2" />
                            Arquivar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setQuoteToDelete(quote.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. O orçamento será permanentemente eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
