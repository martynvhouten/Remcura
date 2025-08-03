import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { supplierLogger } from '@/utils/logger';
import type {
  Supplier,
  SupplierProduct,
  CreateSupplierRequest,
} from '@/types/inventory';

export const useSuppliersStore = defineStore('suppliers', () => {
  // State
  const suppliers = ref<Supplier[]>([]);
  const supplierProducts = ref<SupplierProduct[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

  // Getters
  const activeSuppliers = computed(() =>
    suppliers.value.filter(supplier => supplier.is_active)
  );

  const suppliersWithSyncEnabled = computed(() =>
    suppliers.value.filter(supplier => supplier.sync_enabled)
  );

  const getSupplierById = computed(
    () => (id: string) => suppliers.value.find(supplier => supplier.id === id)
  );

  const getSupplierProductsBySupplier = computed(
    () => (supplierId: string) =>
      supplierProducts.value.filter(sp => sp.supplier_id === supplierId)
  );

  const getSupplierProductsForProduct = computed(
    () => (productId: string) =>
      supplierProducts.value.filter(sp => sp.product_id === productId)
  );

  // Actions
  const fetchSuppliers = async () => {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;

      suppliers.value = data || [];
      lastSyncAt.value = new Date();
    } catch (error) {
      supplierLogger.error('Error fetching suppliers:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createSupplier = async (supplierData: CreateSupplierRequest) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([
          {
            ...supplierData,
            payment_terms: supplierData.payment_terms || 30,
            minimum_order_amount: supplierData.minimum_order_amount || 0,
            shipping_cost: supplierData.shipping_cost || 0,
            sync_enabled: false,
            is_active: true,
            country: supplierData.country || 'Netherlands',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      suppliers.value.push(data);
      return data;
    } catch (error) {
      supplierLogger.error('Error creating supplier:', error);
      throw error;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const index = suppliers.value.findIndex(s => s.id === id);
      if (index >= 0) {
        suppliers.value[index] = data;
      }

      return data;
    } catch (error) {
      supplierLogger.error('Error updating supplier:', error);
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);

      if (error) throw error;

      suppliers.value = suppliers.value.filter(s => s.id !== id);
    } catch (error) {
      supplierLogger.error('Error deleting supplier:', error);
      throw error;
    }
  };

  const fetchSupplierProducts = async (supplierId?: string) => {
    try {
      let query = supabase
        .from('supplier_products')
        .select(
          `
          *,
          supplier:suppliers(name, code),
          product:products(name, sku, category, brand)
        `
        )
        .order('supplier_name');

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query;

      if (error) throw error;

      supplierProducts.value = data || [];
    } catch (error) {
      supplierLogger.error('Error fetching supplier products:', error);
      throw error;
    }
  };

  const createSupplierProduct = async (
    supplierProductData: Omit<
      SupplierProduct,
      'id' | 'created_at' | 'updated_at' | 'last_price_update'
    >
  ) => {
    try {
      const { data, error } = await supabase
        .from('supplier_products')
        .insert([
          {
            ...supplierProductData,
            currency: supplierProductData.currency || 'EUR',
            minimum_order_quantity:
              supplierProductData.minimum_order_quantity || 1,
            order_multiple: supplierProductData.order_multiple || 1,
            pack_size: supplierProductData.pack_size || 1,
            is_available: supplierProductData.is_available ?? true,
            is_backorder_allowed:
              supplierProductData.is_backorder_allowed ?? false,
            lead_time_days: supplierProductData.lead_time_days || 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      supplierProducts.value.push(data);
      return data;
    } catch (error) {
      supplierLogger.error('Error creating supplier product:', error);
      throw error;
    }
  };

  const updateSupplierProduct = async (
    id: string,
    updates: Partial<SupplierProduct>
  ) => {
    try {
      const { data, error } = await supabase
        .from('supplier_products')
        .update({
          ...updates,
          last_price_update:
            updates.unit_price !== undefined
              ? new Date().toISOString()
              : undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const index = supplierProducts.value.findIndex(sp => sp.id === id);
      if (index >= 0) {
        supplierProducts.value[index] = data;
      }

      return data;
    } catch (error) {
      supplierLogger.error('Error updating supplier product:', error);
      throw error;
    }
  };

  const deleteSupplierProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('supplier_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      supplierProducts.value = supplierProducts.value.filter(
        sp => sp.id !== id
      );
    } catch (error) {
      supplierLogger.error('Error deleting supplier product:', error);
      throw error;
    }
  };

  const findBestSupplierForProduct = (productId: string) => {
    const productSuppliers = supplierProducts.value.filter(
      sp => sp.product_id === productId && sp.is_available
    );

    if (productSuppliers.length === 0) { return null; }

    // Sort by price (lowest first), then by lead time
    return productSuppliers.sort((a, b) => {
      if (a.unit_price !== b.unit_price) {
        return a.unit_price - b.unit_price;
      }
      return a.lead_time_days - b.lead_time_days;
    })[0];
  };

  const syncSupplierData = async (supplierId: string) => {
    try {
      const supplier = suppliers.value.find(s => s.id === supplierId);
      if (!supplier || !supplier.sync_enabled) {
        throw new Error($t('suppliers.suppliersyncnotenabled'));
      }

      // This would implement actual API sync based on supplier.api_type
      // For now, we'll just update the last_sync_at timestamp
      await updateSupplier(supplierId, {
        last_sync_at: new Date().toISOString(),
      });

      // Refresh supplier products after sync
      await fetchSupplierProducts(supplierId);

      return { success: true, message: 'Supplier data synced successfully' };
    } catch (error) {
      supplierLogger.error('Error syncing supplier data:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchSuppliers(), fetchSupplierProducts()]);
  };

  return {
    // State
    suppliers,
    supplierProducts,
    loading,
    lastSyncAt,

    // Getters
    activeSuppliers,
    suppliersWithSyncEnabled,
    getSupplierById,
    getSupplierProductsBySupplier,
    getSupplierProductsForProduct,

    // Actions
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSupplierProducts,
    createSupplierProduct,
    updateSupplierProduct,
    deleteSupplierProduct,
    findBestSupplierForProduct,
    syncSupplierData,
    refreshData,
  };
});
