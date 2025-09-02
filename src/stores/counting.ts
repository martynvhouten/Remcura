import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { useAuthStore } from './auth';
import { countingLogger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/service-error-handler';
import { t as i18nT } from '@/utils/i18n-service';
import type { Database } from '@/types/supabase';
import type {
  CountingSession,
  CountingEntry,
  CountingProduct,
  CountingStats,
  StartCountingSessionRequest,
} from '@/types/inventory';

export const useCountingStore = defineStore('counting', () => {
  // State
  const currentSession = ref<CountingSession | null>(null);
  const countingEntries = ref<CountingEntry[]>([]);
  const availableProducts = ref<CountingProduct[]>([]);
  const sessions = ref<CountingSession[]>([]);
  const loading = ref(false);
  const isCountingMode = ref(false);
  const lastPostedMovementIds = ref<Record<string, string[]>>({});

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
    if (!availableProducts.value.length) {
      return null;
    }

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
            status: 'active',
          },
        ])
        .select()
        .single();

      if (sessionError)
        return handleSupabaseError(sessionError, {
          service: 'countingStore',
          method: 'startCountingSession',
          practice_id: request.practice_id,
          additional_data: {},
        });

      currentSession.value = session as unknown as CountingSession;
      isCountingMode.value = true;

      // Fetch products to count
      await fetchProductsForSession((session as any).id);

      return session;
    } catch (error) {
      countingLogger.error('Error starting counting session', error as Error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsForSession = async (sessionId: string) => {
    try {
      const session =
        currentSession.value || sessions.value.find(s => s.id === sessionId);
      if (!session) throw new Error(i18nT('counting.sessionnotfound'));

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

      const { data, error } = await query as any;

      if (error) throw error;

      // Transform to CountingProduct format
      type StockLevelRow = {
        product_id: string;
        location_id: string;
        current_quantity: number;
        last_counted_at?: string;
        location: { name: string };
        product: {
          id: string;
          name: string;
          sku: string;
          category?: string;
          brand?: string;
          unit?: string;
          image_url?: string;
        };
      };

      availableProducts.value =
        ((data as StockLevelRow[] | null)?.map((item: StockLevelRow) => {
          const product: CountingProduct = {
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          current_system_quantity: item.current_quantity,
          location_name: item.location.name,
          };
          if (item.product.category) product.category = item.product.category;
          if (item.product.brand) product.brand = item.product.brand;
          if (item.product.unit) product.unit = item.product.unit;
          if (item.product.image_url) product.image_url = item.product.image_url;
          if (item.last_counted_at) product.last_counted_at = item.last_counted_at;
          return product;
        }) || []);

      // Update session with product count
      if (currentSession.value) {
        await updateSession(session.id, {
          total_products_to_count: availableProducts.value.length,
        });
      }
    } catch (error) {
      countingLogger.error('Error fetching products for session', error as Error);
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
      if (!currentSession.value) {
        throw new Error(i18nT('counting.noactivecountingsession'));
      }

      // Get current system quantity
      const { data: stockLevel, error: stockError } = await supabase
        .from('stock_levels')
        .select('current_quantity')
        .eq('practice_id', currentSession.value.practice_id)
        .eq('location_id', locationId)
        .eq('product_id', productId)
        .single();

      if (stockError)
        handleSupabaseError(stockError, {
          service: 'countingStore',
          method: 'countProduct.fetchStockLevel',
          additional_data: { productId, locationId },
        });

      const systemQuantity = (stockLevel as unknown as { current_quantity?: number } | null)?.current_quantity || 0;
      const variance = countedQuantity - systemQuantity;

      // Create counting entry
      const payload: Database['public']['Tables']['counting_entries']['Insert'] = {
        counting_session_id: currentSession.value.id,
            practice_id: currentSession.value.practice_id,
            location_id: locationId,
            product_id: productId,
            system_quantity: systemQuantity,
            counted_quantity: countedQuantity,
        counted_by: authStore.user?.id || null,
        confidence_level: options.confidenceLevel || null,
        batch_number: options.batchNumber || null,
        expiry_date: options.expiryDate || null,
        notes: options.notes || null,
      };

      const { data: entry, error: entryError } = await supabase
        .from('counting_entries')
        .insert([payload])
        .select()
        .single();

      if (entryError)
        handleSupabaseError(entryError, {
          service: 'countingStore',
          method: 'countProduct.insertEntry',
          additional_data: { sessionId: currentSession.value.id },
        });

      // Map DB row to app model
      const newEntry = mapDbEntryToCountingEntry(entry);
      countingEntries.value.push(newEntry);

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

      return newEntry;
    } catch (error) {
      countingLogger.error('Error counting product:', error as Error);
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
        countingEntries.value[index] = mapDbEntryToCountingEntry(data);
      }

      return mapDbEntryToCountingEntry(data);
    } catch (error) {
      countingLogger.error('Error updating counting entry:', error as Error);
      throw error;
    }
  };

  const completeCountingSession = async () => {
    try {
      if (!currentSession.value) {
        throw new Error(i18nT('counting.noactivecountingsession'));
      }

      await updateSession(currentSession.value.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: authStore.user?.id,
      });

      isCountingMode.value = false;
      return true;
    } catch (error) {
      countingLogger.error('Error completing counting session:', error as Error);
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
      countingLogger.error('Error approving counting session:', error as Error);
      throw error;
    }
  };

  function mapDbEntryToCountingEntry(row: any): CountingEntry {
    return {
      id: row.id,
      session_id: row.counting_session_id,
      practice_id: row.practice_id,
      location_id: row.location_id,
      product_id: row.product_id,
      system_quantity: row.system_quantity,
      counted_quantity: row.counted_quantity,
      variance: row.variance_quantity ?? (row.counted_quantity - row.system_quantity),
      count_method: 'manual',
      confidence_level: (row.confidence_level as 'low' | 'medium' | 'high') || 'high',
      recount_required: false,
      counted_by: row.counted_by,
      counted_at: row.counted_at || row.created_at,
      status: Math.abs((row.variance_quantity ?? 0)) > 0 ? 'discrepancy' : 'verified',
      notes: row.notes || undefined,
      batch_number: row.batch_number || undefined,
      expiry_date: row.expiry_date || undefined,
      verified_by: row.verified_by || undefined,
      verified_at: row.verified_at || undefined,
      photos: [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  const applyCountAdjustments = async (sessionId: string) => {
    try {
      const session = sessions.value.find(s => s.id === sessionId);
      if (!session) throw new Error(i18nT('counting.sessionnotfound'));

      // Get all entries with variances
      const { data: entries, error } = await supabase
        .from('counting_entries')
        .select('*')
        .eq('counting_session_id', sessionId)
        .neq('variance_quantity', 0);

      if (error) throw error;

      // Apply each adjustment using the stock update function
      for (const entry of (entries || []) as any[]) {
        await supabase.rpc('update_stock_level', {
          p_practice_id: entry.practice_id,
          p_location_id: entry.location_id,
          p_product_id: entry.product_id,
          p_quantity_change: entry.variance_quantity,
          p_movement_type: 'count',
          p_performed_by: authStore.user?.id,
          p_reference_type: 'counting_session',
          p_reference_id: sessionId,
          p_reason_code: 'inventory_count',
          p_notes: `Stock count adjustment: ${entry.variance_quantity > 0 ? '+' : ''}${
            entry.variance_quantity
          }`,
        });
      }

      return true;
    } catch (error) {
      countingLogger.error('Error applying count adjustments:', error as Error);
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

      if (error)
        handleSupabaseError(error, {
          service: 'countingStore',
          method: 'updateSession',
          additional_data: { sessionId },
        });

      if (currentSession.value?.id === sessionId) {
        currentSession.value = (data as unknown as CountingSession);
      }

      const index = sessions.value.findIndex(s => s.id === sessionId);
      if (index >= 0) {
        sessions.value[index] = (data as unknown as CountingSession);
      }

      return (data as unknown as CountingSession);
    } catch (error) {
      countingLogger.error('Error updating session:', error as Error);
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

      if (error)
        handleSupabaseError(error, {
          service: 'countingStore',
          method: 'fetchSessions',
          practice_id: practiceId,
          additional_data: {},
        });

      sessions.value = (data as unknown as CountingSession[]) || [];
    } catch (error) {
      countingLogger.error('Error fetching counting sessions:', error as Error);
      throw error;
    }
  };

  const fetchSessionById = async (
    practiceId: string,
    sessionId: string
  ): Promise<CountingSession | null> => {
    try {
      const { data, error } = await supabase
        .from('counting_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('practice_id', practiceId)
        .single();

      if (error)
        handleSupabaseError(error, {
          service: 'countingStore',
          method: 'fetchSessionById',
          practice_id: practiceId,
          additional_data: { sessionId },
        });

      currentSession.value = (data as unknown as CountingSession) || null;
      return currentSession.value;
    } catch (error) {
      countingLogger.error('Error fetching counting session by id:', error as Error);
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
          product:products(name, sku)
        `
        )
        .eq('counting_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error)
        handleSupabaseError(error, {
          service: 'countingStore',
          method: 'fetchCountingEntries',
          additional_data: { sessionId },
        });

      const rows = (data || []) as any[];
      countingEntries.value = rows.map(mapDbEntryToCountingEntry);
    } catch (error) {
      countingLogger.error('Error fetching counting entries:', error as Error);
      throw error;
    }
  };

  const postCountingSession = async (
    sessionId: string
  ): Promise<{ movementIds: string[] }> => {
    try {
      // Ensure session loaded
      const session =
        currentSession.value || sessions.value.find(s => s.id === sessionId);
      if (!session) throw new Error(i18nT('counting.sessionnotfound'));

      // If approval is required, move to review (completed) without posting
      if (session.require_approval) {
        await updateSession(sessionId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: authStore.user?.id,
        });
        return { movementIds: [] };
      }

      // Baseline existing movement IDs for this session
      const { data: beforeMovements, error: beforeErr } = await supabase
        .from('stock_movements')
        .select('id')
        .eq('reference_type', 'counting_session')
        .eq('reference_id', sessionId);
      if (beforeErr)
        handleSupabaseError(beforeErr, {
          service: 'countingStore',
          method: 'post.beforeMovements',
          additional_data: { sessionId },
        });

      // Load entries with variance
      const { data: entries, error: entriesErr } = await supabase
        .from('counting_entries')
        .select('*')
        .eq('counting_session_id', sessionId)
        .neq('variance_quantity', 0);
      if (entriesErr)
        handleSupabaseError(entriesErr, {
          service: 'countingStore',
          method: 'post.fetchEntries',
          additional_data: { sessionId },
        });

      for (const entry of (entries || []) as any[]) {
        const notes = `Stock count adjustment: ${
          entry.variance_quantity > 0 ? '+' : ''
        }${entry.variance_quantity}`;
        try {
          await supabase.rpc('update_stock_level', {
            p_practice_id: entry.practice_id,
            p_location_id: entry.location_id,
            p_product_id: entry.product_id,
            p_quantity_change: entry.variance_quantity,
            p_movement_type: 'count',
            p_performed_by: authStore.user?.id,
            p_reference_type: 'counting_session',
            p_reference_id: sessionId,
            p_reason_code: 'count_correction',
            p_notes: notes,
          });
        } catch (rpcError) {
          // Fallback: manual movement + stock level update
          const { data: level, error: levelErr } = await supabase
            .from('stock_levels')
            .select('current_quantity')
            .eq('practice_id', entry.practice_id)
            .eq('location_id', entry.location_id)
            .eq('product_id', entry.product_id)
            .single();
          if (levelErr)
            handleSupabaseError(levelErr, {
              service: 'countingStore',
              method: 'post.fallback.loadLevel',
              additional_data: { sessionId },
            });

          const beforeQty = (level as unknown as { current_quantity?: number } | null)?.current_quantity || 0;
          const afterQty = beforeQty + (entry.variance_quantity as number);

          const { error: mvErr } = await supabase.from('stock_movements').insert([
            {
              practice_id: entry.practice_id,
              location_id: entry.location_id,
              product_id: entry.product_id,
              movement_type: 'count',
              quantity_change: entry.variance_quantity as number,
              quantity_before: beforeQty,
              quantity_after: afterQty,
              reference_type: 'counting_session',
              reference_id: sessionId,
              reason_code: 'count_correction',
              notes,
              performed_by: authStore.user?.id,
            },
          ]);
          if (mvErr)
            handleSupabaseError(mvErr, {
              service: 'countingStore',
              method: 'post.fallback.insertMovement',
              additional_data: { sessionId },
            });

          const { error: updErr } = await supabase
            .from('stock_levels')
            .update({ current_quantity: afterQty })
            .eq('practice_id', entry.practice_id)
            .eq('location_id', entry.location_id)
            .eq('product_id', entry.product_id);
          if (updErr)
            handleSupabaseError(updErr, {
              service: 'countingStore',
              method: 'post.fallback.updateLevel',
              additional_data: { sessionId },
            });
        }
      }

      // Get new movement IDs
      const { data: afterMovements, error: afterErr } = await supabase
        .from('stock_movements')
        .select('id')
        .eq('reference_type', 'counting_session')
        .eq('reference_id', sessionId);
      if (afterErr)
        handleSupabaseError(afterErr, {
          service: 'countingStore',
          method: 'post.afterMovements',
          additional_data: { sessionId },
        });

      const beforeIds = new Set((beforeMovements || []).map((m: any) => m.id));
      const newIds = (afterMovements || [])
        .map((m: any) => m.id)
        .filter(id => !beforeIds.has(id));

      lastPostedMovementIds.value[sessionId] = newIds as string[];

      // Mark session as approved/posted
      await updateSession(sessionId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: authStore.user?.id,
      });

      return { movementIds: newIds };
    } catch (error) {
      countingLogger.error('Error posting counting session:', error as Error);
      throw error;
    }
  };

  const undoLastPosting = async (sessionId: string): Promise<boolean> => {
    try {
      const ids = lastPostedMovementIds.value[sessionId] || [];
      if (!ids.length) return false;

      // Load movements details
      const { data: movements, error: movementsErr } = await supabase
        .from('stock_movements')
        .select('*')
        .in('id', ids);
      if (movementsErr)
        handleSupabaseError(movementsErr, {
          service: 'countingStore',
          method: 'undo.loadMovements',
          additional_data: { sessionId },
        });

      // Reverse stock by applying negative of quantity_change
      for (const mv of (movements || []) as any[]) {
        try {
          await supabase.rpc('update_stock_level', {
            p_practice_id: mv.practice_id,
            p_location_id: mv.location_id,
            p_product_id: mv.product_id,
            p_quantity_change: -mv.quantity_change,
            p_movement_type: 'correction',
            p_performed_by: authStore.user?.id,
            p_reference_type: 'counting_session',
            p_reference_id: sessionId,
            p_reason_code: 'count_correction',
            p_notes: 'Undo counting post',
          });
        } catch (rpcError) {
          // Fallback: directly adjust stock_levels
          const { data: level, error: levelErr } = await supabase
            .from('stock_levels')
            .select('current_quantity')
            .eq('practice_id', mv.practice_id)
            .eq('location_id', mv.location_id)
            .eq('product_id', mv.product_id)
            .single();
          if (levelErr)
            handleSupabaseError(levelErr, {
              service: 'countingStore',
              method: 'undo.fallback.loadLevel',
              additional_data: { sessionId },
            });
          const beforeQty = (level as unknown as { current_quantity?: number } | null)?.current_quantity || 0;
          const afterQty = beforeQty - (mv.quantity_change as number);
          const { error: updErr } = await supabase
            .from('stock_levels')
            .update({ current_quantity: afterQty })
            .eq('practice_id', mv.practice_id)
            .eq('location_id', mv.location_id)
            .eq('product_id', mv.product_id);
          if (updErr)
            handleSupabaseError(updErr, {
              service: 'countingStore',
              method: 'undo.fallback.updateLevel',
              additional_data: { sessionId },
            });
        }
      }

      // Delete original movements
      const { error: delErr } = await supabase
        .from('stock_movements')
        .delete()
        .in('id', ids);
      if (delErr)
        handleSupabaseError(delErr, {
          service: 'countingStore',
          method: 'undo.deleteMovements',
          additional_data: { sessionId },
        });

      // Re-open the session
      await updateSession(sessionId, {
        status: 'active',
      });

      delete lastPostedMovementIds.value[sessionId];
      return true;
    } catch (error) {
      countingLogger.error('Error undoing posting:', error as Error);
      throw error;
    }
  };

  const cancelCountingSession = async () => {
    try {
      if (!currentSession.value) {
        throw new Error(i18nT('counting.noactivecountingsession'));
      }

      await updateSession(currentSession.value.id, {
        status: 'cancelled',
      });

      currentSession.value = null;
      isCountingMode.value = false;
      countingEntries.value = [];
      availableProducts.value = [];

      return true;
    } catch (error) {
      countingLogger.error('Error canceling counting session:', error as Error);
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
    lastPostedMovementIds,

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
    fetchSessionById,
    fetchCountingEntries,
    cancelCountingSession,
    postCountingSession,
    undoLastPosting,
  };
});
