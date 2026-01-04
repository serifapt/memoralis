import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ServiceTask {
  id: string;
  subscription_id: string;
  scheduled_for: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  assigned_to: string | null;
  checklist_json: unknown[];
  technician_notes: string | null;
  completed_at: string | null;
  created_at: string;
  care_subscriptions?: {
    id: string;
    care_plans: { name: string; code: string };
    memorial_locations: { 
      cemetery_name: string; 
      grave_number: string | null;
      cemetery_address: string | null;
    };
    customers: { name: string; phone: string | null };
  };
}

export interface Technician {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  regions: string[];
  active: boolean;
  created_at: string;
}

// Admin: Get all subscriptions
export function useAdminCareSubscriptions() {
  return useQuery({
    queryKey: ['admin-care-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_subscriptions')
        .select(`
          *,
          care_plans (id, code, name),
          memorial_locations (id, cemetery_name, grave_number, cemetery_address),
          customers (id, name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
}

// Admin: Get all service tasks
export function useAdminServiceTasks(filters?: { status?: string; technician_id?: string }) {
  return useQuery({
    queryKey: ['admin-service-tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('service_tasks')
        .select(`
          *,
          care_subscriptions (
            id,
            care_plans (name, code),
            memorial_locations (cemetery_name, grave_number, cemetery_address),
            customers (name, phone)
          )
        `)
        .order('scheduled_for', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.technician_id) {
        query = query.eq('assigned_to', filters.technician_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
}

// Admin: Get all technicians
export function useAdminTechnicians() {
  return useQuery({
    queryKey: ['admin-technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });
}

// Admin: Create technician
export function useCreateTechnician() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { 
      name: string; 
      email: string; 
      password: string;
      phone?: string; 
      regions?: string[];
    }) => {
      const { data: result, error } = await supabase.functions.invoke('create-technician', {
        body: data
      });

      if (error) throw error;
      if (result.error) throw new Error(result.error);
      
      return result.technician;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-technicians'] });
      toast({ title: "Técnico criado com sucesso" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao criar técnico", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
}

// Admin: Assign task to technician
export function useAssignTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskId, technicianUserId }: { taskId: string; technicianUserId: string }) => {
      const { error } = await supabase
        .from('service_tasks')
        .update({ assigned_to: technicianUserId })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-tasks'] });
      toast({ title: "Tarefa atribuída" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao atribuir tarefa", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
}

// Admin: Create service task
export function useCreateServiceTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { 
      subscription_id: string; 
      scheduled_for: string;
      assigned_to?: string;
    }) => {
      const { data: task, error } = await supabase
        .from('service_tasks')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-tasks'] });
      toast({ title: "Tarefa criada" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao criar tarefa", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
}

// Technician: Get my tasks
export function useTechnicianTasks() {
  return useQuery({
    queryKey: ['technician-tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('service_tasks')
        .select(`
          *,
          care_subscriptions (
            id,
            care_plans (name, code),
            memorial_locations (cemetery_name, grave_number, cemetery_address, section, notes),
            customers (name, phone)
          )
        `)
        .eq('assigned_to', user.id)
        .in('status', ['scheduled', 'in_progress'])
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });
}

// Technician: Update task status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskId, status, notes }: { 
      taskId: string; 
      status: 'in_progress' | 'completed';
      notes?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (notes) {
        updateData.technician_notes = notes;
      }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-service-tasks'] });
      toast({ title: "Estado atualizado" });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao atualizar estado", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
}
