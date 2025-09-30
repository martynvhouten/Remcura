import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { useAuthStore } from './auth';
import { countingLogger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/service-error-handler';
import { t as i18nT } from '@/utils/i18n-service';
import type { Tables, TablesInsert } from '@/types';
import type {
  CountingSession,
  CountingEntryDTO,
  CountingProduct,
  CountingStats,
  StartCountingSessionRequest,
} from '@/types/inventory';

export const useCountingStore = defineStore('counting', () => {
  // State
  const currentSession = ref<CountingSession | null>(null);
  const countingEntries = ref<CountingEntryDTO[]>([]);
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
        totalProducts: 0,
        countedProducts: 0,
        remainingProducts: 0,
        discrepancies: 0,
        progressPercentage: 0,
      };
    }

    const totalProducts =
      currentSession.value.total_products_counted ??
      countingEntries.value.length;
    const countedProducts = countingEntries.value.length;
    const discrepancies = countingEntries.value.filter(
      entry => Math.abs(entry.variance ?? 0) !== 0
    ).length;

    return {
      totalProducts,
      countedProducts,
      remainingProducts: totalProducts - countedProducts,
      discrepancies,
      progressPercentage:
        totalProducts > 0
          ? Number(((countedProducts / totalProducts) * 100).toFixed(2))
          : 0,
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

      const primaryLocation = request.location_ids[0];
      if (!primaryLocation) {
        throw new Error(
          'At least one location must be provided for counting session'
        );
      }

      const { data: session, error: sessionError } = await supabase
        .from('counting_sessions')
        .insert([
          {
            practice_id: request.practice_id,
            name: request.name,
            location_id: primaryLocation,
            started_by: authStore.user?.id ?? null,
            status: 'in_progress',
            count_all_products: request.session_type === 'full',
            specific_product_ids: request.product_ids ?? null,
            product_category_filter: request.category_filter ?? null,
            created_at: new Date().toISOString(),
          } satisfies TablesInsert<'counting_sessions'>,
        ])
        .select('*')
        .single();

      if (sessionError)
        return handleSupabaseError(sessionError, {
          service: 'countingStore',
          operation: 'startCountingSession',
          practiceId: request.practice_id,
          metadata: {},
        });

      currentSession.value = session as CountingSession;
      isCountingMode.value = true;

      await fetchProductsForSession(session.id);

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
        .in('location_id', session.location_ids ?? []);

      if (session.product_ids && session.product_ids.length > 0) {
        query = query.in('product_id', session.product_ids);
      }

      const { data, error } = await query;

      if (error) throw error;

      type StockLevelRow = {
        product_id: string;
        location_id: string;
        current_quantity: number;
        last_counted_at?: string | null;
        location: { name: string | null };
        product: {
          id: string;
          name: string;
          sku: string;
          category?: string | null;
          brand?: string | null;
          unit?: string | null;
          image_url?: string | null;
        };
      };

      const rows = (data ?? []) as StockLevelRow[];
      availableProducts.value = rows.map(
        item =>
          ({
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
            currentSystemQuantity: item.current_quantity ?? 0,
            locationName: item.location.name ?? '-',
            category: item.product.category ?? undefined,
            brand: item.product.brand ?? undefined,
            unit: item.product.unit ?? undefined,
            imageUrl: item.product.image_url ?? undefined,
            lastCountedAt: item.last_counted_at ?? undefined,
          }) satisfies CountingProduct
      );

      // Update session with product count
      if (currentSession.value) {
        await updateSession(session.id, {
          total_products_counted: availableProducts.value.length,
        });
      }
    } catch (error) {
      countingLogger.error(
        'Error fetching products for session',
        error as Error
      );
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
        return handleSupabaseError(stockError, {
          service: 'countingStore',
          operation: 'countProduct.fetchStockLevel',
          practiceId: currentSession.value.practice_id,
          metadata: { productId, locationId },
        });

      const systemQuantity =
        (stockLevel as unknown as { current_quantity?: number } | null)
          ?.current_quantity || 0;
      const variance = countedQuantity - systemQuantity;

      // Create counting entry
      const payload: TablesInsert<'counting_entries'> = {
        counting_session_id: currentSession.value.id,
        practice_id: currentSession.value.practice_id,
        location_id: locationId,
        product_id: productId,
        system_quantity: systemQuantity,
        counted_quantity: countedQuantity,
        counted_by: authStore.user?.id ?? null,
        confidence_level: options.confidenceLevel ?? null,
        batch_number: options.batchNumber ?? null,
        expiry_date: options.expiryDate ?? null,
        notes: options.notes ?? null,
      };

      const { data: entry, error: entryError } = await supabase
        .from('counting_entries')
        .insert([payload])
        .select()
        .single();

      if (entryError)
        return handleSupabaseError(entryError, {
          service: 'countingStore',
          operation: 'countProduct.insertEntry',
          practiceId: currentSession.value.practice_id,
          metadata: { sessionId: currentSession.value.id },
        });

      // Map DB row to app model
      const newEntry = mapDbEntryToCountingEntry(entry);
      countingEntries.value = [...countingEntries.value, newEntry];

      // Update session progress based on actual counts
      const newProductsCountedCount =
        (currentSession.value.total_products_counted ?? 0) + 1;
      const newDiscrepanciesCount =
        Math.abs(variance) > 0
          ? (currentSession.value.products_with_variance ?? 0) + 1
          : (currentSession.value.products_with_variance ?? 0);

      await updateSession(currentSession.value.id, {
        total_products_counted: newProductsCountedCount,
        products_with_variance: newDiscrepanciesCount,
      });

      return newEntry;
    } catch (error) {
      countingLogger.error('Error counting product:', error as Error);
      throw error;
    }
  };

  const updateCountingEntry = async (
    entryId: string,
    updates: Partial<Tables<'counting_entries'>>
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
        completed_by: authStore.user?.id ?? null,
      } satisfies Partial<Tables<'counting_sessions'>>);

      isCountingMode.value = false;
      return true;
    } catch (error) {
      countingLogger.error(
        'Error completing counting session:',
        error as Error
      );
      throw error;
    }
  };

  const approveCountingSession = async (sessionId: string) => {
    try {
      await updateSession(sessionId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: authStore.user?.id ?? null,
      } satisfies Partial<Tables<'counting_sessions'>>);

      // If auto_adjust_stock is enabled, apply all count adjustments
      const session = sessions.value.find(s => s.id === sessionId);
      if (
        session &&
        (session as CountingSession & { auto_adjust_stock?: boolean })
          .auto_adjust_stock
      ) {
        await applyCountAdjustments(sessionId);
      }

      return true;
    } catch (error) {
      countingLogger.error('Error approving counting session:', error as Error);
      throw error;
    }
  };

  type CountingEntryRow = Tables<'counting_entries'>;
  type CountingEntryWithRelations = CountingEntryRow & {
    location?: { name?: string | null };
    product?: { name?: string | null; sku?: string | null };
  };

  function mapDbEntryToCountingEntry(
    row: CountingEntryWithRelations
  ): CountingEntryDTO {
    const systemQuantity = row.system_quantity ?? 0;
    const countedQuantity = row.counted_quantity ?? 0;
    const varianceQuantity = row.variance_quantity ?? 0;
    const notes = `Stock count adjustment: ${varianceQuantity > 0 ? '+' : ''}${varianceQuantity}`;

    return {
      id: row.id,
      session_id: row.counting_session_id,
      practice_id: row.practice_id,
      location_id: row.location_id,
      product_id: row.product_id,
      system_quantity: systemQuantity,
      counted_quantity: countedQuantity,
      variance: varianceQuantity,
      confidence_level:
        (row.confidence_level as 'low' | 'medium' | 'high') ?? null,
      counted_by: row.counted_by ?? null,
      counted_at: row.counted_at ?? null,
      verified_by: row.verified_by ?? null,
      verified_at: row.verified_at ?? null,
      notes: row.notes ?? null,
      batch_number: row.batch_number ?? null,
      expiry_date: row.expiry_date ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
      status: Math.abs(varianceQuantity) > 0 ? 'discrepancy' : 'verified',
      location_name: row.location?.name ?? null,
      product_name: row.product?.name ?? null,
      product_sku: row.product?.sku ?? null,
    } satisfies CountingEntryDTO;
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
      for (const entry of entries || []) {
        const varianceQuantity = entry.variance_quantity ?? 0;
        const notes = `Stock count adjustment: ${varianceQuantity > 0 ? '+' : ''}${varianceQuantity}`;
        try {
          await supabase.rpc('update_stock_level', {
            p_practice_id: entry.practice_id,
            p_location_id: entry.location_id,
            p_product_id: entry.product_id,
            p_quantity_change: entry.variance_quantity ?? 0,
            p_movement_type: 'count',
            p_performed_by: authStore.user?.id ?? '',
            p_reference_type: 'counting_session',
            p_reference_id: sessionId,
            p_reason_code: 'inventory_count',
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
              operation: 'post.fallback.loadLevel',
              practiceId: entry.practice_id,
              metadata: { sessionId },
            });

          const levelRow = level as { current_quantity?: number } | null;
          const beforeQty = levelRow?.current_quantity ?? 0;
          const afterQty = beforeQty + (entry.variance_quantity as number);

          const { error: mvErr } = await supabase
            .from('stock_movements')
            .insert([
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
                performed_by: authStore.user?.id ?? entry.practice_id,
              },
            ]);
          if (mvErr)
            handleSupabaseError(mvErr, {
              service: 'countingStore',
              operation: 'post.fallback.insertMovement',
              practiceId: entry.practice_id,
              metadata: { sessionId },
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
              operation: 'post.fallback.updateLevel',
              practiceId: entry.practice_id,
              metadata: { sessionId },
            });
        }
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
      const practiceId =
        currentSession.value?.practice_id ||
        authStore.userProfile?.clinic_id ||
        '';
      // Enforce practice_id guard on update
      const { safeUpdateByIdAndPractice } = await import(
        '@/services/safeUpdate'
      );
      const data = await safeUpdateByIdAndPractice<
        CountingSession & Record<string, unknown>
      >('counting_sessions', sessionId, practiceId, {
        ...updates,
      });

      if (!data) throw new Error('Failed to update counting session');

      if (currentSession.value?.id === sessionId) {
        currentSession.value = data as unknown as CountingSession;
      }

      const index = sessions.value.findIndex(s => s.id === sessionId);
      if (index >= 0) {
        sessions.value[index] = data as unknown as CountingSession;
      }

      return data as unknown as CountingSession;
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
          operation: 'fetchSessions',
          practiceId: practiceId,
          metadata: {},
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
          operation: 'fetchSessionById',
          practiceId: practiceId,
          metadata: { sessionId },
        });

      currentSession.value = (data as unknown as CountingSession) || null;
      return currentSession.value;
    } catch (error) {
      countingLogger.error(
        'Error fetching counting session by id:',
        error as Error
      );
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
          operation: 'fetchCountingEntries',
          ...(currentSession.value?.practice_id
            ? { practiceId: currentSession.value.practice_id }
            : {}),
          metadata: { sessionId },
        });

      type CountingEntryWithRelations = CountingEntryRow & {
        location?: { name?: string | null };
        product?: { name?: string | null; sku?: string | null };
      };
      const rows = (data ?? []) as CountingEntryWithRelations[];
      countingEntries.value = rows.map(row => {
        const entry = mapDbEntryToCountingEntry(row);
        if (row.location?.name) {
          entry.location_name = row.location.name;
        }
        if (row.product?.name) {
          entry.product_name = row.product.name;
        }
        if (row.product?.sku) {
          entry.product_sku = row.product.sku;
        }
        return entry;
      });
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
      if (
        session.status !== 'approved' &&
        (session as CountingSession & { require_approval?: boolean })
          .require_approval
      ) {
        await updateSession(sessionId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: authStore.user?.id ?? null,
        } satisfies Partial<Tables<'counting_sessions'>>);
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
          operation: 'post.beforeMovements',
          practiceId: session.practice_id,
          metadata: { sessionId },
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
          operation: 'post.fetchEntries',
          practiceId: session.practice_id,
          metadata: { sessionId },
        });

      for (const entry of entries || []) {
        const varianceQuantity = entry.variance_quantity ?? 0;
        const notes = `Stock count adjustment: ${varianceQuantity > 0 ? '+' : ''}${varianceQuantity}`;
        try {
          await supabase.rpc('update_stock_level', {
            p_practice_id: entry.practice_id,
            p_location_id: entry.location_id,
            p_product_id: entry.product_id,
            p_quantity_change: entry.variance_quantity ?? 0,
            p_movement_type: 'count',
            p_performed_by: authStore.user?.id ?? entry.practice_id,
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
              operation: 'post.fallback.loadLevel',
              practiceId: entry.practice_id,
              metadata: { sessionId },
            });

          const levelRow = level as { current_quantity?: number } | null;
          const beforeQty = levelRow?.current_quantity ?? 0;
          const afterQty = beforeQty + (entry.variance_quantity as number);

          const { error: mvErr } = await supabase
            .from('stock_movements')
            .insert([
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
                performed_by: authStore.user?.id ?? entry.practice_id,
              },
            ]);
          if (mvErr)
            handleSupabaseError(mvErr, {
              service: 'countingStore',
              operation: 'post.fallback.insertMovement',
              practiceId: entry.practice_id,
              metadata: { sessionId },
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
              operation: 'post.fallback.updateLevel',
              practiceId: entry.practice_id,
              metadata: { sessionId },
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
          operation: 'post.afterMovements',
          practiceId: session.practice_id,
          metadata: { sessionId },
        });

      const beforeIds = new Set((beforeMovements ?? []).map(m => m.id));
      const newIds = (afterMovements ?? [])
        .map(m => m.id)
        .filter(id => !beforeIds.has(id));

      lastPostedMovementIds.value[sessionId] = newIds as string[];

      // Mark session as approved/posted
      await updateSession(sessionId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: authStore.user?.id ?? null,
      } satisfies Partial<Tables<'counting_sessions'>>);

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
          operation: 'undo.loadMovements',
          practiceId: currentSession.value?.practice_id ?? '',
          metadata: { sessionId },
        });

      // Reverse stock by applying negative of quantity_change
      const movementRows = movements ?? [];
      for (const mv of movementRows) {
        try {
          await supabase.rpc('update_stock_level', {
            p_practice_id: mv.practice_id,
            p_location_id: mv.location_id,
            p_product_id: mv.product_id,
            p_quantity_change: -mv.quantity_change,
            p_movement_type: 'correction',
            p_performed_by: authStore.user?.id ?? mv.practice_id,
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
              operation: 'undo.fallback.loadLevel',
              practiceId: mv.practice_id,
              metadata: { sessionId },
            });
          const beforeQty =
            (level as unknown as { current_quantity?: number } | null)
              ?.current_quantity || 0;
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
              operation: 'undo.fallback.updateLevel',
              practiceId: mv.practice_id,
              metadata: { sessionId },
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
          operation: 'undo.deleteMovements',
          practiceId: currentSession.value?.practice_id ?? '',
          metadata: { sessionId },
        });

      // Re-open the session
      await updateSession(sessionId, {
        status: 'in_progress',
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
