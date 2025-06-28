import { supabase } from 'src/boot/supabase'
import { monitoringService } from './monitoring'
import { apiLogger } from 'src/utils/logger'
import type { 
  Clinic, 
  UserProfile, 
  ClinicProduct,
  ClinicInsert,
  UserProfileInsert,
  ClinicProductInsert,
  ClinicUpdate,
  UserProfileUpdate,
  ClinicProductUpdate
} from 'src/types/supabase'

// Clinic operations
export const clinicService = {
  async getById(id: string): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      const enhancedError = new Error(`Failed to fetch clinic: ${error.message}`)
      apiLogger.error('Failed to fetch clinic', enhancedError)
      monitoringService.captureError(enhancedError, {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
      throw enhancedError
    }

    return data
  },

  async create(clinic: ClinicInsert): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from('clinics')
      .insert([clinic])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create clinic: ${error.message}`)
    }

    return data
  },

  async update(id: string, updates: ClinicUpdate): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from('clinics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update clinic: ${error.message}`)
    }

    return data
  }
}

// User profile operations
export const userProfileService = {
  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`)
    }

    return data
  },

  async create(profile: UserProfileInsert): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return data
  },

  async update(id: string, updates: UserProfileUpdate): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  }
}

// Clinic products operations
export const clinicProductService = {
  async getByClinicId(clinicId: string): Promise<ClinicProduct[]> {
    const { data, error } = await supabase
      .from('clinic_products')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('product_name')

    if (error) {
      throw new Error(`Failed to fetch clinic products: ${error.message}`)
    }

    return data || []
  },

  async getById(id: string): Promise<ClinicProduct | null> {
    const { data, error } = await supabase
      .from('clinic_products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch clinic product: ${error.message}`)
    }

    return data
  },

  async create(product: ClinicProductInsert): Promise<ClinicProduct | null> {
    const { data, error } = await supabase
      .from('clinic_products')
      .insert([product])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create clinic product: ${error.message}`)
    }

    return data
  },

  async update(id: string, updates: ClinicProductUpdate): Promise<ClinicProduct | null> {
    const { data, error } = await supabase
      .from('clinic_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update clinic product: ${error.message}`)
    }

    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clinic_products')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete clinic product: ${error.message}`)
    }

    return true
  },

  async getLowStock(clinicId: string): Promise<ClinicProduct[]> {
    // Use a custom query for comparing columns
    const { data, error } = await supabase
      .from('clinic_products')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('low_stock_alert_enabled', true)
      .order('current_stock')

    if (error) {
      throw new Error(`Failed to fetch low stock products: ${error.message}`)
    }

    // Filter low stock products where current_stock <= minimum_stock
    return (data || []).filter(product => 
      product.current_stock <= product.minimum_stock
    )
  },

  async getOutOfStock(clinicId: string): Promise<ClinicProduct[]> {
    const { data, error } = await supabase
      .from('clinic_products')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('current_stock', 0)
      .order('product_name')

    if (error) {
      throw new Error(`Failed to fetch out of stock products: ${error.message}`)
    }

    return data || []
  }
}

// Real-time subscriptions
export const subscriptionService = {
  subscribeToClinicProducts(clinicId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`clinic_products:${clinicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_products',
          filter: `clinic_id=eq.${clinicId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToUserProfile(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_profiles:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

// Utility functions
export const supabaseUtils = {
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString('nl-NL')
  },

  generateId(): string {
    return crypto.randomUUID()
  }
} 