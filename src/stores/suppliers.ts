import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { createLogger } from '@/utils/logger';
import type {
  SupplierView,
  SupplierProduct,
  SupplierRow,
  SupplierProductRow,
  SupplierProductInsert,
  SupplierProductUpdate,
  CreateSupplierRequest,
} from '@/types/inventory';
import { useAuthStore } from '@/stores/auth';

const mapSupplierRowToView = (row: SupplierRow): SupplierView => ({
  id: row.id,
  name: row.name,
  code: row.code,
  contact_email: row.contact_email ?? null,
  contact_phone: row.contact_phone ?? null,
  contact_person: row.contact_person ?? null,
  address: row.address ?? null,
  city: row.city ?? null,
  postal_code: row.postal_code ?? null,
  country: row.country ?? null,
  website: row.website ?? null,
  vat_number: row.vat_number ?? null,
  business_registration: row.business_registration ?? null,
  payment_terms: row.payment_terms ?? null,
  minimum_order_amount: row.minimum_order_amount ?? null,
  shipping_cost: row.shipping_cost ?? null,
  free_shipping_threshold: row.free_shipping_threshold ?? null,
  api_endpoint: row.api_endpoint ?? null,
  api_type: row.api_type ?? null,
  sync_enabled: row.sync_enabled ?? null,
  is_active: row.is_active ?? null,
  preferred_order_day: row.preferred_order_day ?? null,
  order_cutoff_time: row.order_cutoff_time ?? null,
  created_at: row.created_at ?? null,
  updated_at: row.updated_at ?? null,
});

