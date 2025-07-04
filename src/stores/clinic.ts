import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "src/boot/supabase";
import type { Practice, Location } from "src/types/supabase";
import type { PracticeLocation } from "src/types/inventory";

export const useClinicStore = defineStore("clinic", () => {
  // State
  const clinic = ref<Practice | null>(null);
  const locations = ref<Location[]>([]);
  const loading = ref(false);
  const locationsLoading = ref(false);

  // Computed
  const practiceLocations = computed<PracticeLocation[]>(() => {
    return locations.value.map((location) => ({
      id: location.id,
      practice_id: location.practice_id,
      name: location.name,
      code: location.name.toUpperCase().replace(/\s+/g, "_"),
      description: location.description || "",
      location_type: "storage" as const, // Default type since the Supabase schema doesn't have this field
      address: location.address || "",
      is_active: location.is_active,
      is_main_location: location.is_main,
      requires_counting: true,
      allows_negative_stock: false,
      restricted_access: false,
      created_at: location.created_at,
      updated_at: location.updated_at,
    }));
  });

  const mainLocation = computed(() => {
    return practiceLocations.value.find(
      (location) => location.is_main_location
    );
  });

  const activeLocations = computed(() => {
    return practiceLocations.value.filter((location) => location.is_active);
  });

  // Actions
  const fetchClinic = async (clinicId: string) => {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from("practices")
        .select("*")
        .eq("id", clinicId)
        .single();

      if (error) throw error;

      clinic.value = data;
    } catch (error) {
      console.error("Error fetching practice:", error);
    } finally {
      loading.value = false;
    }
  };

  const fetchLocations = async (practiceId: string) => {
    locationsLoading.value = true;
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("practice_id", practiceId)
        .eq("is_active", true)
        .order("is_main", { ascending: false })
        .order("name");

      if (error) throw error;

      locations.value = data || [];
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
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
