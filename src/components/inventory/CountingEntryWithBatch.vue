<template>
  <div class="counting-entry-with-batch">
    <BaseCard class="entry-card">
      <q-card-section class="entry-header">
        <div class="flex justify-between items-center">
          <div class="product-info">
            <div class="text-h6">{{ product.name }}</div>
            <div class="text-caption">
              {{ product.sku }} • {{ product.category }}
            </div>
          </div>
          <q-chip
            :color="statusColor"
            :icon="statusIcon"
            text-color="white"
            :label="statusLabel"
          />
        </div>
      </q-card-section>

      <q-card-section class="entry-content">
        <!-- Current Stock Display -->
        <div class="current-stock-section q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            {{ $t('inventory.currentStock') }}
          </div>
          <div class="stock-display">
            <q-chip color="info" text-color="white" icon="inventory">
              {{ currentStock }} {{ product.unit }}
            </q-chip>
          </div>
        </div>

        <!-- Batch Information Section -->
        <div
          v-if="viewMode === 'full' || hasBatches"
          class="batch-section q-mb-md"
        >
          <div class="text-subtitle2 q-mb-sm">
            {{ $t('batch.batchInformation') }}
          </div>

          <!-- Existing Batches -->
          <div
            v-if="existingBatches.length > 0"
            class="existing-batches q-mb-md"
          >
            <div class="text-caption q-mb-xs">
              {{ $t('batch.existingBatches') }}:
            </div>
            <div class="batch-list">
              <q-card
                v-for="batch in existingBatches"
                :key="batch.id"
                flat
                bordered
                class="batch-item"
                :class="{ 'selected-batch': selectedBatch?.id === batch.id }"
                @click="selectBatch(batch)"
              >
                <q-card-section class="q-pa-sm">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="text-weight-medium">
                        {{ batch.batch_number }}
                      </div>
                      <div class="text-caption">
                        {{ $t('batch.expires') }}:
                        {{ formatDate(batch.expiry_date) }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-weight-medium">
                        {{ batch.current_quantity }}
                      </div>
                      <div class="text-caption">{{ product.unit }}</div>
                    </div>
                  </div>
                  <q-linear-progress
                    v-if="batch.urgency_level !== 'normal'"
                    :value="getUrgencyValue(batch.urgency_level)"
                    :color="getUrgencyColor(batch.urgency_level)"
                    size="2px"
                    class="q-mt-xs"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- New Batch Input (for full mode or when adding new batch) -->
          <div
            v-if="viewMode === 'full' || addingNewBatch"
            class="new-batch-input"
          >
            <div class="text-caption q-mb-xs">
              {{ $t('batch.addNewBatch') }}:
            </div>
            <BatchInput
              v-model="newBatchData"
              :view-mode="viewMode"
              :location-id="locationId"
              @validation-changed="onBatchValidationChanged"
            />
          </div>

          <!-- Add New Batch Button (for lite mode) -->
          <q-btn
            v-if="viewMode === 'lite' && !addingNewBatch"
            flat
            dense
            color="primary"
            icon="add"
            :label="$t('batch.addNewBatch')"
            @click="addingNewBatch = true"
            size="sm"
          />
        </div>

        <!-- Counted Quantity Input -->
        <div class="counted-quantity-section">
          <div class="text-subtitle2 q-mb-sm">
            {{ $t('counting.countedQuantity') }}
          </div>
          <q-input
            v-model.number="countedQuantity"
            type="number"
            min="0"
            step="1"
            outlined
            dense
            :label="$t('counting.enterCount')"
            :placeholder="$t('counting.enterQuantity')"
          >
            <template #append>
              <span class="text-caption">{{ product.unit }}</span>
            </template>
          </q-input>
        </div>

        <!-- Discrepancy Display -->
        <div v-if="hasDiscrepancy" class="discrepancy-section q-mt-md">
          <q-banner :class="discrepancyClass" rounded dense>
            <template #avatar>
              <q-icon :name="discrepancyIcon" />
            </template>
            <div class="text-subtitle2">{{ discrepancyMessage }}</div>
            <div class="text-body2">
              {{ $t('counting.difference') }}: {{ discrepancyAmount }}
              {{ product.unit }}
            </div>
          </q-banner>
        </div>

        <!-- Notes Section -->
        <div v-if="viewMode === 'full'" class="notes-section q-mt-md">
          <q-input
            v-model="notes"
            type="textarea"
            :label="$t('common.notes')"
            :placeholder="$t('counting.addNotes')"
            outlined
            dense
            rows="2"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-if="viewMode === 'lite' && addingNewBatch"
          flat
          color="negative"
          :label="$t('common.cancel')"
          @click="cancelNewBatch"
        />
        <q-btn
          color="primary"
          :label="$t('counting.saveCount')"
          @click="saveEntry"
          :loading="saving"
          :disable="!isValid"
          unelevated
        />
      </q-card-actions>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useBatchStore } from 'src/stores/batch';
  import { useAuthStore } from 'src/stores/auth';
  import BaseCard from 'src/components/base/BaseCard.vue';
  import BatchInput from 'src/components/BatchInput.vue';
  import type {
    Product,
    ProductBatchWithDetails,
    CountingEntry,
  } from 'src/types/inventory';
  import { useFormatting } from 'src/composables/useFormatting';

  interface Props {
    product: Product;
    sessionId: string;
    locationId: string;
    viewMode?: 'lite' | 'full';
    existingEntry?: CountingEntry;
  }

  interface Emits {
    (e: 'entry-saved', entry: CountingEntry): void;
    (e: 'entry-updated', entry: CountingEntry): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    viewMode: 'full',
  });

  const emit = defineEmits<Emits>();

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const batchStore = useBatchStore();
  const authStore = useAuthStore();
  const { formatDate } = useFormatting();

  // Reactive state
  const countedQuantity = ref<number | null>(null);
  const selectedBatch = ref<ProductBatchWithDetails | null>(null);
  const newBatchData = ref<any>({});
  const notes = ref('');
  const saving = ref(false);
  const addingNewBatch = ref(false);
  const batchValidationPassed = ref(true);

  // Computed
  const existingBatches = computed(() => {
    return batchStore
      .batchesByProduct(props.product.id)
      .filter(batch => batch.location_id === props.locationId);
  });

  const hasBatches = computed(() => existingBatches.value.length > 0);

  const currentStock = computed(() => {
    return existingBatches.value.reduce(
      (total, batch) => total + batch.current_quantity,
      0
    );
  });

  const hasDiscrepancy = computed(() => {
    return (
      countedQuantity.value !== null &&
      countedQuantity.value !== currentStock.value
    );
  });

  const discrepancyAmount = computed(() => {
    if (countedQuantity.value === null) return 0;
    return countedQuantity.value - currentStock.value;
  });

  const discrepancyClass = computed(() => {
    if (!hasDiscrepancy.value) return '';
    return discrepancyAmount.value > 0
      ? 'bg-orange-1 text-orange-8'
      : 'bg-red-1 text-red-8';
  });

  const discrepancyIcon = computed(() => {
    if (!hasDiscrepancy.value) return '';
    return discrepancyAmount.value > 0 ? 'trending_up' : 'trending_down';
  });

  const discrepancyMessage = computed(() => {
    if (!hasDiscrepancy.value) return '';
    return discrepancyAmount.value > 0
      ? t('counting.overageDetected')
      : t('counting.shortageDetected');
  });

  const statusColor = computed(() => {
    if (props.existingEntry) {
      switch (props.existingEntry.status) {
        case 'completed':
          return 'positive';
        case 'reviewed':
          return 'info';
        case 'flagged':
          return 'warning';
        default:
          return 'grey';
      }
    }
    return 'grey';
  });

  const statusIcon = computed(() => {
    if (props.existingEntry) {
      switch (props.existingEntry.status) {
        case 'completed':
          return 'check_circle';
        case 'reviewed':
          return 'verified';
        case 'flagged':
          return 'flag';
        default:
          return 'pending';
      }
    }
    return 'pending';
  });

  const statusLabel = computed(() => {
    if (props.existingEntry) {
      return t(`counting.entryStatus.${props.existingEntry.status}`);
    }
    return t('counting.entryStatus.pending');
  });

  const isValid = computed(() => {
    const hasValidCount =
      countedQuantity.value !== null && countedQuantity.value >= 0;
    const hasValidBatch = !addingNewBatch.value || batchValidationPassed.value;
    return hasValidCount && hasValidBatch;
  });

  // Methods
  const selectBatch = (batch: ProductBatchWithDetails) => {
    selectedBatch.value = selectedBatch.value?.id === batch.id ? null : batch;
  };

  const getUrgencyValue = (urgencyLevel: string): number => {
    switch (urgencyLevel) {
      case 'critical':
        return 1;
      case 'high':
        return 0.8;
      case 'warning':
        return 0.6;
      default:
        return 0;
    }
  };

  const getUrgencyColor = (urgencyLevel: string): string => {
    switch (urgencyLevel) {
      case 'critical':
        return 'negative';
      case 'high':
        return 'warning';
      case 'warning':
        return 'orange';
      default:
        return 'primary';
    }
  };

  const onBatchValidationChanged = (isValid: boolean) => {
    batchValidationPassed.value = isValid;
  };

  const cancelNewBatch = () => {
    addingNewBatch.value = false;
    newBatchData.value = {};
  };

  const saveEntry = async () => {
    try {
      saving.value = true;

      const entryData = {
        session_id: props.sessionId,
        product_id: props.product.id,
        location_id: props.locationId,
        system_quantity: currentStock.value,
        counted_quantity: countedQuantity.value || 0,
        discrepancy: discrepancyAmount.value,
        notes: notes.value,
        counted_by: authStore.user?.id || '',
        counted_at: new Date().toISOString(),
        status: hasDiscrepancy.value ? 'flagged' : 'completed',
      };

      // Add batch information if available
      if (selectedBatch.value) {
        entryData.batch_id = selectedBatch.value.id;
      }

      // Handle new batch creation if needed
      if (addingNewBatch.value && newBatchData.value.batchNumber) {
        // Create new batch first
        const batchRequest = {
          practice_id: authStore.clinicId,
          product_id: props.product.id,
          location_id: props.locationId,
          batch_number: newBatchData.value.batchNumber,
          expiry_date: newBatchData.value.expiryDate,
          initial_quantity: newBatchData.value.quantity || 0,
          current_quantity: newBatchData.value.quantity || 0,
          unit_cost: 0, // Default value, can be updated later
          currency: 'EUR',
        };

        const newBatch = await batchStore.createBatch(batchRequest);
        entryData.batch_id = newBatch.id;
      }

      // Save the counting entry (this would need to be implemented in a counting store)
      // await countingStore.saveEntry(entryData);

      emit('entry-saved', entryData as CountingEntry);

      $q.notify({
        type: 'positive',
        message: t('counting.entrySaved'),
        position: 'top',
      });
    } catch (error) {
      console.error('Error saving counting entry:', error);
      $q.notify({
        type: 'negative',
        message: t('counting.saveFailed'),
        position: 'top',
      });
    } finally {
      saving.value = false;
    }
  };

  // Initialize with existing entry data
  if (props.existingEntry) {
    countedQuantity.value = props.existingEntry.counted_quantity;
    notes.value = props.existingEntry.notes || '';

    if (props.existingEntry.batch_id) {
      selectedBatch.value =
        existingBatches.value.find(
          b => b.id === props.existingEntry.batch_id
        ) || null;
    }
  }
</script>

<style scoped>
  .counting-entry-with-batch {
    margin-bottom: 16px;
  }

  .entry-card {
    border-left: 4px solid var(--primary);
  }

  .product-info .text-h6 {
    margin-bottom: 4px;
  }

  .stock-display {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .batch-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }

  .batch-item {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .batch-item:hover {
    background-color: var(--grey-1);
  }

  .selected-batch {
    border-color: var(--primary);
    background-color: var(--primary-1);
  }

  .new-batch-input {
    border: 1px dashed var(--grey-4);
    border-radius: 4px;
    padding: 12px;
    background-color: var(--grey-1);
  }

  .discrepancy-section {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .batch-list {
      max-height: 150px;
    }

    .new-batch-input {
      padding: 8px;
    }
  }
</style>