export const useSuppliersStore = defineStore('suppliers', () => {
  const log = createLogger('SuppliersStore');
  const authStore = useAuthStore();
  const practiceId = computed(() => authStore.userProfile?.clinic_id ?? null);

  const suppliers = ref<SupplierView[]>([]);
  const supplierProducts = ref<SupplierProduct[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

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

  const ensurePractice = () => {
    if (!practiceId.value) {
      throw new Error('No practice selected');
    }
    return practiceId.value;
  };

  const fetchSuppliers = async () => {
    loading.value = true;
    try {
      const currentPracticeId = ensurePractice();
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('practice_id', currentPracticeId)
        .order('name');

      if (error) throw error;

      suppliers.value = (data ?? []).map(row =>
        mapSupplierRowToView(row as SupplierRow)
      );
      lastSyncAt.value = new Date();
    } catch (error) {
      log.error('Error fetching suppliers', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createSupplier = async (supplierData: CreateSupplierRequest) => {
    try {
      const currentPracticeId = ensurePractice();
      const { data, error } = await supabase
        .from('suppliers')
        .insert([
          {
            ...supplierData,
            payment_terms: supplierData.payment_terms ?? 30,
            minimum_order_amount: supplierData.minimum_order_amount ?? 0,
            shipping_cost: supplierData.shipping_cost ?? 0,
            sync_enabled: false,
            is_active: true,
            country: supplierData.country ?? 'Netherlands',
            practice_id: currentPracticeId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error('Failed to create supplier');
      }

      suppliers.value.push(mapSupplierRowToView(data as SupplierRow));
      return mapSupplierRowToView(data as SupplierRow);
    } catch (error) {
      log.error('Error creating supplier', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<SupplierView>) => {
    try {
      const currentPracticeId = ensurePractice();
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .eq('practice_id', currentPracticeId)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error('Failed to update supplier');
      }

      const index = suppliers.value.findIndex(s => s.id === id);
      if (index >= 0) {
        suppliers.value[index] = mapSupplierRowToView(data as SupplierRow);
      }

      return mapSupplierRowToView(data as SupplierRow);
    } catch (error) {
      log.error('Error updating supplier', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const currentPracticeId = ensurePractice();
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
        .eq('practice_id', currentPracticeId);

      if (error) throw error;

      suppliers.value = suppliers.value.filter(s => s.id !== id);
    } catch (error) {
      log.error('Error deleting supplier', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const fetchSupplierProducts = async (supplierId?: string) => {
    try {
      const currentPracticeId = ensurePractice();
      let query = supabase
        .from('supplier_products')
        .select(
          `
          *,
          supplier:suppliers(name, code),
          product:products(name, sku, category, brand)
        `
        )
        .eq('practice_id', currentPracticeId)
        .order('supplier_name');

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data, error } = await query;

      if (error) throw error;

      supplierProducts.value = (
        (data as SupplierProductRow[] | null) ?? []
      ).map(
        row =>
          ({
            ...row,
            cost_price: row.cost_price ?? null,
            currency: row.currency ?? null,
            list_price: row.list_price ?? null,
            minimum_order_quantity: row.minimum_order_quantity ?? null,
            order_multiple: row.order_multiple ?? null,
            is_available: row.is_available ?? null,
            is_preferred: row.is_preferred ?? null,
            lead_time_days: row.lead_time_days ?? null,
            gtin: row.gtin ?? null,
            supplier_name: row.supplier_name ?? null,
            created_at: row.created_at ?? null,
            updated_at: row.updated_at ?? null,
          }) satisfies SupplierProduct
      );
    } catch (error) {
      log.error('Error fetching supplier products', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const createSupplierProduct = async (
    supplierProductData: SupplierProductInsert
  ) => {
    try {
      const currentPracticeId = ensurePractice();
      const { data, error } = await supabase
        .from('supplier_products')
        .insert([
          {
            practice_id: currentPracticeId,
            supplier_id: supplierProductData.supplier_id,
            product_id: supplierProductData.product_id,
            list_price: supplierProductData.list_price ?? null,
            cost_price: supplierProductData.cost_price ?? null,
            currency: supplierProductData.currency ?? null,
            minimum_order_quantity:
              supplierProductData.minimum_order_quantity ?? null,
            order_multiple: supplierProductData.order_multiple ?? null,
            is_available: supplierProductData.is_available ?? null,
            lead_time_days: supplierProductData.lead_time_days ?? null,
            is_preferred: supplierProductData.is_preferred ?? null,
            gtin: supplierProductData.gtin ?? null,
            supplier_name: supplierProductData.supplier_name ?? null,
            supplier_sku: supplierProductData.supplier_sku,
          } as any,
        ])
        .select()
        .single<SupplierProductRow>();

      if (error) throw error;
      if (!data) {
        throw new Error('Failed to create supplier product');
      }

      const mapped = {
        ...data,
        list_price: data.list_price ?? null,
        cost_price: data.cost_price ?? null,
        currency: data.currency ?? null,
        minimum_order_quantity: data.minimum_order_quantity ?? null,
        order_multiple: data.order_multiple ?? null,
        is_available: data.is_available ?? null,
        is_preferred: data.is_preferred ?? null,
        lead_time_days: data.lead_time_days ?? null,
        gtin: data.gtin ?? null,
        created_at: data.created_at ?? null,
        updated_at: data.updated_at ?? null,
      } satisfies SupplierProduct;

      supplierProducts.value.push(mapped);
      return mapped;
    } catch (error) {
      log.error('Error creating supplier product', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const updateSupplierProduct = async (
    id: string,
    updates: Partial<SupplierProduct>
  ) => {
    try {
      const currentPracticeId = ensurePractice();
      const { data, error } = await supabase
        .from('supplier_products')
        .update({
          cost_price: updates.cost_price ?? null,
          currency: updates.currency ?? null,
          list_price: updates.list_price ?? null,
          minimum_order_quantity: updates.minimum_order_quantity ?? null,
          order_multiple: updates.order_multiple ?? null,
          is_available: updates.is_available ?? null,
          is_preferred: updates.is_preferred ?? null,
          lead_time_days: updates.lead_time_days ?? null,
          gtin: updates.gtin ?? null,
          supplier_name: updates.supplier_name ?? null,
          supplier_sku: updates.supplier_sku,
          updated_at: new Date().toISOString(),
        } satisfies SupplierProductUpdate)
        .eq('id', id)
        .eq('practice_id', currentPracticeId)
        .select()
        .single<SupplierProductRow>();

      if (error) throw error;
      if (!data) {
        throw new Error('Failed to update supplier product');
      }

      const index = supplierProducts.value.findIndex(sp => sp.id === id);
      if (index >= 0) {
        supplierProducts.value[index] = {
          ...data,
          list_price: data.list_price ?? null,
          cost_price: data.cost_price ?? null,
          currency: data.currency ?? null,
          minimum_order_quantity: data.minimum_order_quantity ?? null,
          order_multiple: data.order_multiple ?? null,
          is_available: data.is_available ?? null,
          is_preferred: data.is_preferred ?? null,
          lead_time_days: data.lead_time_days ?? null,
          gtin: data.gtin ?? null,
          created_at: data.created_at ?? null,
          updated_at: data.updated_at ?? null,
        } satisfies SupplierProduct;
      }

      return supplierProducts.value[index];
    } catch (error) {
      log.error('Error updating supplier product', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const deleteSupplierProduct = async (id: string) => {
    try {
      const currentPracticeId = ensurePractice();
      const { error } = await supabase
        .from('supplier_products')
        .delete()
        .eq('id', id)
        .eq('practice_id', currentPracticeId);

      if (error) throw error;

      supplierProducts.value = supplierProducts.value.filter(
        sp => sp.id !== id
      );
    } catch (error) {
      log.error('Error deleting supplier product', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const findBestSupplierForProduct = (productId: string) => {
    const productSuppliers = supplierProducts.value.filter(
      sp => sp.product_id === productId && sp.is_available
    );

    if (productSuppliers.length === 0) {
      return null;
    }

    return productSuppliers.slice().sort((a, b) => {
      if (a.list_price !== b.list_price) {
        return (a.list_price ?? 0) - (b.list_price ?? 0);
      }
      return (a.lead_time_days ?? 0) - (b.lead_time_days ?? 0);
    })[0];
  };

  const syncSupplierData = async (supplierId: string) => {
    try {
      ensurePractice();
      // Sync supplier products and metadata if needed
      await fetchSupplierProducts(supplierId);
      lastSyncAt.value = new Date();
    } catch (error) {
      log.error('Error syncing supplier data', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  return {
    suppliers,
    supplierProducts,
    loading,
    lastSyncAt,
    activeSuppliers,
    suppliersWithSyncEnabled,
    getSupplierById,
    getSupplierProductsBySupplier,
    getSupplierProductsForProduct,
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
  };
});
