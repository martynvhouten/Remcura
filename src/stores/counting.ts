import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from './auth';
import type {
  CountingSession,
  CountingEntry,
  CountingProduct,
  CountingStats,
  StartCountingSessionRequest,
} from 'src/types/inventory';

export const useCountingStore = defineStore('counting', () => {
  // State
  const currentSession = ref<CountingSession | null>(null);
  const countingEntries = ref<CountingEntry[]>([]);
  const availableProducts = ref<CountingProduct[]>([]);
  const sessions = ref<CountingSession[]>([]);
  const loading = ref(false);
  const isCountingMode = ref(false);

  // Auth store
  const authStore = useAuthStore();

  // Getters
  const countingStats = computed((): CountingStats => {
    if (!currentSession.value) {
      return {
        total_products: 0,
        counted_products: 0,
        remaining_products: 0,
        discrepancies: 0,
        progress_percentage: 0,
      };
    }

    const totalProducts = currentSession.value.total_products_to_count;
    const countedProducts = currentSession.value.products_counted;
    const discrepancies = currentSession.value.discrepancies_found;

    return {
      total_products: totalProducts,
      counted_products: countedProducts,
      remaining_products: totalProducts - countedProducts,
      discrepancies,
      progress_percentage:
        totalProducts > 0 ? (countedProducts / totalProducts) * 100 : 0,
    };
  });

  const entriesWithVariance = computed(() =>
    countingEntries.value.filter(entry => Math.abs(entry.variance) > 0)
  );

  const entriesPendingVerification = computed(() =>
    countingEntries.value.filter(
      entry => entry.status === 'pending' || entry.status === 'discrepancy'
    )
  );

  const nextProductToCount = computed(() => {
    if (!availableProducts.value.length) return null;

    const countedProductIds = countingEntries.value.map(
      entry => entry.product_id
    );
    return (
      availableProducts.value.find(
        product => !countedProductIds.includes(product.id)
      ) || null
    );
  });

  // Actions
  const startCountingSession = async (request: StartCountingSessionRequest) => {
    try {
      loading.value = true;

      const { data: session, error: sessionError } = await supabase
        .from('counting_sessions')
        .insert([
          {
            ...request,
            started_by: authStore.user?.id,
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      currentSession.value = session;
      isCountingMode.value = true;

      // Fetch products to count
      await fetchProductsForSession(session.id);

      return session;
    } catch (error) {
      console.error('Error starting counting session:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsForSession = async (sessionId: string) => {
    try {
      const session =
        currentSession.value || sessions.value.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      // Build query to get products for counting
      let query = supabase
        .from('stock_levels')
        .select(
          `
          product_id,
          location_id,
          current_quantity,
          last_counted_at,
          location:practice_locations(name),
          product:products(id, name, sku, category, brand, unit, image_url)
        `
        )
        .eq('practice_id', session.practice_id)
        .in('location_id', session.location_ids);

      if (session.product_ids && session.product_ids.length > 0) {
        query = query.in('product_id', session.product_ids);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to CountingProduct format
      availableProducts.value = (data || []).map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        category: item.product.category,
        brand: item.product.brand,
        unit: item.product.unit,
        current_system_quantity: item.current_quantity,
        last_counted_at: item.last_counted_at,
        location_name: item.location.name,
        image_url: item.product.image_url,
      }));

      // Update session with product count
      if (currentSession.value) {
        await updateSession(session.id, {
          total_products_to_count: availableProducts.value.length,
        });
      }
    } catch (error) {
      console.error('Error fetching products for session:', error);
      throw error;
    }
  };

  const countProduct = async (
    productId: string,
    locationId: string,
    countedQuantity: number,
    options: {
      countMethod?: 'manual' | 'barcode' | 'rfid';
      confidenceLevel?: 'low' | 'medium' | 'high';
      batchNumber?: string;
      expiryDate?: string;
      notes?: string;
      photos?: string[];
    } = {}
  ) => {
    try {
      if (!currentSession.value) throw new Error('No active counting session');

      // Get current system quantity
      const { data: stockLevel, error: stockError } = await supabase
        .from('stock_levels')
        .select('current_quantity')
        .eq('practice_id', currentSession.value.practice_id)
        .eq('location_id', locationId)
        .eq('product_id', productId)
        .single();

      if (stockError) throw stockError;

      const systemQuantity = stockLevel?.current_quantity || 0;
      const variance = countedQuantity - systemQuantity;

      // Create counting entry
      const { data: entry, error: entryError } = await supabase
        .from('counting_entries')
        .insert([
          {
            session_id: currentSession.value.id,
            practice_id: currentSession.value.practice_id,
            location_id: locationId,
            product_id: productId,
            system_quantity: systemQuantity,
            counted_quantity: countedQuantity,
            count_method: options.countMethod || 'manual',
            confidence_level: options.confidenceLevel || 'high',
            batch_number: options.batchNumber,
            expiry_date: options.expiryDate,
            counted_by: authStore.user?.id,
            notes: options.notes,
            photos: options.photos,
            status: Math.abs(variance) > 0 ? 'discrepancy' : 'verified',
          },
        ])
        .select()
        .single();

      if (entryError) throw entryError;

      countingEntries.value.push(entry);

      // Update session progress
      const newProductsCountedCount = currentSession.value.products_counted + 1;
      const newDiscrepanciesCount =
        Math.abs(variance) > 0
          ? currentSession.value.discrepancies_found + 1
          : currentSession.value.discrepancies_found;

      await updateSession(currentSession.value.id, {
        products_counted: newProductsCountedCount,
        discrepancies_found: newDiscrepanciesCount,
      });

      return entry;
    } catch (error) {
      console.error('Error counting product:', error);
      throw error;
    }
  };

  const updateCountingEntry = async (
    entryId: string,
    updates: Partial<CountingEntry>
  ) => {
    try {
      const { data, error } = await supabase
        .from('counting_entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      const index = countingEntries.value.findIndex(
        entry => entry.id === entryId
      );
      if (index >= 0) {
        countingEntries.value[index] = data;
      }

      return data;
    } catch (error) {
      console.error('Error updating counting entry:', error);
      throw error;
    }
  };

  const completeCountingSession = async () => {
    try {
      if (!currentSession.value) throw new Error('No active counting session');

      await updateSession(currentSession.value.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: authStore.user?.id,
      });

      isCountingMode.value = false;
      return true;
    } catch (error) {
      console.error('Error completing counting session:', error);
      throw error;
    }
  };

  const approveCountingSession = async (sessionId: string) => {
    try {
      await updateSession(sessionId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: authStore.user?.id,
      });

      // If auto_adjust_stock is enabled, apply all count adjustments
      const session = sessions.value.find(s => s.id === sessionId);
      if (session?.auto_adjust_stock) {
        await applyCountAdjustments(sessionId);
      }

      return true;
    } catch (error) {
      console.error('Error approving counting session:', error);
      throw error;
    }
  };

  const applyCountAdjustments = async (sessionId: string) => {
    try {
      const session = sessions.value.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');

      // Get all entries with variances
      const { data: entries, error } = await supabase
        .from('counting_entries')
        .select('*')
        .eq('session_id', sessionId)
        .neq('variance', 0);

      if (error) throw error;

      // Apply each adjustment using the stock update function
      for (const entry of entries || []) {
        await supabase.rpc('update_stock_level', {
          p_practice_id: entry.practice_id,
          p_location_id: entry.location_id,
          p_product_id: entry.product_id,
          p_quantity_change: entry.variance,
          p_movement_type: 'count',
          p_performed_by: authStore.user?.id,
          p_reference_type: 'counting_session',
          p_reference_id: sessionId,
          p_reason_code: 'inventory_count',
          p_notes: `Stock count adjustment: ${entry.variance > 0 ? '+' : ''}${entry.variance}`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error applying count adjustments:', error);
      throw error;
    }
  };

  const updateSession = async (
    sessionId: string,
    updates: Partial<CountingSession>
  ) => {
    try {
      const { data, error } = await supabase
        .from('counting_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      if (currentSession.value?.id === sessionId) {
        currentSession.value = data;
      }

      const index = sessions.value.findIndex(s => s.id === sessionId);
      if (index >= 0) {
        sessions.value[index] = data;
      }

      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  };

  const fetchSessions = async (practiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('counting_sessions')
        .select('*')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      sessions.value = data || [];
    } catch (error) {
      console.error('Error fetching counting sessions:', error);
      throw error;
    }
  };

  const fetchCountingEntries = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('counting_entries')
        .select(
          `
          *,
          location:practice_locations(name),
          product:products(name, sku),
          counted_by_user:auth.users(email)
        `
        )
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      countingEntries.value = data || [];
    } catch (error) {
      console.error('Error fetching counting entries:', error);
      throw error;
    }
  };

  const cancelCountingSession = async () => {
    try {
      if (!currentSession.value) throw new Error('No active counting session');

      await updateSession(currentSession.value.id, {
        status: 'cancelled',
      });

      currentSession.value = null;
      isCountingMode.value = false;
      countingEntries.value = [];
      availableProducts.value = [];

      return true;
    } catch (error) {
      console.error('Error canceling counting session:', error);
      throw error;
    }
  };

  return {
    // State
    currentSession,
    countingEntries,
    availableProducts,
    sessions,
    loading,
    isCountingMode,

    // Getters
    countingStats,
    entriesWithVariance,
    entriesPendingVerification,
    nextProductToCount,

    // Actions
    startCountingSession,
    fetchProductsForSession,
    countProduct,
    updateCountingEntry,
    completeCountingSession,
    approveCountingSession,
    applyCountAdjustments,
    updateSession,
    fetchSessions,
    fetchCountingEntries,
    cancelCountingSession,
  };
});
