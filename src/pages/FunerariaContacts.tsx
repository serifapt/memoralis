import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Mail,
  Phone,
  Search,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Reply,
  CheckCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";

interface Contact {
  id: string;
  funeraria_id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const FunerariaContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [funerariaId, setFunerariaId] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (!funerariaId) return;
    const channel = supabase
      .channel("contacts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "funeraria_contacts",
          filter: `funeraria_id=eq.${funerariaId}`,
        },
        () => loadContacts()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [funerariaId]);

  const loadContacts = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: funeraria } = await supabase
      .from("funerarias")
      .select("id")
      .eq("user_id", userData.user.id)
      .single();

    if (!funeraria) return;
    setFunerariaId(funeraria.id);

    const { data, error } = await supabase
      .from("funeraria_contacts")
      .select("*")
      .eq("funeraria_id", funeraria.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar contactos");
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  const toggleRead = async (id: string, currentRead: boolean) => {
    const { error } = await supabase
      .from("funeraria_contacts")
      .update({ is_read: !currentRead })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar contacto");
    } else {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_read: !currentRead } : c))
      );
    }
  };

  const bulkMarkRead = async (read: boolean) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from("funeraria_contacts")
      .update({ is_read: read })
      .in("id", ids);
    if (error) {
      toast.error("Erro ao atualizar contactos");
    } else {
      setContacts((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, is_read: read } : c))
      );
      setSelectedIds(new Set());
      toast.success(`${ids.length} contacto(s) atualizado(s)`);
    }
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from("funeraria_contacts")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao apagar contacto");
    } else {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contacto apagado");
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from("funeraria_contacts")
      .delete()
      .in("id", ids);
    if (error) {
      toast.error("Erro ao apagar contactos");
    } else {
      setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
      setSelectedIds(new Set());
      toast.success(`${ids.length} contacto(s) apagado(s)`);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const searchLower = search.toLowerCase();
  const filtered = contacts.filter((c) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !c.is_read) ||
      (filter === "read" && c.is_read);
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.phone.toLowerCase().includes(searchLower) ||
      c.message.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  const unreadCount = contacts.filter((c) => !c.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-muted-foreground text-sm">
            {contacts.length} contacto(s) · {unreadCount} não lido(s)
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="unread">
              Não lidos
              {unreadCount > 0 && (
                <Badge className="ml-1.5 h-5 min-w-5 px-1" variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Lidos</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, email, telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selecionado(s)
          </span>
          <Button size="sm" variant="outline" onClick={() => bulkMarkRead(true)}>
            <CheckCheck className="h-4 w-4 mr-1" /> Marcar como lido
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkMarkRead(false)}>
            <EyeOff className="h-4 w-4 mr-1" /> Marcar como não lido
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-4 w-4 mr-1" /> Apagar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apagar {selectedIds.size} contacto(s)?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser revertida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={bulkDelete}>Apagar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">A carregar...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || filter !== "all"
            ? "Nenhum contacto encontrado com esses filtros."
            : "Ainda não recebeu nenhum contacto."}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead className="hidden xl:table-cell">Mensagem</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-10">Estado</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <>
                  <TableRow
                    key={contact.id}
                    className={`cursor-pointer ${!contact.is_read ? "bg-primary/5 font-medium" : ""}`}
                    onClick={() =>
                      setExpandedId(expandedId === contact.id ? null : contact.id)
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(contact.id)}
                        onCheckedChange={() => toggleSelect(contact.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!contact.is_read && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        {contact.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{contact.phone}</TableCell>
                    <TableCell className="hidden xl:table-cell max-w-[200px] truncate">
                      {contact.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(contact.created_at), "dd MMM yyyy, HH:mm", {
                        locale: pt,
                      })}
                    </TableCell>
                    <TableCell>
                      {contact.is_read ? (
                        <Badge variant="secondary" className="text-xs">Lido</Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">Novo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {expandedId === contact.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedId === contact.id && (
                    <TableRow key={`${contact.id}-detail`}>
                      <TableCell colSpan={8} className="bg-muted/30">
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-primary hover:underline"
                              >
                                {contact.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a
                                href={`tel:${contact.phone}`}
                                className="text-primary hover:underline"
                              >
                                {contact.phone}
                              </a>
                            </div>
                            <div className="text-muted-foreground">
                              {format(new Date(contact.created_at), "EEEE, dd MMMM yyyy 'às' HH:mm", {
                                locale: pt,
                              })}
                            </div>
                          </div>
                          <div className="bg-background p-4 rounded-lg border">
                            <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `mailto:${contact.email}?subject=${encodeURIComponent("Re: Contacto via Memoralis")}&body=${encodeURIComponent(`Olá ${contact.name},\n\nObrigado pelo seu contacto.\n\n`)}`,
                                  "_self"
                                );
                              }}
                            >
                              <Reply className="h-4 w-4 mr-1" /> Responder por email
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRead(contact.id, contact.is_read);
                              }}
                            >
                              {contact.is_read ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" /> Marcar como não lido
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" /> Marcar como lido
                                </>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Apagar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apagar contacto?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    O contacto de {contact.name} será apagado permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteContact(contact.id)}
                                  >
                                    Apagar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FunerariaContacts;
