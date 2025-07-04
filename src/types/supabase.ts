export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      practices: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string | null;
          settings: any | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          settings?: any | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          settings?: any | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      practice_members: {
        Row: {
          id: string;
          practice_id: string;
          user_id: string;
          role: string;
          joined_at: string;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          user_id: string;
          role: string;
          joined_at?: string;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "practice_members_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          magento_id: number | null;
          sku: string;
          name: string;
          category: string | null;
          subcategory: string | null;
          brand: string | null;
          description: string | null;
          image_url: string | null;
          price: number | null;
          unit: string | null;
          active: boolean | null;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          magento_id?: number | null;
          sku: string;
          name: string;
          category?: string | null;
          subcategory?: string | null;
          brand?: string | null;
          description?: string | null;
          image_url?: string | null;
          price?: number | null;
          unit?: string | null;
          active?: boolean | null;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          magento_id?: number | null;
          sku?: string;
          name?: string;
          category?: string | null;
          subcategory?: string | null;
          brand?: string | null;
          description?: string | null;
          image_url?: string | null;
          price?: number | null;
          unit?: string | null;
          active?: boolean | null;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_lists: {
        Row: {
          id: string;
          practice_id: string;
          name: string;
          description: string | null;
          is_default: boolean | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          practice_id: string;
          name: string;
          description?: string | null;
          is_default?: boolean | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          practice_id?: string;
          name?: string;
          description?: string | null;
          is_default?: boolean | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_lists_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          }
        ];
      };
      product_list_items: {
        Row: {
          id: string;
          product_list_id: string;
          product_id: string;
          minimum_stock: number;
          maximum_stock: number;
          current_stock: number;
          reorder_point: number | null;
          preferred_supplier: string | null;
          notes: string | null;
          last_counted: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          product_list_id: string;
          product_id: string;
          minimum_stock?: number;
          maximum_stock?: number;
          current_stock?: number;
          reorder_point?: number | null;
          preferred_supplier?: string | null;
          notes?: string | null;
          last_counted?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          product_list_id?: string;
          product_id?: string;
          minimum_stock?: number;
          maximum_stock?: number;
          current_stock?: number;
          reorder_point?: number | null;
          preferred_supplier?: string | null;
          notes?: string | null;
          last_counted?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_list_items_product_list_id_fkey";
            columns: ["product_list_id"];
            isOneToOne: false;
            referencedRelation: "product_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_list_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      stock_entries: {
        Row: {
          id: string;
          practice_id: string;
          product_id: string;
          counted_quantity: number;
          entry_type: string | null;
          notes: string | null;
          counted_at: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          practice_id: string;
          product_id: string;
          counted_quantity: number;
          entry_type?: string | null;
          notes?: string | null;
          counted_at?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          practice_id?: string;
          product_id?: string;
          counted_quantity?: number;
          entry_type?: string | null;
          notes?: string | null;
          counted_at?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stock_entries_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_entries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      order_suggestions: {
        Row: {
          id: string;
          practice_id: string;
          product_id: string;
          current_stock: number;
          minimum_stock: number;
          suggested_quantity: number;
          urgency_level: string | null;
          last_order_date: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          practice_id: string;
          product_id: string;
          current_stock: number;
          minimum_stock: number;
          suggested_quantity: number;
          urgency_level?: string | null;
          last_order_date?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          practice_id?: string;
          product_id?: string;
          current_stock?: number;
          minimum_stock?: number;
          suggested_quantity?: number;
          urgency_level?: string | null;
          last_order_date?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_suggestions_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_suggestions_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_log: {
        Row: {
          id: string;
          practice_id: string | null;
          user_id: string | null;
          activity_type: string;
          table_name: string | null;
          record_id: string | null;
          old_values: any | null;
          new_values: any | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id?: string | null;
          user_id?: string | null;
          activity_type: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string | null;
          user_id?: string | null;
          activity_type?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_log_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          }
        ];
      };
      shopping_carts: {
        Row: {
          id: string;
          practice_id: string;
          name: string;
          notes: string | null;
          status: string;
          total_items: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          name?: string;
          notes?: string | null;
          status?: string;
          total_items?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          name?: string;
          notes?: string | null;
          status?: string;
          total_items?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_carts_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_carts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      shopping_cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          notes: string | null;
          suggested_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          quantity?: number;
          notes?: string | null;
          suggested_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          product_id?: string;
          quantity?: number;
          notes?: string | null;
          suggested_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "shopping_carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_email: string | null;
          contact_phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string | null;
          website: string | null;
          notes: string | null;
          is_active: boolean;
          magento_vendor_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          website?: string | null;
          notes?: string | null;
          is_active?: boolean;
          magento_vendor_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          website?: string | null;
          notes?: string | null;
          is_active?: boolean;
          magento_vendor_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          practice_id: string;
          bestellijst_id: string | null;
          cart_id: string | null;
          order_number: string;
          supplier_id: string | null;
          status: string;
          total_items: number;
          total_amount: number | null;
          currency: string;
          order_date: string;
          expected_delivery_date: string | null;
          actual_delivery_date: string | null;
          tracking_number: string | null;
          notes: string | null;
          magento_order_id: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          bestellijst_id?: string | null;
          cart_id?: string | null;
          order_number: string;
          supplier_id?: string | null;
          status?: string;
          total_items?: number;
          total_amount?: number | null;
          currency?: string;
          order_date?: string;
          expected_delivery_date?: string | null;
          actual_delivery_date?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          magento_order_id?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          bestellijst_id?: string | null;
          cart_id?: string | null;
          order_number?: string;
          supplier_id?: string | null;
          status?: string;
          total_items?: number;
          total_amount?: number | null;
          currency?: string;
          order_date?: string;
          expected_delivery_date?: string | null;
          actual_delivery_date?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          magento_order_id?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number | null;
          total_price: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price?: number | null;
          total_price?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number | null;
          total_price?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      locations: {
        Row: {
          id: string;
          practice_id: string;
          name: string;
          description: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          is_main: boolean;
          is_active: boolean;
          settings: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          name: string;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          is_main?: boolean;
          is_active?: boolean;
          settings?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          is_main?: boolean;
          is_active?: boolean;
          settings?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          }
        ];
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          practice_id: string;
          location_id: string | null;
          permission_type: string;
          resource_type: string;
          resource_id: string | null;
          granted_by: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          practice_id: string;
          location_id?: string | null;
          permission_type: string;
          resource_type: string;
          resource_id?: string | null;
          granted_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          practice_id?: string;
          location_id?: string | null;
          permission_type?: string;
          resource_type?: string;
          resource_id?: string | null;
          granted_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_permissions_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          }
        ];
      };
      usage_analytics: {
        Row: {
          id: string;
          practice_id: string;
          user_id: string | null;
          location_id: string | null;
          event_type: string;
          event_data: any | null;
          session_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          practice_id: string;
          user_id?: string | null;
          location_id?: string | null;
          event_type: string;
          event_data?: any | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          practice_id?: string;
          user_id?: string | null;
          location_id?: string | null;
          event_type?: string;
          event_data?: any | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_analytics_practice_id_fkey";
            columns: ["practice_id"];
            isOneToOne: false;
            referencedRelation: "practices";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_settings: {
        Row: {
          id: string;
          user_id: string;
          practice_id: string;
          notification_type: string;
          channel: string;
          is_enabled: boolean;
          settings: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          practice_id: string;
          notification_type: string;
          channel: string;
          is_enabled?: boolean;
          settings?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          practice_id?: string;
          notification_type?: string;
          channel?: string;
          is_enabled?: boolean;
          settings?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: string;
          is_active: boolean;
          last_used_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform: string;
          is_active?: boolean;
          last_used_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          platform?: string;
          is_active?: boolean;
          last_used_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Legacy tables (keeping for backward compatibility)
      clinics: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          clinic_id: string;
          email: string;
          full_name: string | null;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          clinic_id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          }
        ];
      };
      clinic_products: {
        Row: {
          id: string;
          clinic_id: string;
          product_name: string;
          product_sku: string | null;
          product_description: string | null;
          current_stock: number;
          minimum_stock: number;
          maximum_stock: number;
          reorder_enabled: boolean;
          low_stock_alert_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          product_name: string;
          product_sku?: string | null;
          product_description?: string | null;
          current_stock?: number;
          minimum_stock?: number;
          maximum_stock?: number;
          reorder_enabled?: boolean;
          low_stock_alert_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          product_name?: string;
          product_sku?: string | null;
          product_description?: string | null;
          current_stock?: number;
          minimum_stock?: number;
          maximum_stock?: number;
          reorder_enabled?: boolean;
          low_stock_alert_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinic_products_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_order_advice: {
        Args: {
          practice_uuid: string;
        };
        Returns: {
          product_id: string;
          product_name: string;
          product_sku: string;
          current_stock: number;
          minimum_stock: number;
          maximum_stock: number;
          suggested_quantity: number;
          urgency_level: string;
          last_stock_entry: string | null;
        }[];
      };
      test_demo_data: {
        Args: {};
        Returns: {
          section: string;
          data_type: string;
          count_value: number;
          description: string;
        }[];
      };
      update_product_stock: {
        Args: {
          practice_uuid: string;
          product_uuid: string;
          new_quantity: number;
          entry_notes?: string | null;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Type helpers for easier usage
// New database types
export type Practice = Database["public"]["Tables"]["practices"]["Row"];
export type PracticeMember =
  Database["public"]["Tables"]["practice_members"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_log"]["Row"];

// Legacy types (keeping for backward compatibility with other modules)
export type Clinic = Database["public"]["Tables"]["clinics"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export type PracticeInsert =
  Database["public"]["Tables"]["practices"]["Insert"];

export type ClinicInsert = Database["public"]["Tables"]["clinics"]["Insert"];
export type UserProfileInsert =
  Database["public"]["Tables"]["user_profiles"]["Insert"];

export type PracticeUpdate =
  Database["public"]["Tables"]["practices"]["Update"];

export type ClinicUpdate = Database["public"]["Tables"]["clinics"]["Update"];
export type UserProfileUpdate =
  Database["public"]["Tables"]["user_profiles"]["Update"];

export type PracticeWithMembers = Practice & {
  practice_members?: PracticeMember[];
};

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type UserPermission =
  Database["public"]["Tables"]["user_permissions"]["Row"];
export type UsageAnalytics =
  Database["public"]["Tables"]["usage_analytics"]["Row"];
export type NotificationSettings =
  Database["public"]["Tables"]["notification_settings"]["Row"];
export type PushToken = Database["public"]["Tables"]["push_tokens"]["Row"];

export type SupplierInsert =
  Database["public"]["Tables"]["suppliers"]["Insert"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderItemInsert =
  Database["public"]["Tables"]["order_items"]["Insert"];
export type LocationInsert =
  Database["public"]["Tables"]["locations"]["Insert"];
export type UserPermissionInsert =
  Database["public"]["Tables"]["user_permissions"]["Insert"];
export type UsageAnalyticsInsert =
  Database["public"]["Tables"]["usage_analytics"]["Insert"];
export type NotificationSettingsInsert =
  Database["public"]["Tables"]["notification_settings"]["Insert"];
export type PushTokenInsert =
  Database["public"]["Tables"]["push_tokens"]["Insert"];

export type SupplierUpdate =
  Database["public"]["Tables"]["suppliers"]["Update"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
export type OrderItemUpdate =
  Database["public"]["Tables"]["order_items"]["Update"];
export type LocationUpdate =
  Database["public"]["Tables"]["locations"]["Update"];
export type UserPermissionUpdate =
  Database["public"]["Tables"]["user_permissions"]["Update"];
export type UsageAnalyticsUpdate =
  Database["public"]["Tables"]["usage_analytics"]["Update"];
export type NotificationSettingsUpdate =
  Database["public"]["Tables"]["notification_settings"]["Update"];
export type PushTokenUpdate =
  Database["public"]["Tables"]["push_tokens"]["Update"];

export type PracticeWithLocations = Practice & {
  locations?: Location[];
  practice_members?: PracticeMember[];
};

export type AnalyticsEvent = {
  type: string;
  data: any;
  timestamp: string;
  user_id?: string;
  practice_id: string;
  location_id?: string;
};

export type NotificationChannel = "email" | "push" | "sms" | "in_app";
export type NotificationType =
  | "stock_alert"
  | "order_update"
  | "system_notification"
  | "reminder";

export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type ExportFormat = "csv" | "pdf" | "excel";
export type ExportType = "order" | "inventory" | "analytics" | "full_report";

export type MagentoOrder = {
  id?: number;
  increment_id?: string;
  status?: string;
  items: {
    sku: string;
    qty_ordered: number;
    price: number;
    product_type: string;
  }[];
  billing_address?: any;
  shipping_address?: any;
  payment?: any;
};

export type PermissionType = "read" | "write" | "delete" | "admin";
export type ResourceType = "order" | "analytics" | "settings";
