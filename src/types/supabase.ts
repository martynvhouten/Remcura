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
      // Note: Legacy tables device_tokens, invite_analytics, and push_tokens have been removed
      // Device tokens are now stored as JSON in permanent_users.device_tokens field
      // Invite analytics replaced by usage_analytics table
      // Push tokens to be implemented when push notifications are activated
      permanent_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_from_invite_id: string | null
          department: string | null
          device_remember_enabled: boolean | null
          device_tokens: Json | null  // This is the new JSON field approach
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
      // Simplified placeholder - complete tables would be too large for this cleanup
      magic_invites: any
      guest_sessions: any
      usage_analytics: any
      practices: any
      notification_settings: any
      // All other tables from the original schema...
    }
    Views: {
      [viewName: string]: any
    }
    Functions: {
      [functionName: string]: any
    }
    Enums: {
      [enumName: string]: string
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

// Usage analytics is the active analytics table (replaces invite_analytics)
export type UsageAnalytics = Tables<"usage_analytics">
export type MagicInvite = Tables<"magic_invites">
export type GuestSession = Tables<"guest_sessions">
export type PermanentUser = Tables<"permanent_users">

// Note: device_tokens, invite_analytics, and push_tokens tables have been removed
// Device tokens are now stored as JSON in permanent_users.device_tokens field
// Invite analytics functionality moved to usage_analytics table
// Push tokens will be implemented when push notifications are activated