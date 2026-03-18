import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  funerariaId: string;
}

export function NotificationBell({ funerariaId }: NotificationBellProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const loadContacts = async () => {
    const { data } = await supabase
      .from("funeraria_contacts")
      .select("id, name, email, message, is_read, created_at")
      .eq("funeraria_id", funerariaId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setContacts(data);
      setUnreadCount(data.filter((c) => !c.is_read).length);
    }
  };

  useEffect(() => {
    if (funerariaId) loadContacts();
  }, [funerariaId]);

  // Realtime subscription
  useEffect(() => {
    if (!funerariaId) return;

    const channel = supabase
      .channel("contacts-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "funeraria_contacts",
          filter: `funeraria_id=eq.${funerariaId}`,
        },
        () => {
          loadContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [funerariaId]);

  const markAsRead = async (contactId: string) => {
    await supabase
      .from("funeraria_contacts")
      .update({ is_read: true })
      .eq("id", contactId);
    loadContacts();
  };

  const markAllAsRead = async () => {
    await supabase
      .from("funeraria_contacts")
      .update({ is_read: true })
      .eq("funeraria_id", funerariaId)
      .eq("is_read", false);
    loadContacts();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Sem notificações
            </p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className={`px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                  !contact.is_read ? "bg-primary/5" : ""
                }`}
                onClick={() => {
                  if (!contact.is_read) markAsRead(contact.id);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!contact.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium text-foreground truncate">
                        {contact.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {contact.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(contact.created_at), {
                      addSuffix: true,
                      locale: pt,
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
