import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { clinicLogger } from '@/utils/logger';
import type { Tables } from '@/types';
import type { PracticeLocation } from '@/types/inventory';
import { ServiceErrorHandler } from '@/utils/service-error-handler';

type PracticeRow = Tables<'practices'>;
type PracticeLocationRow = Tables<'practice_locations'>;

export const useClinicStore = defineStore('clinic', () => {
  // State
  const clinic = ref<PracticeRow | null>(null);
  const locations = ref<PracticeLocationRow[]>([]);
  const loading = ref(false);
  const locationsLoading = ref(false);

  // Computed
  const practiceLocations = computed<PracticeLocation[]>(() =>
    locations.value.map(
      location =>
        ({
          id: location.id,
          name: location.name,
          code: location.code,
          practice_id: location.practice_id,
          description: location.description ?? null,
          location_type: location.location_type,
          address: location.address ?? null,
          floor_level: location.floor_level ?? null,
          room_number: location.room_number ?? null,
          is_main_location: location.is_main_location ?? false,
          requires_counting: location.requires_counting ?? false,
          allows_negative_stock: location.allows_negative_stock ?? false,
          restricted_access: location.restricted_access ?? false,
          access_code: location.access_code ?? null,
          responsible_user_id: location.responsible_user_id ?? null,
          created_at: location.created_at ?? null,
          created_by: location.created_by ?? null,
          updated_at: location.updated_at ?? null,
          updated_by: location.updated_by ?? null,
        }) as PracticeLocation
    )
  );

  const mainLocation = computed(() => {
    return practiceLocations.value.find(location => location.is_main_location);
  });

  const activeLocations = computed(() => {
    return practiceLocations.value.filter(location => location.is_active);
  });

  // Actions
  const fetchClinic = async (clinicId: string) => {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('id', clinicId)
        .single<PracticeRow>();

      if (error) throw error;

      clinic.value = data;
    } catch (error) {
      clinicLogger.error('Error fetching practice', {
        error: error instanceof Error ? error.message : String(error),
      });
      ServiceErrorHandler.handle(
        error as Error,
        {
          service: 'ClinicStore',
          operation: 'fetchClinic',
          metadata: { clinicId },
        },
        { rethrow: false, logLevel: 'error' }
      );
    } finally {
      loading.value = false;
    }
  };

  const fetchLocations = async (practiceId: string) => {
    locationsLoading.value = true;
    try {
      const { data, error } = await supabase
        .from('practice_locations')
        .select('*')
        .eq('practice_id', practiceId)
        .eq('is_active', true)
        .order('is_main_location', { ascending: false })
        .order('name');

      if (error) throw error;

      locations.value = (data as PracticeLocationRow[]) || [];
    } catch (error) {
      clinicLogger.error('Error fetching locations', {
        error: error instanceof Error ? error.message : String(error),
      });
      ServiceErrorHandler.handle(
        error as Error,
        {
          service: 'ClinicStore',
          operation: 'fetchLocations',
          metadata: { practiceId },
        },
        { rethrow: false, logLevel: 'error' }
      );
    } finally {
      locationsLoading.value = false;
    }
  };

  const refreshData = async () => {
    if (clinic.value) {
      await Promise.all([
        fetchClinic(clinic.value.id),
        fetchLocations(clinic.value.id),
      ]);
    }
  };

  return {
    // State
    clinic,
    locations,
    loading,
    locationsLoading,

    // Computed
    practiceLocations,
    mainLocation,
    activeLocations,

    // Actions
    fetchClinic,
    fetchLocations,
    refreshData,
  };
});
