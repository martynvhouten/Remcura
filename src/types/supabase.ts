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
      // 🚀 NEW AUTO-UPGRADE TABLES
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
      device_tokens: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          device_name: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_used_at: string | null
          login_count: number | null
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          device_name?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_used_at?: string | null
          login_count?: number | null
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_used_at?: string | null
          login_count?: number | null
          token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "permanent_users"
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
      // UPDATED MAGIC INVITES
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
      // EXISTING TABLES (key ones)
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
      practice_members: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          practice_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          practice_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          practice_id?: string
          role?: string
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
      // Add other important tables as needed...
      [key: string]: any
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      // 🚀 NEW AUTO-UPGRADE FUNCTIONS
      generate_personal_magic_code: {
        Args: { user_name: string; practice_name: string }
        Returns: string
      }
      validate_personal_magic_code: {
        Args: { magic_code: string }
        Returns: Json
      }
      generate_magic_code: {
        Args: { practice_name: string; department?: string; style?: string }
        Returns: string
      }
      get_order_advice: {
        Args: { practice_uuid: string }
        Returns: {
          product_id: string
          product_name: string
          product_sku: string
          current_stock: number
          minimum_stock: number
          maximum_stock: number
          suggested_quantity: number
          urgency_level: string
          last_stock_entry: string
        }[]
      }
      test_demo_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          section: string
          data_type: string
          count_value: number
          description: string
        }[]
      }
      update_product_stock: {
        Args: {
          practice_uuid: string
          product_uuid: string
          new_quantity: number
          entry_notes?: string
        }
        Returns: undefined
      }
      [key: string]: any
    }
    Enums: {
      [key: string]: any
    }
    CompositeTypes: {
      [key: string]: any
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

// Additional type exports for Auto-Upgrade System
export type PermanentUser = Tables<"permanent_users">
export type DeviceToken = Tables<"device_tokens">
export type UserSession = Tables<"user_sessions">
export type MagicInvite = Tables<"magic_invites">
export type Practice = Tables<"practices">

// Legacy types for backward compatibility
export type Clinic = Practice
export type ClinicProduct = any // Define as needed
export type PracticeMember = Tables<"practice_members">
export type UserProfile = any // Define as needed
export type Location = any // Define as needed
export type UserPermission = any // Define as needed
export type AnalyticsEventData = Json

// Practice settings type
export interface PracticeSettings {
  [key: string]: any
} 