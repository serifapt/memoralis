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
      budget_quote_lines: {
        Row: {
          created_at: string
          description: string
          discount_percent: number | null
          id: string
          line_total: number
          quantity: number
          section_id: string
          sort_order: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_percent?: number | null
          id?: string
          line_total?: number
          quantity?: number
          section_id: string
          sort_order?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_percent?: number | null
          id?: string
          line_total?: number
          quantity?: number
          section_id?: string
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_quote_lines_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "budget_quote_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_quote_sections: {
        Row: {
          created_at: string
          id: string
          quote_id: string
          sort_order: number
          subtotal: number | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          quote_id: string
          sort_order?: number
          subtotal?: number | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          quote_id?: string
          sort_order?: number
          subtotal?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_quote_sections_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "budget_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_quote_settings: {
        Row: {
          created_at: string
          default_footer_text: string | null
          default_validity_days: number | null
          default_vat_exempt: boolean | null
          default_vat_reason_text: string | null
          funeraria_id: string
          id: string
          next_quote_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_footer_text?: string | null
          default_validity_days?: number | null
          default_vat_exempt?: boolean | null
          default_vat_reason_text?: string | null
          funeraria_id: string
          id?: string
          next_quote_number?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_footer_text?: string | null
          default_validity_days?: number | null
          default_vat_exempt?: boolean | null
          default_vat_reason_text?: string | null
          funeraria_id?: string
          id?: string
          next_quote_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_quote_settings_funeraria_id_fkey"
            columns: ["funeraria_id"]
            isOneToOne: true
            referencedRelation: "funerarias"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_quotes: {
        Row: {
          accepted_at: string | null
          archived_at: string | null
          cemetery: string | null
          client_id: string
          created_at: string
          death_date: string | null
          deceased_name: string | null
          footer_text: string | null
          funeral_date: string | null
          funeraria_id: string
          id: string
          issue_date: string
          last_sent_to_email: string | null
          obituary_id: string | null
          pdf_url: string | null
          place_of_death: string | null
          quote_number: number
          sent_at: string | null
          status: Database["public"]["Enums"]["budget_quote_status"]
          subtotal: number | null
          total_quote: number | null
          updated_at: string
          vat_exempt: boolean | null
          vat_exempt_reason_text: string | null
        }
        Insert: {
          accepted_at?: string | null
          archived_at?: string | null
          cemetery?: string | null
          client_id: string
          created_at?: string
          death_date?: string | null
          deceased_name?: string | null
          footer_text?: string | null
          funeral_date?: string | null
          funeraria_id: string
          id?: string
          issue_date?: string
          last_sent_to_email?: string | null
          obituary_id?: string | null
          pdf_url?: string | null
          place_of_death?: string | null
          quote_number: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["budget_quote_status"]
          subtotal?: number | null
          total_quote?: number | null
          updated_at?: string
          vat_exempt?: boolean | null
          vat_exempt_reason_text?: string | null
        }
        Update: {
          accepted_at?: string | null
          archived_at?: string | null
          cemetery?: string | null
          client_id?: string
          created_at?: string
          death_date?: string | null
          deceased_name?: string | null
          footer_text?: string | null
          funeral_date?: string | null
          funeraria_id?: string
          id?: string
          issue_date?: string
          last_sent_to_email?: string | null
          obituary_id?: string | null
          pdf_url?: string | null
          place_of_death?: string | null
          quote_number?: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["budget_quote_status"]
          subtotal?: number | null
          total_quote?: number | null
          updated_at?: string
          vat_exempt?: boolean | null
          vat_exempt_reason_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_quotes_funeraria_id_fkey"
            columns: ["funeraria_id"]
            isOneToOne: false
            referencedRelation: "funerarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_quotes_obituary_id_fkey"
            columns: ["obituary_id"]
            isOneToOne: false
            referencedRelation: "obituaries"
            referencedColumns: ["id"]
          },
        ]
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
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          dedupe_key: string | null
          email: string | null
          full_name: string
          funeraria_id: string
          iban: string | null
          id: string
          nationality_place: string | null
          nif: string | null
          niss: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          relationship_degree: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          dedupe_key?: string | null
          email?: string | null
          full_name: string
          funeraria_id: string
          iban?: string | null
          id?: string
          nationality_place?: string | null
          nif?: string | null
          niss?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          relationship_degree?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          dedupe_key?: string | null
          email?: string | null
          full_name?: string
          funeraria_id?: string
          iban?: string | null
          id?: string
          nationality_place?: string | null
          nif?: string | null
          niss?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          relationship_degree?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_funeraria_id_fkey"
            columns: ["funeraria_id"]
            isOneToOne: false
            referencedRelation: "funerarias"
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
      document_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          template_category: string
          template_fields: Json
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          template_category: string
          template_fields?: Json
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          template_category?: string
          template_fields?: Json
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      flower_order_items: {
        Row: {
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          product_price_snapshot: number
          quantity: number
        }
        Insert: {
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          product_price_snapshot: number
          quantity?: number
        }
        Update: {
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          product_price_snapshot?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "flower_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "flower_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flower_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "flower_products"
            referencedColumns: ["id"]
          },
        ]
      }
      flower_orders: {
        Row: {
          commission_percent: number
          commission_value: number
          created_at: string
          funeraria_id: string
          id: string
          message: string | null
          obituary_id: string
          observations: string | null
          sender_email: string | null
          sender_name: string
          sender_phone: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          commission_percent?: number
          commission_value?: number
          created_at?: string
          funeraria_id: string
          id?: string
          message?: string | null
          obituary_id: string
          observations?: string | null
          sender_email?: string | null
          sender_name: string
          sender_phone?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          commission_value?: number
          created_at?: string
          funeraria_id?: string
          id?: string
          message?: string | null
          obituary_id?: string
          observations?: string | null
          sender_email?: string | null
          sender_name?: string
          sender_phone?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flower_orders_funeraria_id_fkey"
            columns: ["funeraria_id"]
            isOneToOne: false
            referencedRelation: "funerarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flower_orders_obituary_id_fkey"
            columns: ["obituary_id"]
            isOneToOne: false
            referencedRelation: "obituaries"
            referencedColumns: ["id"]
          },
        ]
      }
      flower_products: {
        Row: {
          category: string | null
          created_at: string
          display_order: number
          full_description: string | null
          funeraria_id: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          short_description: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_order?: number
          full_description?: string | null
          funeraria_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          short_description?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          display_order?: number
          full_description?: string | null
          funeraria_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          short_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flower_products_funeraria_id_fkey"
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
      funeraria_general_docs: {
        Row: {
          document_name: string
          file_path: string
          file_size: number | null
          funeraria_id: string
          id: string
          notes: string | null
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          document_name: string
          file_path: string
          file_size?: number | null
          funeraria_id: string
          id?: string
          notes?: string | null
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          document_name?: string
          file_path?: string
          file_size?: number | null
          funeraria_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funeraria_general_docs_funeraria_id_fkey"
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
          servico_flores_ativo: boolean
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
          servico_flores_ativo?: boolean
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
          servico_flores_ativo?: boolean
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
          responsible_client_id: string | null
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
          responsible_client_id?: string | null
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
          responsible_client_id?: string | null
          service_price?: number | null
          service_type?: string | null
          social_security?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obituaries_responsible_client_id_fkey"
            columns: ["responsible_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      obituary_documents: {
        Row: {
          document_name: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          is_required: boolean
          notes: string | null
          obituary_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          document_name: string
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          is_required?: boolean
          notes?: string | null
          obituary_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_required?: boolean
          notes?: string | null
          obituary_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "obituary_documents_obituary_id_fkey"
            columns: ["obituary_id"]
            isOneToOne: false
            referencedRelation: "obituaries"
            referencedColumns: ["id"]
          },
        ]
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
      platform_config: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
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
      generate_client_dedupe_key: {
        Args: { p_email: string; p_nif: string; p_phone: string }
        Returns: string
      }
      get_next_quote_number: {
        Args: { p_funeraria_id: string }
        Returns: number
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
      recalculate_quote_totals: {
        Args: { p_quote_id: string }
        Returns: undefined
      }
      resolve_conversation_admin: {
        Args: { p_admin_id: string; p_conversation_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "funeraria"
      budget_quote_status: "DRAFT" | "SENT" | "ACCEPTED" | "ARCHIVED"
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
      budget_quote_status: ["DRAFT", "SENT", "ACCEPTED", "ARCHIVED"],
    },
  },
} as const
