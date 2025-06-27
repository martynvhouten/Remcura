import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from 'src/boot/supabase'
import type { Clinic, ClinicProduct } from 'src/types/supabase'
import { useAuthStore } from './auth'

export const useClinicStore = defineStore('clinic', () => {
  // State
  const clinic = ref<Clinic | null>(null)
  const products = ref<ClinicProduct[]>([])
  const loading = ref(false)

  // Getters
  const lowStockProducts = computed(() =>
    products.value.filter(product => 
      product.low_stock_alert_enabled && 
      product.current_stock <= product.minimum_stock
    )
  )

  const outOfStockProducts = computed(() =>
    products.value.filter(product => 
      product.current_stock === 0
    )
  )

  const lowStockItems = computed(() => 
    products.value.filter(product => 
      product.current_stock > 0 && 
      product.current_stock <= product.minimum_stock
    )
  )

  const outOfStockItems = computed(() => 
    products.value.filter(product => 
      product.current_stock === 0
    )
  )

  const stockSummary = computed(() => ({
    total: products.value.length,
    lowStock: lowStockProducts.value.length,
    outOfStock: outOfStockProducts.value.length,
    inStock: products.value.length - outOfStockProducts.value.length
  }))

  // Actions
  const fetchClinic = async (clinicId: string) => {
    loading.value = true
    try {
      // Demo mode
      if (clinicId === 'demo-clinic-id') {
        clinic.value = {
          id: 'demo-clinic-id',
          name: 'Demo Medisch Centrum',
          address: 'Demostraat 123, 1234 AB Amsterdam',
          contact_email: 'info@demo-clinic.nl',
          contact_phone: '+31 20 123 4567',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        loading.value = false
        return
      }

      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single()

      if (error) throw error
      
      clinic.value = data
    } catch (error) {
      console.error('Error fetching clinic:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchProducts = async () => {
    const authStore = useAuthStore()
    const clinicId = authStore.clinicId
    
    if (!clinicId) return

    loading.value = true
    try {
      // Demo mode
      if (clinicId === 'demo-clinic-id') {
        products.value = [
          {
            id: 'demo-product-1',
            clinic_id: 'demo-clinic-id',
            product_name: 'Wegwerpspuiten 5ml',
            product_sku: 'SPR-5ML-001',
            product_description: 'Steriele wegwerpspuiten 5ml met naald',
            current_stock: 45,
            minimum_stock: 50,
            maximum_stock: 200,
            reorder_enabled: true,
            low_stock_alert_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-product-2',
            clinic_id: 'demo-clinic-id',
            product_name: 'Steriele handschoenen M',
            product_sku: 'GLV-M-001',
            product_description: 'Nitril handschoenen maat M, poedervrij',
            current_stock: 120,
            minimum_stock: 100,
            maximum_stock: 500,
            reorder_enabled: true,
            low_stock_alert_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-product-3',
            clinic_id: 'demo-clinic-id',
            product_name: 'Bloeddrukmeter',
            product_sku: 'BPM-DIG-001',
            product_description: 'Digitale bloeddrukmeter met manchet',
            current_stock: 0,
            minimum_stock: 5,
            maximum_stock: 10,
            reorder_enabled: true,
            low_stock_alert_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-product-4',
            clinic_id: 'demo-clinic-id',
            product_name: 'Medische thermometer',
            product_sku: 'THM-DIG-001',
            product_description: 'Digitale thermometer contactloos',
            current_stock: 8,
            minimum_stock: 10,
            maximum_stock: 25,
            reorder_enabled: true,
            low_stock_alert_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        loading.value = false
        return
      }

      const { data, error } = await supabase
        .from('clinic_products')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('product_name')

      if (error) throw error
      
      products.value = data || []
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      loading.value = false
    }
  }

  const addProduct = async (product: Omit<ClinicProduct, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clinic_products')
        .insert([product])
        .select()
        .single()

      if (error) throw error

      if (data) {
        products.value.push(data)
      }

      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to add product'
      }
    }
  }

  const updateProduct = async (id: string, updates: Partial<ClinicProduct>) => {
    try {
      const { data, error } = await supabase
        .from('clinic_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index] = data
        }
      }

      return { success: true, data }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to update product'
      }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clinic_products')
        .delete()
        .eq('id', id)

      if (error) throw error

      products.value = products.value.filter(p => p.id !== id)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to delete product'
      }
    }
  }

  const getReorderSuggestion = (product: ClinicProduct) => {
    if (product.current_stock >= product.maximum_stock) {
      return 0
    }
    
    const suggested = product.maximum_stock - product.current_stock
    return suggested > 0 ? suggested : 0
  }

  return {
    // State
    clinic,
    products,
    loading,

    // Getters
    lowStockProducts,
    outOfStockProducts,
    lowStockItems,
    outOfStockItems,
    stockSummary,

    // Actions
    fetchClinic,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getReorderSuggestion
  }
}) 