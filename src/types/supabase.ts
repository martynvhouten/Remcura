export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string
          name: string
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          clinic_id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          clinic_id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          }
        ]
      }
      clinic_products: {
        Row: {
          id: string
          clinic_id: string
          product_name: string
          product_sku: string | null
          product_description: string | null
          current_stock: number
          minimum_stock: number
          maximum_stock: number
          reorder_enabled: boolean
          low_stock_alert_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          product_name: string
          product_sku?: string | null
          product_description?: string | null
          current_stock?: number
          minimum_stock?: number
          maximum_stock?: number
          reorder_enabled?: boolean
          low_stock_alert_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          product_name?: string
          product_sku?: string | null
          product_description?: string | null
          current_stock?: number
          minimum_stock?: number
          maximum_stock?: number
          reorder_enabled?: boolean
          low_stock_alert_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_products_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Clinic = Database['public']['Tables']['clinics']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type ClinicProduct = Database['public']['Tables']['clinic_products']['Row']

export type ClinicInsert = Database['public']['Tables']['clinics']['Insert']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type ClinicProductInsert = Database['public']['Tables']['clinic_products']['Insert']

export type ClinicUpdate = Database['public']['Tables']['clinics']['Update']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type ClinicProductUpdate = Database['public']['Tables']['clinic_products']['Update'] 