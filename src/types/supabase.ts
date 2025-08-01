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
      invite_analytics: {
        Row: {
          browser: string | null
          created_at: string | null
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          interaction_depth: number | null
          ip_address: unknown | null
          load_time_ms: number | null
          magic_invite_id: string
          platform: string | null
          practice_id: string
          referrer_url: string | null
          share_method: string | null
          shared_by_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          interaction_depth?: number | null
          ip_address?: unknown | null
          load_time_ms?: number | null
          magic_invite_id: string
          platform?: string | null
          practice_id: string
          referrer_url?: string | null
          share_method?: string | null
          shared_by_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          interaction_depth?: number | null
          ip_address?: unknown | null
          load_time_ms?: number | null
          magic_invite_id?: string
          platform?: string | null
          practice_id?: string
          referrer_url?: string | null
          share_method?: string | null
          shared_by_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_analytics_magic_invite_id_fkey"
            columns: ["magic_invite_id"]
            isOneToOne: false
            referencedRelation: "magic_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_analytics_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {
      generate_magic_code: {
        Args: { practice_name: string; department?: string; style?: string }
        Returns: string
      }
    }
    Enums: {}
    CompositeTypes: {}
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