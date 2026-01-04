import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CarePlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  includes_json: string[];
  display_order: number;
}

export interface CarePlanPrice {
  id: string;
  care_plan_id: string;
  billing_period: 'monthly' | 'annual';
  stripe_price_id: string | null;
  amount: number;
  currency: string;
}

export interface CarePlanWithPrices extends CarePlan {
  prices: CarePlanPrice[];
}

export interface MemorialLocation {
  id: string;
  customer_id: string;
  obituary_id: string | null;
  cemetery_name: string;
  cemetery_address: string | null;
  section: string | null;
  grave_number: string | null;
  reference_photos: string[];
  notes: string | null;
  special_dates: unknown;
  created_at: string;
  updated_at: string;
}

export interface CareSubscription {
  id: string;
  customer_id: string;
  memorial_location_id: string;
  care_plan_id: string;
  billing_period: string;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  care_plans?: { id: string; code: string; name: string };
  memorial_locations?: { id: string; cemetery_name: string; grave_number: string | null };
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  stripe_customer_id: string | null;
  notification_preferences: unknown;
  created_at: string;
  updated_at: string;
}

export function useCarePlans() {
  return useQuery({
    queryKey: ['care-plans'],
    queryFn: async (): Promise<CarePlanWithPrices[]> => {
      const { data: plans, error: plansError } = await supabase
        .from('care_plans')
        .select('*')
        .eq('active', true)
        .order('display_order');

      if (plansError) throw plansError;

      const { data: prices, error: pricesError } = await supabase
        .from('care_plan_prices')
        .select('*')
        .eq('active', true);

      if (pricesError) throw pricesError;

      return (plans || []).map(plan => ({
        ...plan,
        includes_json: plan.includes_json as string[],
        prices: (prices || []).filter(p => p.care_plan_id === plan.id) as CarePlanPrice[]
      }));
    }
  });
}

export function useCustomerProfile() {
  return useQuery({
    queryKey: ['customer-profile'],
    queryFn: async (): Promise<Customer | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });
}

export function useMemorialLocations(customerId: string | undefined) {
  return useQuery({
    queryKey: ['memorial-locations', customerId],
    queryFn: async (): Promise<MemorialLocation[]> => {
      if (!customerId) return [];

      const { data, error } = await supabase
        .from('memorial_locations')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId
  });
}

export function useCareSubscriptions(customerId: string | undefined) {
  return useQuery({
    queryKey: ['care-subscriptions', customerId],
    queryFn: async (): Promise<CareSubscription[]> => {
      if (!customerId) return [];

      const { data, error } = await supabase
        .from('care_subscriptions')
        .select(`
          *,
          care_plans (id, code, name),
          memorial_locations (id, cemetery_name, grave_number)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId
  });
}

export function useCreateCustomerProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone || null
        })
        .select()
        .single();

      if (error) throw error;

      // Assign customer role
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'customer'
      });

      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      toast({ title: "Perfil criado com sucesso" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao criar perfil", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
}

export function useCreateMemorialLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      customer_id: string;
      cemetery_name: string;
      cemetery_address?: string;
      section?: string;
      grave_number?: string;
      notes?: string;
    }) => {
      const { data: location, error } = await supabase
        .from('memorial_locations')
        .insert({
          customer_id: data.customer_id,
          cemetery_name: data.cemetery_name,
          cemetery_address: data.cemetery_address || null,
          section: data.section || null,
          grave_number: data.grave_number || null,
          notes: data.notes || null
        })
        .select()
        .single();

      if (error) throw error;
      return location;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorial-locations'] });
      toast({ title: "Local adicionado com sucesso" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao adicionar local", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
}

export function useCreateCareCheckout() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { care_plan_price_id: string; memorial_location_id: string }) => {
      const { data: result, error } = await supabase.functions.invoke('create-care-checkout', {
        body: data
      });

      if (error) throw error;
      if (result.error) throw new Error(result.error);
      
      return result;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao criar checkout", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
}

export function useOpenCustomerPortal() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: result, error } = await supabase.functions.invoke('care-customer-portal');

      if (error) throw error;
      if (result.error) throw new Error(result.error);
      
      return result;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao abrir portal", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
}
