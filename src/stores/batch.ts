import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from './auth';
import type {
  ProductBatchWithDetails,
  ExpiringBatch,
  FifoBatch,
  CreateBatchRequest,
  UpdateBatchRequest,
  BatchStockMovementRequest,
  StockAlert,
  BatchStatus,
} from 'src/types/inventory';

export const useBatchStore = defineStore('batch', () => {
  // State
  const batches = ref<ProductBatchWithDetails[]>([]);
  const expiringBatches = ref<ExpiringBatch[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);
  const batchAlerts = ref<StockAlert[]>([]);

  // Auth store
  const authStore = useAuthStore();

  // Getters
  const activeBatches = computed(() => {
    return batches.value.filter(
      (batch) => batch.status === 'active' && batch.current_quantity > 0
    );
  });

  const expiredBatches = computed(() => {
    return batches.value.filter((batch) => {
      const expiryDate = new Date(batch.expiry_date);
      const today = new Date();
      return expiryDate <= today && batch.current_quantity > 0;
    });
  });

  const criticalExpiryBatches = computed(() => {
    return expiringBatches.value.filter(
      (batch) =>
        batch.urgency_level === 'critical' || batch.urgency_level === 'expired'
    );
  });

  const warningExpiryBatches = computed(() => {
    return expiringBatches.value.filter(
      (batch) => batch.urgency_level === 'warning'
    );
  });

  const batchesByProduct = computed(() => {
    return batches.value.reduce((acc, batch) => {
      const productId = batch.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product: batch.product,
          batches: [],
        };
      }
      acc[productId].batches.push(batch);
      return acc;
    }, {} as Record<string, { product: any; batches: ProductBatchWithDetails[] }>);
  });

  const batchesByLocation = computed(() => {
    return batches.value.reduce((acc, batch) => {
      const locationId = batch.location_id;
      if (!acc[locationId]) {
        acc[locationId] = {
          location: batch.location,
          batches: [],
        };
      }
      acc[locationId].batches.push(batch);
      return acc;
    }, {} as Record<string, { location: any; batches: ProductBatchWithDetails[] }>);
  });

  const totalBatchValue = computed(() => {
    return batches.value.reduce((total, batch) => {
      return total + batch.current_quantity * (batch.unit_cost || 0);
    }, 0);
  });

  const batchStats = computed(() => {
    const totalBatches = batches.value.length;
    const activeBatchCount = activeBatches.value.length;
    const expiredBatchCount = expiredBatches.value.length;
    const criticalCount = criticalExpiryBatches.value.length;
    const warningCount = warningExpiryBatches.value.length;

    return {
      totalBatches,
      activeBatchCount,
      expiredBatchCount,
      criticalCount,
      warningCount,
      expiryRate:
        totalBatches > 0 ? (expiredBatchCount / totalBatches) * 100 : 0,
    };
  });

  // Actions
  const fetchBatches = async (
    practiceId: string,
    filters?: {
      productId?: string;
      locationId?: string;
      status?: BatchStatus;
      expiryDays?: number;
    }
  ) => {
    loading.value = true;
    try {
      let query = supabase
        .from('product_batches')
        .select(
          `
          *,
          product:products(id, name, sku, category, brand, unit),
          location:practice_locations(id, name, code, location_type),
          supplier:suppliers(id, name, code)
        `
        )
        .eq('practice_id', practiceId);

      // Apply filters
      if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
      }
      if (filters?.locationId) {
        query = query.eq('location_id', filters.locationId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.expiryDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + filters.expiryDays);
        query = query.lte('expiry_date', futureDate.toISOString());
      }

      const { data, error } = await query.order('expiry_date', {
        ascending: true,
      });

      if (error) throw error;

      // Calculate days until expiry and urgency level for each batch
      const today = new Date();
      batches.value = (data || []).map((batch) => {
        const expiryDate = new Date(batch.expiry_date);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        let urgencyLevel: 'normal' | 'warning' | 'critical' | 'expired';
        if (daysUntilExpiry < 0) urgencyLevel = 'expired';
        else if (daysUntilExpiry <= 7) urgencyLevel = 'critical';
        else if (daysUntilExpiry <= 30) urgencyLevel = 'warning';
        else urgencyLevel = 'normal';

        return {
          ...batch,
          days_until_expiry: daysUntilExpiry,
          urgency_level: urgencyLevel,
        };
      });

      lastSyncAt.value = new Date();
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchExpiringBatches = async (practiceId: string, days = 30) => {
    try {
      const { data, error } = await supabase.rpc('get_expiring_batches', {
        p_practice_id: practiceId,
        p_days_ahead: days,
      });

      if (error) throw error;

      expiringBatches.value = data || [];
    } catch (error) {
      console.error('Error fetching expiring batches:', error);
      throw error;
    }
  };

  const getFifoBatches = async (
    practiceId: string,
    productId: string,
    locationId: string,
    requiredQuantity: number
  ): Promise<FifoBatch[]> => {
    try {
      const { data, error } = await supabase.rpc('get_fifo_batches', {
        p_practice_id: practiceId,
        p_product_id: productId,
        p_location_id: locationId,
        p_required_quantity: requiredQuantity,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting FIFO batches:', error);
      throw error;
    }
  };

  const createBatch = async (request: CreateBatchRequest) => {
    try {
      const { data, error } = await supabase
        .from('product_batches')
        .insert([
          {
            ...request,
            received_date: request.received_date || new Date().toISOString(),
            currency: request.currency || 'EUR',
            quality_check_passed: request.quality_check_passed ?? true,
            status: 'active',
            created_by: authStore.user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh batches after creation
      await fetchBatches(request.practice_id);

      return data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  };

  const updateBatch = async (request: UpdateBatchRequest) => {
    try {
      const { data, error } = await supabase
        .from('product_batches')
        .update({
          ...request,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id)
        .eq('practice_id', request.practice_id)
        .select()
        .single();

      if (error) throw error;

      // Refresh batches after update
      await fetchBatches(request.practice_id);

      return data;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  };

  const processBatchStockMovement = async (
    request: BatchStockMovementRequest
  ) => {
    try {
      const { data, error } = await supabase.rpc(
        'process_batch_stock_movement',
        {
          p_practice_id: request.practice_id,
          p_location_id: request.location_id,
          p_product_id: request.product_id,
          p_quantity_change: request.quantity_change,
          p_movement_type: request.movement_type,
          p_batch_movements: request.batch_movements,
          p_performed_by: authStore.user?.id,
          p_reason_code: request.reason_code,
          p_notes: request.notes,
        }
      );

      if (error) throw error;

      // Refresh batches after movement
      await fetchBatches(request.practice_id);

      return data;
    } catch (error) {
      console.error('Error processing batch stock movement:', error);
      throw error;
    }
  };

  const markBatchAsExpired = async (batchId: string, practiceId: string) => {
    try {
      const { error } = await supabase
        .from('product_batches')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', batchId)
        .eq('practice_id', practiceId);

      if (error) throw error;

      // Refresh batches after update
      await fetchBatches(practiceId);
    } catch (error) {
      console.error('Error marking batch as expired:', error);
      throw error;
    }
  };

  const markBatchAsDepleted = async (batchId: string, practiceId: string) => {
    try {
      const { error } = await supabase
        .from('product_batches')
        .update({
          status: 'depleted',
          current_quantity: 0,
          available_quantity: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', batchId)
        .eq('practice_id', practiceId);

      if (error) throw error;

      // Refresh batches after update
      await fetchBatches(practiceId);
    } catch (error) {
      console.error('Error marking batch as depleted:', error);
      throw error;
    }
  };

  const generateBatchAlerts = () => {
    const alerts: StockAlert[] = [];
    const now = new Date().toISOString();

    // Generate expiry alerts
    expiringBatches.value.forEach((batch) => {
      if (
        batch.urgency_level === 'critical' ||
        batch.urgency_level === 'expired'
      ) {
        alerts.push({
          type: batch.urgency_level === 'expired' ? 'expired' : 'expiring_soon',
          urgency: batch.urgency_level === 'expired' ? 'critical' : 'high',
          product_id: batch.product_id,
          product_name: batch.product_name,
          product_sku: batch.product_sku,
          location_id: batch.location_id,
          location_name: batch.location_name,
          current_quantity: batch.current_quantity,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          days_until_expiry: batch.days_until_expiry,
          message:
            batch.urgency_level === 'expired'
              ? `Batch ${batch.batch_number} of ${batch.product_name} has expired`
              : `Batch ${batch.batch_number} of ${batch.product_name} expires in ${batch.days_until_expiry} days`,
          suggested_action:
            batch.urgency_level === 'expired'
              ? 'Remove from inventory'
              : 'Use this batch first (FIFO)',
          created_at: now,
        });
      }
    });

    batchAlerts.value = alerts;
    return alerts;
  };

  const searchBatches = (searchTerm: string) => {
    if (!searchTerm.trim()) return batches.value;

    const term = searchTerm.toLowerCase();
    return batches.value.filter(
      (batch) =>
        batch.batch_number.toLowerCase().includes(term) ||
        batch.supplier_batch_number?.toLowerCase().includes(term) ||
        batch.product.name.toLowerCase().includes(term) ||
        batch.product.sku.toLowerCase().includes(term) ||
        batch.location.name.toLowerCase().includes(term) ||
        batch.supplier?.name.toLowerCase().includes(term)
    );
  };

  const getBatchById = (batchId: string) => {
    return batches.value.find((batch) => batch.id === batchId);
  };

  const getBatchesByProduct = (productId: string) => {
    return batches.value
      .filter((batch) => batch.product_id === productId)
      .sort(
        (a, b) =>
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );
  };

  const getBatchesByLocation = (locationId: string) => {
    return batches.value
      .filter((batch) => batch.location_id === locationId)
      .sort(
        (a, b) =>
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );
  };

  const refreshData = async (practiceId: string) => {
    await Promise.all([
      fetchBatches(practiceId),
      fetchExpiringBatches(practiceId),
    ]);
    generateBatchAlerts();
  };

  return {
    // State
    batches,
    expiringBatches,
    loading,
    lastSyncAt,
    batchAlerts,

    // Getters
    activeBatches,
    expiredBatches,
    criticalExpiryBatches,
    warningExpiryBatches,
    batchesByProduct,
    batchesByLocation,
    totalBatchValue,
    batchStats,

    // Actions
    fetchBatches,
    fetchExpiringBatches,
    getFifoBatches,
    createBatch,
    updateBatch,
    processBatchStockMovement,
    markBatchAsExpired,
    markBatchAsDepleted,
    generateBatchAlerts,
    searchBatches,
    getBatchById,
    getBatchesByProduct,
    getBatchesByLocation,
    refreshData,
  };
});
