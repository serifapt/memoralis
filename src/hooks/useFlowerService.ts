import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export interface Funeraria {
  id: string;
  user_id: string;
  nome_comercial: string;
  servico_flores_ativo: boolean;
  flores_limite_horas: number;
}

export interface FlowerProduct {
  id: string;
  funeraria_id: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  category: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FlowerOrder {
  id: string;
  obituary_id: string;
  funeraria_id: string;
  sender_name: string;
  sender_email: string | null;
  sender_phone: string | null;
  message: string | null;
  observations: string | null;
  subtotal: number;
  commission_percent: number;
  commission_value: number;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FlowerOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  product_price_snapshot: number;
  quantity: number;
  line_total: number;
}

export const FLOWER_CATEGORIES = [
  "Coroas",
  "Ramos",
  "Arranjos",
  "Outros"
] as const;

export const ORDER_STATUSES = {
  PENDENTE: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMADO: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  EM_PREPARACAO: { label: "Em Preparação", color: "bg-purple-100 text-purple-800" },
  EM_TRANSPORTE: { label: "Em Transporte", color: "bg-orange-100 text-orange-800" },
  ENTREGUE: { label: "Entregue", color: "bg-green-100 text-green-800" },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-800" }
} as const;

export function useFlowerService() {
  const queryClient = useQueryClient();

  const { data: funeraria, isLoading: isLoadingFuneraria } = useQuery({
    queryKey: ["funeraria-flower-service"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("funerarias")
        .select("id, user_id, nome_comercial, servico_flores_ativo, flores_limite_horas")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Funeraria | null;
    }
  });

  const isFlowerServiceActive = funeraria?.servico_flores_ativo ?? false;

  const toggleFlowerService = useCallback(async () => {
    if (!funeraria?.id) return false;

    const newValue = !funeraria.servico_flores_ativo;
    const { error } = await supabase
      .from("funerarias")
      .update({ servico_flores_ativo: newValue })
      .eq("id", funeraria.id);

    if (error) {
      console.error("Error toggling flower service:", error);
      return false;
    }

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["funeraria-flower-service"] });
    return true;
  }, [funeraria, queryClient]);

  return {
    funeraria,
    isLoadingFuneraria,
    isFlowerServiceActive,
    funerariaId: funeraria?.id,
    toggleFlowerService
  };
}

export function useFlowerProducts(funerariaId: string | undefined) {
  return useQuery({
    queryKey: ["flower-products", funerariaId],
    queryFn: async () => {
      if (!funerariaId) return [];

      const { data, error } = await supabase
        .from("flower_products")
        .select("*")
        .eq("funeraria_id", funerariaId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as FlowerProduct[];
    },
    enabled: !!funerariaId
  });
}

export function useFlowerOrders(funerariaId: string | undefined) {
  return useQuery({
    queryKey: ["flower-orders", funerariaId],
    queryFn: async () => {
      if (!funerariaId) return [];

      const { data, error } = await supabase
        .from("flower_orders")
        .select("*")
        .eq("funeraria_id", funerariaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FlowerOrder[];
    },
    enabled: !!funerariaId
  });
}

export function useFlowerOrderItems(orderId: string | undefined) {
  return useQuery({
    queryKey: ["flower-order-items", orderId],
    queryFn: async () => {
      if (!orderId) return [];

      const { data, error } = await supabase
        .from("flower_order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) throw error;
      return data as FlowerOrderItem[];
    },
    enabled: !!orderId
  });
}

export function usePlatformConfig(key: string) {
  return useQuery({
    queryKey: ["platform-config", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_config")
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (error) throw error;
      return data?.value ?? null;
    }
  });
}

export function usePublicFlowerProducts(funerariaId: string | undefined) {
  return useQuery({
    queryKey: ["public-flower-products", funerariaId],
    queryFn: async () => {
      if (!funerariaId) return [];

      const { data, error } = await supabase
        .from("flower_products")
        .select("*")
        .eq("funeraria_id", funerariaId)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as FlowerProduct[];
    },
    enabled: !!funerariaId
  });
}

/**
 * Returns whether the funeraria can accept flower orders publicly.
 * Requires: servico_flores_ativo=true AND stripe_charges_enabled=true
 */
export function useFunerariaFlowerStatus(funerariaId: string | undefined) {
  return useQuery({
    queryKey: ["funeraria-flower-status-public", funerariaId],
    queryFn: async () => {
      if (!funerariaId) return null;
      const { data, error } = await supabase
        .from("funerarias")
        .select("servico_flores_ativo, stripe_charges_enabled, flores_limite_horas")
        .eq("id", funerariaId)
        .maybeSingle();
      if (error) throw error;
      return data as {
        servico_flores_ativo: boolean;
        stripe_charges_enabled: boolean;
        flores_limite_horas: number;
      } | null;
    },
    enabled: !!funerariaId,
  });
}
