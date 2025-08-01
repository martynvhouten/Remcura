export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          practice_id: string | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          practice_id?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          practice_id?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      counting_entries: {
        Row: {
          batch_number: string | null
          confidence_level: string | null
          counted_at: string | null
          counted_by: string | null
          counted_quantity: number
          counting_session_id: string
          created_at: string | null
          expiry_date: string | null
          id: string
          location_id: string
          notes: string | null
          practice_id: string
          product_id: string
          system_quantity: number
          updated_at: string | null
          variance_quantity: number | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          batch_number?: string | null
          confidence_level?: string | null
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity: number
          counting_session_id: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location_id: string
          notes?: string | null
          practice_id: string
          product_id: string
          system_quantity: number
          updated_at?: string | null
          variance_quantity?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          batch_number?: string | null
          confidence_level?: string | null
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number
          counting_session_id?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location_id?: string
          notes?: string | null
          practice_id?: string
          product_id?: string
          system_quantity?: number
          updated_at?: string | null
          variance_quantity?: number | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counting_entries_counting_session_id_fkey"
            columns: ["counting_session_id"]
            isOneToOne: false
            referencedRelation: "counting_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counting_entries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counting_entries_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counting_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counting_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      counting_sessions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          completed_by: string | null
          count_all_products: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          location_id: string
          name: string
          practice_id: string
          product_category_filter: string | null
          products_with_variance: number | null
          specific_product_ids: string[] | null
          started_at: string | null
          started_by: string | null
          status: Database["public"]["Enums"]["counting_session_status"] | null
          total_products_counted: number | null
          total_variance_value: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          count_all_products?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location_id: string
          name: string
          practice_id: string
          product_category_filter?: string | null
          products_with_variance?: number | null
          specific_product_ids?: string[] | null
          started_at?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["counting_session_status"] | null
          total_products_counted?: number | null
          total_variance_value?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          count_all_products?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location_id?: string
          name?: string
          practice_id?: string
          product_category_filter?: string | null
          products_with_variance?: number | null
          specific_product_ids?: string[] | null
          started_at?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["counting_session_status"] | null
          total_products_counted?: number | null
          total_variance_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counting_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counting_sessions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_sessions: {
        Row: {
          accessible_locations: string[] | null
          achievements_unlocked: string[] | null
          actions_performed: Json | null
          can_extend: boolean | null
          converted_to_user_id: string | null
          created_at: string | null
          device_fingerprint: string | null
          display_emoji: string | null
          expires_at: string
          granted_permissions: Json | null
          guest_name: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity_at: string | null
          magic_invite_id: string
          practice_id: string
          restricted_features: string[] | null
          session_color: string | null
          session_token: string
          showed_upgrade_interest: boolean | null
          timezone: string | null
          updated_at: string | null
          upgrade_prompts_shown: number | null
          upgrade_trigger_action: string | null
          user_agent: string | null
        }
        Insert: {
          accessible_locations?: string[] | null
          achievements_unlocked?: string[] | null
          actions_performed?: Json | null
          can_extend?: boolean | null
          converted_to_user_id?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          display_emoji?: string | null
          expires_at: string
          granted_permissions?: Json | null
          guest_name: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          magic_invite_id: string
          practice_id: string
          restricted_features?: string[] | null
          session_color?: string | null
          session_token: string
          showed_upgrade_interest?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          upgrade_prompts_shown?: number | null
          upgrade_trigger_action?: string | null
          user_agent?: string | null
        }
        Update: {
          accessible_locations?: string[] | null
          achievements_unlocked?: string[] | null
          actions_performed?: Json | null
          can_extend?: boolean | null
          converted_to_user_id?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          display_emoji?: string | null
          expires_at?: string
          granted_permissions?: Json | null
          guest_name?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          magic_invite_id?: string
          practice_id?: string
          restricted_features?: string[] | null
          session_color?: string | null
          session_token?: string
          showed_upgrade_interest?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          upgrade_prompts_shown?: number | null
          upgrade_trigger_action?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_sessions_magic_invite_id_fkey"
            columns: ["magic_invite_id"]
            isOneToOne: false
            referencedRelation: "magic_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_sessions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_main: boolean | null
          name: string
          postal_code: string | null
          practice_id: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          name: string
          postal_code?: string | null
          practice_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          name?: string
          postal_code?: string | null
          practice_id?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      magic_invites: {
        Row: {
          ai_role_suggestions: Json | null
          allow_guest_mode: boolean | null
          auto_regenerate: boolean | null
          auto_upgrade_to_member: boolean | null
          color_theme: string | null
          contextual_welcome_message: string | null
          conversion_completed_at: string | null
          conversion_rate: number | null
          converted_to_user_id: string | null
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          deep_link: string | null
          department: string | null
          emoji_sequence: string
          expires_at: string | null
          guest_session_hours: number | null
          id: string
          is_permanent_invite: boolean | null
          last_used_at: string | null
          location_access: string[] | null
          magic_code: string
          max_uses: number | null
          onboarding_quest_enabled: boolean | null
          practice_avatar_seed: string | null
          practice_id: string
          progress_rewards: Json | null
          qr_code_data: string | null
          shared_via: string[] | null
          suggested_avatar_style: string | null
          target_role: string | null
          updated_at: string | null
          used_by: string[] | null
          view_count: number | null
          welcome_achievement: string | null
          whatsapp_link: string | null
        }
        Insert: {
          ai_role_suggestions?: Json | null
          allow_guest_mode?: boolean | null
          auto_regenerate?: boolean | null
          auto_upgrade_to_member?: boolean | null
          color_theme?: string | null
          contextual_welcome_message?: string | null
          conversion_completed_at?: string | null
          conversion_rate?: number | null
          converted_to_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          deep_link?: string | null
          department?: string | null
          emoji_sequence: string
          expires_at?: string | null
          guest_session_hours?: number | null
          id?: string
          is_permanent_invite?: boolean | null
          last_used_at?: string | null
          location_access?: string[] | null
          magic_code: string
          max_uses?: number | null
          onboarding_quest_enabled?: boolean | null
          practice_avatar_seed?: string | null
          practice_id: string
          progress_rewards?: Json | null
          qr_code_data?: string | null
          shared_via?: string[] | null
          suggested_avatar_style?: string | null
          target_role?: string | null
          updated_at?: string | null
          used_by?: string[] | null
          view_count?: number | null
          welcome_achievement?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          ai_role_suggestions?: Json | null
          allow_guest_mode?: boolean | null
          auto_regenerate?: boolean | null
          auto_upgrade_to_member?: boolean | null
          color_theme?: string | null
          contextual_welcome_message?: string | null
          conversion_completed_at?: string | null
          conversion_rate?: number | null
          converted_to_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          deep_link?: string | null
          department?: string | null
          emoji_sequence?: string
          expires_at?: string | null
          guest_session_hours?: number | null
          id?: string
          is_permanent_invite?: boolean | null
          last_used_at?: string | null
          location_access?: string[] | null
          magic_code?: string
          max_uses?: number | null
          onboarding_quest_enabled?: boolean | null
          practice_avatar_seed?: string | null
          practice_id?: string
          progress_rewards?: Json | null
          qr_code_data?: string | null
          shared_via?: string[] | null
          suggested_avatar_style?: string | null
          target_role?: string | null
          updated_at?: string | null
          used_by?: string[] | null
          view_count?: number | null
          welcome_achievement?: string | null
          whatsapp_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magic_invites_converted_to_user_id_fkey"
            columns: ["converted_to_user_id"]
            isOneToOne: false
            referencedRelation: "permanent_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "magic_invites_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          notification_type: string
          practice_id: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          practice_id: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          practice_id?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          product_id: string
          quantity: number
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          product_id: string
          quantity: number
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      order_list_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_list_id: string
          ordered_quantity: number | null
          product_id: string
          received_quantity: number | null
          status: string | null
          suggested_quantity: number
          supplier_product_id: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_list_id: string
          ordered_quantity?: number | null
          product_id: string
          received_quantity?: number | null
          status?: string | null
          suggested_quantity: number
          supplier_product_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_list_id?: string
          ordered_quantity?: number | null
          product_id?: string
          received_quantity?: number | null
          status?: string | null
          suggested_quantity?: number
          supplier_product_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_list_items_order_list_id_fkey"
            columns: ["order_list_id"]
            isOneToOne: false
            referencedRelation: "order_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_list_items_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_lists: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          location_id: string
          name: string
          practice_id: string
          status: Database["public"]["Enums"]["order_list_status"] | null
          supplier_id: string | null
          total_items: number | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location_id: string
          name: string
          practice_id: string
          status?: Database["public"]["Enums"]["order_list_status"] | null
          supplier_id?: string | null
          total_items?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location_id?: string
          name?: string
          practice_id?: string
          status?: Database["public"]["Enums"]["order_list_status"] | null
          supplier_id?: string | null
          total_items?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_lists_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_lists_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_lists_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_suggestions: {
        Row: {
          created_at: string | null
          current_stock: number
          expires_at: string | null
          id: string
          last_order_date: string | null
          minimum_stock: number
          practice_id: string
          product_id: string
          suggested_quantity: number
          urgency_level: string | null
        }
        Insert: {
          created_at?: string | null
          current_stock: number
          expires_at?: string | null
          id?: string
          last_order_date?: string | null
          minimum_stock: number
          practice_id: string
          product_id: string
          suggested_quantity: number
          urgency_level?: string | null
        }
        Update: {
          created_at?: string | null
          current_stock?: number
          expires_at?: string | null
          id?: string
          last_order_date?: string | null
          minimum_stock?: number
          practice_id?: string
          product_id?: string
          suggested_quantity?: number
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_suggestions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_suggestions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_suggestions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          bestellijst_id: string | null
          cart_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          expected_delivery_date: string | null
          id: string
          magento_order_id: number | null
          notes: string | null
          order_date: string | null
          order_number: string
          practice_id: string
          status: string | null
          supplier_id: string | null
          total_amount: number | null
          total_items: number | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          bestellijst_id?: string | null
          cart_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expected_delivery_date?: string | null
          id?: string
          magento_order_id?: number | null
          notes?: string | null
          order_date?: string | null
          order_number: string
          practice_id: string
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          total_items?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          bestellijst_id?: string | null
          cart_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expected_delivery_date?: string | null
          id?: string
          magento_order_id?: number | null
          notes?: string | null
          order_date?: string | null
          order_number?: string
          practice_id?: string
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          total_items?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_bestellijst_id_fkey"
            columns: ["bestellijst_id"]
            isOneToOne: false
            referencedRelation: "product_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      permanent_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_from_invite_id: string | null
          department: string | null
          device_remember_enabled: boolean | null
          device_tokens: Json | null
          email: string | null
          email_login_enabled: boolean | null
          full_name: string
          id: string
          invited_by: string | null
          is_active: boolean | null
          language: string | null
          last_login_at: string | null
          login_count: number | null
          magic_code_enabled: boolean | null
          password_hash: string | null
          permissions: Json | null
          personal_magic_code: string | null
          phone: string | null
          practice_id: string
          preferred_login_method: string | null
          role: string
          timezone: string | null
          updated_at: string | null
          upgraded_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_from_invite_id?: string | null
          department?: string | null
          device_remember_enabled?: boolean | null
          device_tokens?: Json | null
          email?: string | null
          email_login_enabled?: boolean | null
          full_name: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          language?: string | null
          last_login_at?: string | null
          login_count?: number | null
          magic_code_enabled?: boolean | null
          password_hash?: string | null
          permissions?: Json | null
          personal_magic_code?: string | null
          phone?: string | null
          practice_id: string
          preferred_login_method?: string | null
          role?: string
          timezone?: string | null
          updated_at?: string | null
          upgraded_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_from_invite_id?: string | null
          department?: string | null
          device_remember_enabled?: boolean | null
          device_tokens?: Json | null
          email?: string | null
          email_login_enabled?: boolean | null
          full_name?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          language?: string | null
          last_login_at?: string | null
          login_count?: number | null
          magic_code_enabled?: boolean | null
          password_hash?: string | null
          permissions?: Json | null
          personal_magic_code?: string | null
          phone?: string | null
          practice_id?: string
          preferred_login_method?: string | null
          role?: string
          timezone?: string | null
          updated_at?: string | null
          upgraded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permanent_users_created_from_invite_id_fkey"
            columns: ["created_from_invite_id"]
            isOneToOne: false
            referencedRelation: "magic_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permanent_users_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_branding: {
        Row: {
          accent_color: string | null
          avatar_style: string | null
          code_generation_style: string | null
          created_at: string | null
          emoji_identifier: string | null
          haptic_feedback: boolean | null
          id: string
          magic_code_template: string | null
          practice_avatar_url: string | null
          practice_id: string
          primary_color: string | null
          secondary_color: string | null
          sound_enabled: boolean | null
          updated_at: string | null
          welcome_animation: string | null
        }
        Insert: {
          accent_color?: string | null
          avatar_style?: string | null
          code_generation_style?: string | null
          created_at?: string | null
          emoji_identifier?: string | null
          haptic_feedback?: boolean | null
          id?: string
          magic_code_template?: string | null
          practice_avatar_url?: string | null
          practice_id: string
          primary_color?: string | null
          secondary_color?: string | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          welcome_animation?: string | null
        }
        Update: {
          accent_color?: string | null
          avatar_style?: string | null
          code_generation_style?: string | null
          created_at?: string | null
          emoji_identifier?: string | null
          haptic_feedback?: boolean | null
          id?: string
          magic_code_template?: string | null
          practice_avatar_url?: string | null
          practice_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          welcome_animation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_branding_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: true
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_inventory_settings: {
        Row: {
          allow_negative_stock: boolean | null
          auto_reorder_enabled: boolean | null
          count_variance_threshold_percent: number | null
          created_at: string | null
          default_currency: string | null
          id: string
          low_stock_threshold_percent: number | null
          notify_on_count_variance: boolean | null
          notify_on_low_stock: boolean | null
          notify_on_stock_out: boolean | null
          practice_id: string
          require_counting_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_negative_stock?: boolean | null
          auto_reorder_enabled?: boolean | null
          count_variance_threshold_percent?: number | null
          created_at?: string | null
          default_currency?: string | null
          id?: string
          low_stock_threshold_percent?: number | null
          notify_on_count_variance?: boolean | null
          notify_on_low_stock?: boolean | null
          notify_on_stock_out?: boolean | null
          practice_id: string
          require_counting_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_negative_stock?: boolean | null
          auto_reorder_enabled?: boolean | null
          count_variance_threshold_percent?: number | null
          created_at?: string | null
          default_currency?: string | null
          id?: string
          low_stock_threshold_percent?: number | null
          notify_on_count_variance?: boolean | null
          notify_on_low_stock?: boolean | null
          notify_on_stock_out?: boolean | null
          practice_id?: string
          require_counting_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_inventory_settings_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: true
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_locations: {
        Row: {
          access_code: string | null
          address: string | null
          allows_negative_stock: boolean | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          floor_level: string | null
          id: string
          is_active: boolean | null
          is_main_location: boolean | null
          location_type: string | null
          name: string
          practice_id: string
          requires_counting: boolean | null
          responsible_user_id: string | null
          restricted_access: boolean | null
          room_number: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          access_code?: string | null
          address?: string | null
          allows_negative_stock?: boolean | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          floor_level?: string | null
          id?: string
          is_active?: boolean | null
          is_main_location?: boolean | null
          location_type?: string | null
          name: string
          practice_id: string
          requires_counting?: boolean | null
          responsible_user_id?: string | null
          restricted_access?: boolean | null
          room_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          access_code?: string | null
          address?: string | null
          allows_negative_stock?: boolean | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          floor_level?: string | null
          id?: string
          is_active?: boolean | null
          is_main_location?: boolean | null
          location_type?: string | null
          name?: string
          practice_id?: string
          requires_counting?: boolean | null
          responsible_user_id?: string | null
          restricted_access?: boolean | null
          room_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_locations_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_members: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          practice_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          practice_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          practice_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_members_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practices: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          settings: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      product_batches: {
        Row: {
          available_quantity: number | null
          batch_number: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          current_quantity: number
          expiry_date: string
          id: string
          initial_quantity: number
          invoice_number: string | null
          location_id: string
          practice_id: string
          product_id: string
          purchase_order_number: string | null
          quality_check_passed: boolean | null
          quality_notes: string | null
          quarantine_until: string | null
          received_date: string
          reserved_quantity: number | null
          status: string | null
          supplier_batch_number: string | null
          supplier_id: string | null
          total_cost: number | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          available_quantity?: number | null
          batch_number: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_quantity: number
          expiry_date: string
          id?: string
          initial_quantity: number
          invoice_number?: string | null
          location_id: string
          practice_id: string
          product_id: string
          purchase_order_number?: string | null
          quality_check_passed?: boolean | null
          quality_notes?: string | null
          quarantine_until?: string | null
          received_date?: string
          reserved_quantity?: number | null
          status?: string | null
          supplier_batch_number?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number | null
          batch_number?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_quantity?: number
          expiry_date?: string
          id?: string
          initial_quantity?: number
          invoice_number?: string | null
          location_id?: string
          practice_id?: string
          product_id?: string
          purchase_order_number?: string | null
          quality_check_passed?: boolean | null
          quality_notes?: string | null
          quarantine_until?: string | null
          received_date?: string
          reserved_quantity?: number | null
          status?: string | null
          supplier_batch_number?: string | null
          supplier_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_list_items: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_stock: number
          id: string
          last_counted: string | null
          maximum_stock: number
          minimum_stock: number
          notes: string | null
          preferred_supplier: string | null
          product_id: string
          product_list_id: string
          reorder_point: number | null
          supplier_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_stock?: number
          id?: string
          last_counted?: string | null
          maximum_stock?: number
          minimum_stock?: number
          notes?: string | null
          preferred_supplier?: string | null
          product_id: string
          product_list_id: string
          reorder_point?: number | null
          supplier_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_stock?: number
          id?: string
          last_counted?: string | null
          maximum_stock?: number
          minimum_stock?: number
          notes?: string | null
          preferred_supplier?: string | null
          product_id?: string
          product_list_id?: string
          reorder_point?: number | null
          supplier_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_list_items_product_list_id_fkey"
            columns: ["product_list_id"]
            isOneToOne: false
            referencedRelation: "product_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      product_lists: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          location_id: string | null
          name: string
          offline_data: Json | null
          practice_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          location_id?: string | null
          name: string
          offline_data?: Json | null
          practice_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          location_id?: string | null
          name?: string
          offline_data?: Json | null
          practice_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_lists_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_lists_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          barcode: string | null
          base_unit_indicator: boolean | null
          brand: string | null
          category: string | null
          country_of_origin: string | null
          created_at: string | null
          description: string | null
          despatch_unit_indicator: boolean | null
          effective_from_date: string | null
          effective_to_date: string | null
          gln_manufacturer: string | null
          gpc_brick_code: string | null
          gross_weight: number | null
          gtin: string | null
          id: string
          image_url: string | null
          last_synced_at: string | null
          magento_id: number | null
          name: string
          net_content_uom: string | null
          net_content_value: number | null
          net_weight: number | null
          orderable_unit_indicator: boolean | null
          preferred_supplier_id: string | null
          price: number | null
          product_lifecycle_status: string | null
          requires_batch_tracking: boolean
          sku: string
          subcategory: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          barcode?: string | null
          base_unit_indicator?: boolean | null
          brand?: string | null
          category?: string | null
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          despatch_unit_indicator?: boolean | null
          effective_from_date?: string | null
          effective_to_date?: string | null
          gln_manufacturer?: string | null
          gpc_brick_code?: string | null
          gross_weight?: number | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          last_synced_at?: string | null
          magento_id?: number | null
          name: string
          net_content_uom?: string | null
          net_content_value?: number | null
          net_weight?: number | null
          orderable_unit_indicator?: boolean | null
          preferred_supplier_id?: string | null
          price?: number | null
          product_lifecycle_status?: string | null
          requires_batch_tracking?: boolean
          sku: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          barcode?: string | null
          base_unit_indicator?: boolean | null
          brand?: string | null
          category?: string | null
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          despatch_unit_indicator?: boolean | null
          effective_from_date?: string | null
          effective_to_date?: string | null
          gln_manufacturer?: string | null
          gpc_brick_code?: string | null
          gross_weight?: number | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          last_synced_at?: string | null
          magento_id?: number | null
          name?: string
          net_content_uom?: string | null
          net_content_value?: number | null
          net_weight?: number | null
          orderable_unit_indicator?: boolean | null
          preferred_supplier_id?: string | null
          price?: number | null
          product_lifecycle_status?: string | null
          requires_batch_tracking?: boolean
          sku?: string
          subcategory?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          default_conditions: Json | null
          id: string
          permission_type: string
          resource_type: string
          role: Database["public"]["Enums"]["practice_role"]
        }
        Insert: {
          default_conditions?: Json | null
          id?: string
          permission_type: string
          resource_type: string
          role: Database["public"]["Enums"]["practice_role"]
        }
        Update: {
          default_conditions?: Json | null
          id?: string
          permission_type?: string
          resource_type?: string
          role?: Database["public"]["Enums"]["practice_role"]
        }
        Relationships: []
      }
      shopping_cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          suggested_by: string | null
          updated_at: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity?: number
          suggested_by?: string | null
          updated_at?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          suggested_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      shopping_carts: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          location_id: string | null
          name: string
          notes: string | null
          offline_data: Json | null
          practice_id: string
          status: string | null
          total_items: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_id?: string | null
          name?: string
          notes?: string | null
          offline_data?: Json | null
          practice_id: string
          status?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_id?: string | null
          name?: string
          notes?: string | null
          offline_data?: Json | null
          practice_id?: string
          status?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_carts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_carts_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_entries: {
        Row: {
          counted_at: string | null
          counted_quantity: number
          created_at: string | null
          created_by: string | null
          entry_type: string | null
          id: string
          location_id: string | null
          notes: string | null
          practice_id: string
          product_id: string
        }
        Insert: {
          counted_at?: string | null
          counted_quantity: number
          created_at?: string | null
          created_by?: string | null
          entry_type?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          practice_id: string
          product_id: string
        }
        Update: {
          counted_at?: string | null
          counted_quantity?: number
          created_at?: string | null
          created_by?: string | null
          entry_type?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          practice_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_entries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_entries_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          available_quantity: number | null
          created_at: string | null
          current_quantity: number | null
          id: string
          last_counted_at: string | null
          last_movement_at: string | null
          last_ordered_at: string | null
          location_id: string
          maximum_quantity: number | null
          minimum_quantity: number | null
          practice_id: string
          preferred_supplier_id: string | null
          product_id: string
          reorder_point: number | null
          reserved_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          available_quantity?: number | null
          created_at?: string | null
          current_quantity?: number | null
          id?: string
          last_counted_at?: string | null
          last_movement_at?: string | null
          last_ordered_at?: string | null
          location_id: string
          maximum_quantity?: number | null
          minimum_quantity?: number | null
          practice_id: string
          preferred_supplier_id?: string | null
          product_id: string
          reorder_point?: number | null
          reserved_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number | null
          created_at?: string | null
          current_quantity?: number | null
          id?: string
          last_counted_at?: string | null
          last_movement_at?: string | null
          last_ordered_at?: string | null
          location_id?: string
          maximum_quantity?: number | null
          minimum_quantity?: number | null
          practice_id?: string
          preferred_supplier_id?: string | null
          product_id?: string
          reorder_point?: number | null
          reserved_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_preferred_supplier_id_fkey"
            columns: ["preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          batch_id: string | null
          batch_number: string | null
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          id: string
          location_id: string
          movement_type: string
          notes: string | null
          practice_id: string
          product_id: string
          quantity_after: number
          quantity_before: number
          quantity_change: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          batch_id?: string | null
          batch_number?: string | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          location_id: string
          movement_type: string
          notes?: string | null
          practice_id: string
          product_id: string
          quantity_after: number
          quantity_before: number
          quantity_change: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          batch_id?: string | null
          batch_number?: string | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          location_id?: string
          movement_type?: string
          notes?: string | null
          practice_id?: string
          product_id?: string
          quantity_after?: number
          quantity_before?: number
          quantity_change?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      supplier_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          delivery_confirmed_at: string | null
          delivery_expected: string | null
          failure_reason: string | null
          id: string
          method_used: string
          notes: string | null
          order_list_id: string
          response_data: Json | null
          retry_count: number | null
          sent_at: string | null
          status: string
          supplier_id: string
          total_items: number | null
          total_value: number | null
          tracking_info: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          delivery_confirmed_at?: string | null
          delivery_expected?: string | null
          failure_reason?: string | null
          id?: string
          method_used: string
          notes?: string | null
          order_list_id: string
          response_data?: Json | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
          supplier_id: string
          total_items?: number | null
          total_value?: number | null
          tracking_info?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          delivery_confirmed_at?: string | null
          delivery_expected?: string | null
          failure_reason?: string | null
          id?: string
          method_used?: string
          notes?: string | null
          order_list_id?: string
          response_data?: Json | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string
          supplier_id?: string
          total_items?: number | null
          total_value?: number | null
          tracking_info?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_order_list_id_fkey"
            columns: ["order_list_id"]
            isOneToOne: false
            referencedRelation: "order_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          cost_price: number | null
          created_at: string | null
          currency: string | null
          gtin: string | null
          id: string
          is_available: boolean | null
          is_preferred: boolean | null
          last_synced_at: string | null
          lead_time_days: number | null
          list_price: number | null
          minimum_order_quantity: number | null
          order_multiple: number | null
          product_id: string
          supplier_id: string
          supplier_name: string | null
          supplier_sku: string
          updated_at: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string | null
          currency?: string | null
          gtin?: string | null
          id?: string
          is_available?: boolean | null
          is_preferred?: boolean | null
          last_synced_at?: string | null
          lead_time_days?: number | null
          list_price?: number | null
          minimum_order_quantity?: number | null
          order_multiple?: number | null
          product_id: string
          supplier_id: string
          supplier_name?: string | null
          supplier_sku: string
          updated_at?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string | null
          currency?: string | null
          gtin?: string | null
          id?: string
          is_available?: boolean | null
          is_preferred?: boolean | null
          last_synced_at?: string | null
          lead_time_days?: number | null
          list_price?: number | null
          minimum_order_quantity?: number | null
          order_multiple?: number | null
          product_id?: string
          supplier_id?: string
          supplier_name?: string | null
          supplier_sku?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_stock_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          api_endpoint: string | null
          api_key_encrypted: string | null
          api_type: string | null
          auto_sync_enabled: boolean | null
          business_registration: string | null
          city: string | null
          code: string
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          free_shipping_threshold: number | null
          id: string
          integration_config: Json | null
          integration_type: string | null
          is_active: boolean | null
          last_sync_at: string | null
          minimum_order_amount: number | null
          name: string
          notes: string | null
          order_cutoff_time: string | null
          order_method: string | null
          payment_terms: number | null
          postal_code: string | null
          preferred_order_day: number | null
          shipping_cost: number | null
          sync_enabled: boolean | null
          updated_at: string | null
          updated_by: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          api_type?: string | null
          auto_sync_enabled?: boolean | null
          business_registration?: string | null
          city?: string | null
          code: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          free_shipping_threshold?: number | null
          id?: string
          integration_config?: Json | null
          integration_type?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          minimum_order_amount?: number | null
          name: string
          notes?: string | null
          order_cutoff_time?: string | null
          order_method?: string | null
          payment_terms?: number | null
          postal_code?: string | null
          preferred_order_day?: number | null
          shipping_cost?: number | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          api_type?: string | null
          auto_sync_enabled?: boolean | null
          business_registration?: string | null
          city?: string | null
          code?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          free_shipping_threshold?: number | null
          id?: string
          integration_config?: Json | null
          integration_type?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          minimum_order_amount?: number | null
          name?: string
          notes?: string | null
          order_cutoff_time?: string | null
          order_method?: string | null
          payment_terms?: number | null
          postal_code?: string | null
          preferred_order_day?: number | null
          shipping_cost?: number | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      usage_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          location_id: string | null
          practice_id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_id?: string | null
          practice_id: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_id?: string | null
          practice_id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_analytics_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_analytics_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          conditions: Json | null
          created_at: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          location_id: string | null
          permission_type: string
          practice_id: string
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          location_id?: string | null
          permission_type: string
          practice_id: string
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          location_id?: string | null
          permission_type?: string
          practice_id?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          actions_performed: number | null
          device_fingerprint: string | null
          ended_at: string | null
          expires_at: string | null
          features_used: string[] | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity_at: string | null
          location_city: string | null
          location_country: string | null
          login_method: string
          page_views: number | null
          practice_id: string
          session_token: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actions_performed?: number | null
          device_fingerprint?: string | null
          ended_at?: string | null
          expires_at?: string | null
          features_used?: string[] | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          location_city?: string | null
          location_country?: string | null
          login_method: string
          page_views?: number | null
          practice_id: string
          session_token: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actions_performed?: number | null
          device_fingerprint?: string | null
          ended_at?: string | null
          expires_at?: string | null
          features_used?: string[] | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          location_city?: string | null
          location_country?: string | null
          login_method?: string
          page_views?: number | null
          practice_id?: string
          session_token?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "permanent_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      unified_stock_view: {
        Row: {
          available_quantity: number | null
          current_quantity: number | null
          gtin: string | null
          last_counted_at: string | null
          last_movement_at: string | null
          last_ordered_at: string | null
          location_id: string | null
          location_name: string | null
          maximum_quantity: number | null
          minimum_quantity: number | null
          practice_id: string | null
          preferred_supplier_id: string | null
          preferred_supplier_name: string | null
          product_id: string | null
          product_name: string | null
          reorder_point: number | null
          reserved_quantity: number | null
          stock_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_preferred_supplier_id_fkey"
            columns: ["preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      counting_session_status:
        | "draft"
        | "in_progress"
        | "completed"
        | "approved"
        | "cancelled"
      order_list_status:
        | "draft"
        | "active"
        | "submitted"
        | "completed"
        | "cancelled"
      practice_role:
        | "owner"
        | "manager"
        | "assistant"
        | "logistics"
        | "member"
        | "guest"
      user_role:
        | "owner"
        | "manager"
        | "assistant"
        | "logistics"
        | "member"
        | "guest"
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

// Legacy type aliases for compatibility (updated to use proper table names)
export type PermanentUser = Tables<'permanent_users'>
export type PermanentUserInsert = TablesInsert<'permanent_users'>
export type PermanentUserUpdate = TablesUpdate<'permanent_users'>

// Magic invites table (still active)
export type MagicInvite = Tables<'magic_invites'>
export type MagicInviteInsert = TablesInsert<'magic_invites'>

// Guest sessions table (still active)
export type GuestSession = Tables<'guest_sessions'>
export type GuestSessionInsert = TablesInsert<'guest_sessions'>

// Usage analytics is the active analytics table (replaces invite_analytics)
export type UsageAnalytics = Tables<'usage_analytics'>
export type UsageAnalyticsInsert = TablesInsert<'usage_analytics'>

// Notification settings is the active notifications table
export type NotificationSettings = Tables<'notification_settings'>
export type NotificationSettingsInsert = TablesInsert<'notification_settings'>

// Note: device_tokens, invite_analytics, and push_tokens tables have been removed
// Device tokens are now stored as JSON in permanent_users.device_tokens field
// Invite analytics functionality moved to usage_analytics table
// Push tokens functionality to be implemented later when needed