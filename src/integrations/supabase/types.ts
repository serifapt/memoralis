export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          acao: string
          actor_id: string
          created_at: string
          detalhes: Json | null
          entidade: string
          entidade_id: string
          id: string
        }
        Insert: {
          acao: string
          actor_id: string
          created_at?: string
          detalhes?: Json | null
          entidade: string
          entidade_id: string
          id?: string
        }
        Update: {
          acao?: string
          actor_id?: string
          created_at?: string
          detalhes?: Json | null
          entidade?: string
          entidade_id?: string
          id?: string
        }
        Relationships: []
      }
      ceremony_events: {
        Row: {
          created_at: string
          event_date: string | null
          event_time: string | null
          event_type: string
          id: string
          location: string | null
          map_link: string | null
          obituary_id: string
          responsible_name: string | null
          responsible_phone: string | null
        }
        Insert: {
          created_at?: string
          event_date?: string | null
          event_time?: string | null
          event_type: string
          id?: string
          location?: string | null
          map_link?: string | null
          obituary_id: string
          responsible_name?: string | null
          responsible_phone?: string | null
        }
        Update: {
          created_at?: string
          event_date?: string | null
          event_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          map_link?: string | null
          obituary_id?: string
          responsible_name?: string | null
          responsible_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ceremony_events_obituary_id_fkey"
            columns: ["obituary_id"]
            isOneToOne: false
            referencedRelation: "obituaries"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          funeraria_id: string
          id: string
          last_message_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          funeraria_id: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          funeraria_id?: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_funeraria_id_fkey"
            columns: ["funeraria_id"]
            isOneToOne: false
            referencedRelation: "funerarias"
            referencedColumns: ["id"]
          },
        ]
      }
      funeraria_docs: {
        Row: {
          codigo_acesso: string | null
          created_at: string
          data_emissao: string | null
          data_validade: string | null
          entidade_emissora: string | null
          estado_validacao: string
          ficheiro_path: string | null
          funeraria_id: string
          id: string
          numero_documento: string | null
          observacoes: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          codigo_acesso?: string | null
          created_at?: string
          data_emissao?: string | null
          data_validade?: string | null
          entidade_emissora?: string | null
          estado_validacao?: string
          ficheiro_path?: string | null
          funeraria_id: string
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          codigo_acesso?: string | null
          created_at?: string
          data_emissao?: string | null
          data_validade?: string | null
          entidade_emissora?: string | null
          estado_validacao?: string
          ficheiro_path?: string | null
          funeraria_id?: string
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funeraria_docs_funeraria_id_fkey"
            columns: ["funeraria_id"]
            isOneToOne: false
            referencedRelation: "funerarias"
            referencedColumns: ["id"]
          },
        ]
      }
      funerarias: {
        Row: {
          aceito_termos: boolean
          created_at: string
          declaro_representacao_legal: boolean
          id: string
          motivo_rejeicao: string | null
          nif: string
          nome_comercial: string
          responsavel_nome: string
          status: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aceito_termos?: boolean
          created_at?: string
          declaro_representacao_legal?: boolean
          id?: string
          motivo_rejeicao?: string | null
          nif: string
          nome_comercial: string
          responsavel_nome: string
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aceito_termos?: boolean
          created_at?: string
          declaro_representacao_legal?: boolean
          id?: string
          motivo_rejeicao?: string | null
          nif?: string
          nome_comercial?: string
          responsavel_nome?: string
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
          sender_type: string
          type: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
          sender_type: string
          type?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
          sender_type?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      obituaries: {
        Row: {
          beneficiary: string | null
          birth_date: string | null
          birth_place: string | null
          cause: string | null
          civil_status: string | null
          coffin_brand: string | null
          coffin_ref: string | null
          created_at: string
          death_date: string | null
          death_location: string | null
          death_time: string | null
          display_name: string
          doctor: string | null
          family_address: string | null
          family_email: string | null
          family_locality: string | null
          family_name: string | null
          family_nif: string | null
          family_observations: string | null
          family_phone: string | null
          family_postal_code: string | null
          family_relationship: string | null
          freguesia: string | null
          full_name: string
          funeraria_id: string
          hide_condolences: boolean | null
          id: string
          id_card: string | null
          is_completed: boolean
          is_public: boolean
          locality: string | null
          medical_certificate: string | null
          nationality: string | null
          observations: string | null
          photo_url: string | null
          profession: string | null
          public_message: string | null
          service_price: number | null
          service_type: string | null
          social_security: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          beneficiary?: string | null
          birth_date?: string | null
          birth_place?: string | null
          cause?: string | null
          civil_status?: string | null
          coffin_brand?: string | null
          coffin_ref?: string | null
          created_at?: string
          death_date?: string | null
          death_location?: string | null
          death_time?: string | null
          display_name: string
          doctor?: string | null
          family_address?: string | null
          family_email?: string | null
          family_locality?: string | null
          family_name?: string | null
          family_nif?: string | null
          family_observations?: string | null
          family_phone?: string | null
          family_postal_code?: string | null
          family_relationship?: string | null
          freguesia?: string | null
          full_name: string
          funeraria_id: string
          hide_condolences?: boolean | null
          id?: string
          id_card?: string | null
          is_completed?: boolean
          is_public?: boolean
          locality?: string | null
          medical_certificate?: string | null
          nationality?: string | null
          observations?: string | null
          photo_url?: string | null
          profession?: string | null
          public_message?: string | null
          service_price?: number | null
          service_type?: string | null
          social_security?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          beneficiary?: string | null
          birth_date?: string | null
          birth_place?: string | null
          cause?: string | null
          civil_status?: string | null
          coffin_brand?: string | null
          coffin_ref?: string | null
          created_at?: string
          death_date?: string | null
          death_location?: string | null
          death_time?: string | null
          display_name?: string
          doctor?: string | null
          family_address?: string | null
          family_email?: string | null
          family_locality?: string | null
          family_name?: string | null
          family_nif?: string | null
          family_observations?: string | null
          family_phone?: string | null
          family_postal_code?: string | null
          family_relationship?: string | null
          freguesia?: string | null
          full_name?: string
          funeraria_id?: string
          hide_condolences?: boolean | null
          id?: string
          id_card?: string | null
          is_completed?: boolean
          is_public?: boolean
          locality?: string | null
          medical_certificate?: string | null
          nationality?: string | null
          observations?: string | null
          photo_url?: string | null
          profession?: string | null
          public_message?: string | null
          service_price?: number | null
          service_type?: string | null
          social_security?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      obituary_relationships: {
        Row: {
          created_at: string
          id: string
          obituary_id: string
          related_obituary_id: string
          relationship_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          obituary_id: string
          related_obituary_id: string
          relationship_type: string
        }
        Update: {
          created_at?: string
          id?: string
          obituary_id?: string
          related_obituary_id?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "obituary_relationships_obituary_id_fkey"
            columns: ["obituary_id"]
            isOneToOne: false
            referencedRelation: "obituaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obituary_relationships_related_obituary_id_fkey"
            columns: ["related_obituary_id"]
            isOneToOne: false
            referencedRelation: "obituaries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: {
          admin_email: string
          admin_full_name?: string
          admin_password: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      post_message_funeraria: {
        Args: {
          p_content: string
          p_conversation_id: string
          p_sender_id: string
        }
        Returns: string
      }
      resolve_conversation_admin: {
        Args: { p_admin_id: string; p_conversation_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "funeraria"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "funeraria"],
    },
  },
} as const
