import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabase } from 'src/boot/supabase'
import type { Practice, ProductWithItems } from 'src/types/supabase'
import { useAuthStore } from './auth'
import { useStockStatus } from 'src/composables/useStockStatus'

export const useClinicStore = defineStore('clinic', () => {
  // State
  const clinic = ref<Practice | null>(null)
  const products = ref<ProductWithItems[]>([])
  const loading = ref(false)

  // Use stock status composable
  const { filterByStockStatus, getStockSummary, getStockStatus } = useStockStatus()

  // Helper function to get stock data from product
  const getProductStockData = (product: ProductWithItems) => {
    const item = product.product_list_items?.[0]
    return {
      current_stock: item?.current_stock || 0,
      minimum_stock: item?.minimum_stock || 0,
      maximum_stock: item?.maximum_stock
    }
  }

  // Enhanced getters using the composable
  const lowStockProducts = computed(() =>
    products.value.filter((product: ProductWithItems) => {
      const stockData = getProductStockData(product)
      const status = getStockStatus(stockData.current_stock, stockData.minimum_stock, stockData.maximum_stock)
      return status === 'low-stock'
    })
  )

  const outOfStockProducts = computed(() =>
    products.value.filter((product: ProductWithItems) => {
      const stockData = getProductStockData(product)
      const status = getStockStatus(stockData.current_stock, stockData.minimum_stock, stockData.maximum_stock)
      return status === 'out-of-stock'
    })
  )

  const highStockProducts = computed(() =>
    products.value.filter((product: ProductWithItems) => {
      const stockData = getProductStockData(product)
      const status = getStockStatus(stockData.current_stock, stockData.minimum_stock, stockData.maximum_stock)
      return status === 'high-stock'
    })
  )

  const inStockProducts = computed(() =>
    products.value.filter((product: ProductWithItems) => {
      const stockData = getProductStockData(product)
      const status = getStockStatus(stockData.current_stock, stockData.minimum_stock, stockData.maximum_stock)
      return status === 'in-stock'
    })
  )

  // Aliases for backwards compatibility
  const lowStockItems = computed(() => lowStockProducts.value)
  const outOfStockItems = computed(() => outOfStockProducts.value)

  // Enhanced stock summary using composable
  const stockSummary = computed(() => {
    const stockData = products.value.map(getProductStockData)
    const summary = getStockSummary(stockData)
    
    return {
      total: summary.total,
      lowStock: summary.lowStock,
      outOfStock: summary.outOfStock,
      inStock: summary.inStock,
      highStock: summary.highStock,
      needsAttention: summary.needsAttention,
      percentageInStock: summary.percentageInStock
    }
  })

  // Actions
  const fetchClinic = async (clinicId: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('id', clinicId)
        .single()

      if (error) throw error
      
      clinic.value = data
    } catch (error) {
      console.error('Error fetching practice:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchProducts = async () => {
    const authStore = useAuthStore()
    const practiceId = authStore.clinicId
    
    if (!practiceId) {
      console.warn('No practice ID available')
      return
    }

    loading.value = true
    try {
      // Get all product lists for this practice
      const { data: productLists, error: listError } = await supabase
        .from('product_lists')
        .select('id')
        .eq('practice_id', practiceId)

      if (listError) {
        console.error('Error fetching product lists:', listError)
        throw listError
      }

      if (!productLists || productLists.length === 0) {
        console.warn('No product lists found for practice')
        products.value = []
        return
      }

      // Get the product list IDs
      const listIds = productLists.map(list => list.id)

      // Now fetch products with their product list items from any of the lists
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_list_items!inner(
            id,
            product_list_id,
            minimum_stock,
            maximum_stock,
            current_stock
          )
        `)
        .in('product_list_items.product_list_id', listIds)
        .order('name')

      if (error) throw error
      
      products.value = (data || []) as ProductWithItems[]
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      loading.value = false
    }
  }

  const addProduct = async (product: Omit<ProductWithItems, 'id' | 'created_at' | 'updated_at' | 'product_list_items'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
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

  const updateProduct = async (id: string, updates: Partial<ProductWithItems>) => {
    try {
      const { data, error } = await supabase
        .from('products')
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
        .from('products')
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

  const getReorderSuggestion = (product: ProductWithItems) => {
    const item = product.product_list_items?.[0]
    if (!item) return null

    const { current_stock, minimum_stock, maximum_stock } = item
    
    if (current_stock <= minimum_stock) {
      const suggestionQuantity = Math.max(
        maximum_stock - current_stock,
        minimum_stock * 2 - current_stock
      )
      
      return {
        product_id: product.id,
        product_name: product.name,
        current_stock,
        minimum_stock,
        maximum_stock,
        suggested_quantity: suggestionQuantity,
        urgency: current_stock === 0 ? 'critical' : 'medium'
      }
    }
    
    return null
  }

  const refreshData = async () => {
    const authStore = useAuthStore()
    if (authStore.clinicId) {
      await Promise.all([
        fetchClinic(authStore.clinicId),
        fetchProducts()
      ])
    }
  }

  return {
    // State
    clinic: readonly(clinic),
    products: readonly(products),
    loading: readonly(loading),

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
    getReorderSuggestion,
    refreshData
  }
}) 