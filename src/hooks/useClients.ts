import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Client {
  id: string;
  funeraria_id: string;
  full_name: string;
  relationship_degree?: string;
  email?: string;
  phone?: string;
  nif?: string;
  niss?: string;
  nationality_place?: string;
  iban?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  dedupe_key?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  full_name: string;
  relationship_degree?: string;
  email?: string;
  phone?: string;
  nif?: string;
  niss?: string;
  nationality_place?: string;
  iban?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  birth_date?: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [funerariaId, setFunerariaId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFunerariaId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: funeraria } = await supabase
      .from("funerarias")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (funeraria) {
      setFunerariaId(funeraria.id);
      return funeraria.id;
    }
    return null;
  }, []);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const funId = funerariaId || await fetchFunerariaId();
      if (!funId) {
        setClients([]);
        return;
      }

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("funeraria_id", funId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients((data as Client[]) || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [funerariaId, fetchFunerariaId, toast]);

  const createClient = async (data: ClientFormData): Promise<Client | null> => {
    try {
      const funId = funerariaId || await fetchFunerariaId();
      if (!funId) throw new Error("Funerária não encontrada");

      const { data: newClient, error } = await supabase
        .from("clients")
        .insert({
          funeraria_id: funId,
          ...data,
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate key error
        if (error.code === "23505") {
          toast({
            title: "Cliente já existe",
            description: "Já existe um cliente com este NIF, email ou telefone",
            variant: "destructive",
          });
          return null;
        }
        throw error;
      }

      toast({
        title: "Cliente criado",
        description: "O cliente foi criado com sucesso",
      });

      await fetchClients();
      return newClient as Client;
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateClient = async (id: string, data: Partial<ClientFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente atualizado",
        description: "Os dados do cliente foram atualizados",
      });

      await fetchClients();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente eliminado",
        description: "O cliente foi eliminado com sucesso",
      });

      await fetchClients();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao eliminar cliente",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const findOrCreateClient = async (data: ClientFormData): Promise<Client | null> => {
    try {
      const funId = funerariaId || await fetchFunerariaId();
      if (!funId) throw new Error("Funerária não encontrada");

      // Generate dedupe key locally to search
      let dedupeKey: string | null = null;
      if (data.nif && data.nif.trim() !== "") {
        dedupeKey = `nif:${data.nif.toLowerCase().replace(/\s+/g, "")}`;
      } else if (data.email && data.email.trim() !== "") {
        dedupeKey = `email:${data.email.toLowerCase().trim()}`;
      } else if (data.phone && data.phone.trim() !== "") {
        dedupeKey = `phone:${data.phone.toLowerCase().replace(/\s+/g, "")}`;
      }

      // If we have a dedupe key, try to find existing client
      if (dedupeKey) {
        const { data: existingClient } = await supabase
          .from("clients")
          .select("*")
          .eq("funeraria_id", funId)
          .eq("dedupe_key", dedupeKey)
          .maybeSingle();

        if (existingClient) {
          // Update existing client with any new non-empty fields
          const updates: Partial<ClientFormData> = {};
          Object.entries(data).forEach(([key, value]) => {
            if (value && value.trim() !== "" && !existingClient[key as keyof Client]) {
              updates[key as keyof ClientFormData] = value;
            }
          });

          if (Object.keys(updates).length > 0) {
            await supabase
              .from("clients")
              .update(updates)
              .eq("id", existingClient.id);
          }

          return existingClient as Client;
        }
      }

      // Create new client
      return await createClient(data);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const searchClients = async (query: string): Promise<Client[]> => {
    try {
      const funId = funerariaId || await fetchFunerariaId();
      if (!funId) return [];

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("funeraria_id", funId)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,nif.ilike.%${query}%`)
        .order("full_name")
        .limit(10);

      if (error) throw error;
      return (data as Client[]) || [];
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    funerariaId,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    findOrCreateClient,
    searchClients,
  };
}
