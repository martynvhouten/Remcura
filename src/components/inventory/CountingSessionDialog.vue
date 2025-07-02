<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="$t('inventory.startCountingSession')"
    icon="checklist"
    max-width="600px"
    @hide="onHide"
  >
    <q-form @submit="onSubmit" class="counting-session-form">
      <!-- Session Name -->
      <q-input
        v-model="form.name"
        :label="$t('inventory.sessionName')"
        :placeholder="$t('inventory.sessionNamePlaceholder')"
        outlined
        required
        :rules="[val => !!val || $t('validation.required')]"
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="edit" />
        </template>
      </q-input>

      <!-- Session Type -->
      <q-select
        v-model="form.sessionType"
        :options="sessionTypeOptions"
        :label="$t('inventory.sessionType')"
        emit-value
        map-options
        outlined
        required
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="category" />
        </template>
      </q-select>

      <!-- Locations -->
      <q-select
        v-model="form.locationIds"
        :options="locationOptions"
        :label="$t('inventory.selectLocations')"
        emit-value
        map-options
        multiple
        outlined
        required
        :rules="[val => val && val.length > 0 || $t('validation.required')]"
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="place" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-icon :name="scope.opt.icon || 'place'" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Options -->
      <div class="options-section">
        <q-checkbox
          v-model="form.allowNegativeCounts"
          :label="$t('inventory.allowNegativeCounts')"
          class="option-checkbox"
        />
        <q-checkbox
          v-model="form.requireApproval"
          :label="$t('inventory.requireApproval')"
          class="option-checkbox"
        />
        <q-checkbox
          v-model="form.autoAdjustStock"
          :label="$t('inventory.autoAdjustStock')"
          class="option-checkbox"
        />
      </div>

      <!-- Notes -->
      <q-input
        v-model="form.notes"
        :label="$t('common.notes')"
        :placeholder="$t('inventory.sessionNotesPlaceholder')"
        type="textarea"
        rows="3"
        outlined
        class="form-field"
      >
        <template v-slot:prepend>
          <q-icon name="notes" />
        </template>
      </q-input>
    </q-form>

    <template #actions>
      <q-btn
        flat
        :label="$t('common.cancel')"
        @click="onCancel"
      />
      <q-btn
        color="primary"
        :label="$t('inventory.startCounting')"
        @click="onSubmit"
        :loading="loading"
        unelevated
      />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useCountingStore } from 'src/stores/counting'
import { useAuthStore } from 'src/stores/auth'
import type { PracticeLocation, StartCountingSessionRequest } from 'src/types/inventory'
import BaseDialog from 'src/components/base/BaseDialog.vue'

interface Props {
  modelValue: boolean
  locations: PracticeLocation[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'session-created', sessionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()
const $q = useQuasar()
const countingStore = useCountingStore()
const authStore = useAuthStore()

// State
const loading = ref(false)
const form = ref({
  name: '',
  sessionType: 'partial' as const,
  locationIds: [] as string[],
  allowNegativeCounts: false,
  requireApproval: true,
  autoAdjustStock: false,
  notes: ''
})

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const practiceId = computed(() => authStore.userProfile?.clinic_id || '')

const sessionTypeOptions = computed(() => [
  {
    label: t('inventory.partialCount'),
    value: 'partial',
    description: t('inventory.partialCountDescription')
  },
  {
    label: t('inventory.fullCount'),
    value: 'full',
    description: t('inventory.fullCountDescription')
  },
  {
    label: t('inventory.spotCheck'),
    value: 'spot_check',
    description: t('inventory.spotCheckDescription')
  },
  {
    label: t('inventory.cycleCount'),
    value: 'cycle',
    description: t('inventory.cycleCountDescription')
  }
])

const locationOptions = computed(() => 
  props.locations.map(location => ({
    label: location.name,
    value: location.id,
    description: location.description || `${location.location_type} - ${location.code}`,
    icon: getLocationIcon(location.location_type)
  }))
)

// Methods
const getLocationIcon = (type: string): string => {
  switch (type) {
    case 'storage': return 'inventory_2'
    case 'treatment': return 'medical_services'
    case 'emergency': return 'emergency'
    case 'mobile': return 'directions_car'
    default: return 'place'
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    sessionType: 'partial',
    locationIds: [],
    allowNegativeCounts: false,
    requireApproval: true,
    autoAdjustStock: false,
    notes: ''
  }
}

const onSubmit = async () => {
  if (!practiceId.value) return

  loading.value = true
  try {
    const request: StartCountingSessionRequest = {
      practice_id: practiceId.value,
      name: form.value.name,
      session_type: form.value.sessionType,
      location_ids: form.value.locationIds,
      allow_negative_counts: form.value.allowNegativeCounts,
      require_approval: form.value.requireApproval,
      auto_adjust_stock: form.value.autoAdjustStock,
      notes: form.value.notes || ''
    }

    // In a real implementation, this would create the session via the counting store
    // const sessionId = await countingStore.createSession(request)
    
    // For now, simulate creating a session
    const sessionId = `session_${Date.now()}`
    
    $q.notify({
      type: 'positive',
      message: t('inventory.sessionCreated'),
      position: 'top'
    })

    emit('session-created', sessionId)
    dialogVisible.value = false
  } catch (error) {
    console.error('Error creating counting session:', error)
    $q.notify({
      type: 'negative',
      message: t('inventory.sessionCreationFailed'),
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  dialogVisible.value = false
}

const onHide = () => {
  resetForm()
}

// Generate default session name
watch(() => props.modelValue, (isVisible) => {
  if (isVisible && !form.value.name) {
    const now = new Date()
    const dateStr = now.toLocaleDateString('nl-NL')
    const timeStr = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    form.value.name = t('inventory.defaultSessionName', { date: dateStr, time: timeStr })
  }
})
</script>

<style lang="scss" scoped>
.counting-session-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
}

.form-field {
  width: 100%;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
  
  .option-checkbox {
    font-size: var(--text-sm);
  }
}

// Dark mode
body.body--dark {
  .options-section {
    background: var(--neutral-200);
    border-color: var(--neutral-300);
  }
}
</style> 