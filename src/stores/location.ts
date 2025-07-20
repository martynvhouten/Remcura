import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PracticeLocation } from 'src/types/inventory';

export const useLocationStore = defineStore('location', () => {
  // State
  const locations = ref<PracticeLocation[]>([]);
  const currentLocation = ref<PracticeLocation | null>(null);
  const loading = ref(false);

  // Getters
  const getLocationById = computed(() => {
    return (id: string) => locations.value.find(location => location.id === id);
  });

  const activeLocations = computed(() => {
    return locations.value.filter(location => location.is_active);
  });

  const mainLocation = computed(() => {
    return locations.value.find(location => location.is_main_location);
  });

  // Actions
  const fetchLocations = async (practiceId: string) => {
    loading.value = true;
    try {
      // Mock implementation - this should fetch from Supabase
      locations.value = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          practice_id: practiceId,
          name: 'Hoofdlocatie',
          code: 'MAIN',
          description: 'Hoofdlocatie voor voorraadopslag',
          location_type: 'storage',
          is_active: true,
          is_main_location: true,
          requires_counting: true,
          allows_negative_stock: false,
          restricted_access: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          practice_id: practiceId,
          name: 'Locatie Centrum',
          code: 'CTR',
          description: 'Centrum behandelkamer',
          location_type: 'treatment',
          is_active: true,
          is_main_location: false,
          requires_counting: true,
          allows_negative_stock: false,
          restricted_access: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          practice_id: practiceId,
          name: 'Locatie Noord',
          code: 'NTH',
          description: 'Noord behandelkamer',
          location_type: 'treatment',
          is_active: true,
          is_main_location: false,
          requires_counting: true,
          allows_negative_stock: false,
          restricted_access: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Set current location to main location if none selected
      if (!currentLocation.value && mainLocation.value) {
        currentLocation.value = mainLocation.value;
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const setCurrentLocation = (location: PracticeLocation | null) => {
    currentLocation.value = location;
  };

  const createLocation = async (locationData: Partial<PracticeLocation>) => {
    // Mock implementation
    const newLocation: PracticeLocation = {
      id: `loc_${Date.now()}`,
      practice_id: locationData.practice_id || '',
      name: locationData.name || '',
      code: locationData.code || '',
      description: locationData.description,
      location_type: locationData.location_type || 'storage',
      is_active: locationData.is_active !== false,
      is_main_location: locationData.is_main_location || false,
      requires_counting: locationData.requires_counting !== false,
      allows_negative_stock: locationData.allows_negative_stock || false,
      restricted_access: locationData.restricted_access || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    locations.value.push(newLocation);
    return newLocation;
  };

  return {
    // State
    locations,
    currentLocation,
    loading,

    // Getters
    getLocationById,
    activeLocations,
    mainLocation,

    // Actions
    fetchLocations,
    setCurrentLocation,
    createLocation,
  };
});
