<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('suppliersPage.title')"
        :subtitle="$t('suppliersPage.subtitle')"
        icon="corporate_fare"
      >
        <template #actions>
          <q-btn
            flat
            round
            icon="refresh"
            size="md"
            @click="loadSuppliers"
            :loading="loading"
            class="app-btn-refresh"
          >
            <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
          </q-btn>
          <q-btn
            icon="cloud_upload"
            :label="$t('suppliersPage.importSuppliers')"
            @click="importSuppliers"
            unelevated
            no-caps
            class="app-btn-secondary"
          />
          <q-btn
            icon="add"
            :label="$t('suppliersPage.addSupplier')"
            @click="openAddDialog"
            unelevated
            no-caps
            class="app-btn-success"
          />
        </template>
      </PageTitle>
    </template>

    <!-- Modern FilterPanel Component -->
    <div class="filters-section q-mb-lg">
      <FilterPanel
        :preset="suppliersFilterPreset"
        v-model="filterValues"
        @change="handleFilterChange"
        @reset="handleFilterReset"
        @clear="handleFilterClear"
        :loading="loading"
        collapsible
        class="suppliers-filter-panel"
      />
    </div>

    <!-- Suppliers Table -->
    <q-table
      :rows="filteredSuppliers"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="{ rowsPerPage: 10 }"
      flat
      bordered
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.active ? 'positive' : 'negative'"
            :label="
              props.row.active
                ? $t('suppliersPage.active')
                : $t('suppliersPage.inactive')
            "
            text-color="white"
            dense
          />
        </q-td>
      </template>

      <template #body-cell-magento_link="props">
        <q-td :props="props">
          <q-chip
            v-if="props.row.magento_vendor_id"
            color="primary"
            :label="props.row.magento_vendor_id"
            text-color="white"
            dense
          />
          <q-chip
            v-else
            color="grey-5"
            :label="$t('suppliersPage.notLinked')"
            text-color="grey-8"
            dense
          />
        </q-td>
      </template>

      <template #body-cell-integration_status="props">
        <q-td :props="props">
          <div class="column q-gutter-xs">
            <q-chip
              :color="getIntegrationTypeColor(props.row.integration_type)"
              :label="getIntegrationTypeLabel(props.row.integration_type)"
              text-color="white"
              dense
            />
            <q-chip
              v-if="props.row.integration_type !== 'manual'"
              :color="props.row.auto_sync_enabled ? 'positive' : 'grey-5'"
              :label="props.row.auto_sync_enabled ? $t('suppliersPage.autoSyncOn') : $t('suppliersPage.autoSyncOff')"
              :text-color="props.row.auto_sync_enabled ? 'white' : 'grey-8'"
              dense
              size="sm"
            />
          </div>
        </q-td>
      </template>

      <template #body-cell-order_method="props">
        <q-td :props="props">
          <q-chip
            :color="getOrderMethodColor(props.row.order_method)"
            :label="getOrderMethodLabel(props.row.order_method)"
            text-color="white"
            dense
          />
        </q-td>
      </template>

      <template #body-cell-last_sync="props">
        <q-td :props="props">
          <div v-if="props.row.last_sync_at" class="text-caption">
            {{ formatDate(props.row.last_sync_at) }}
          </div>
          <div v-else class="text-grey-6 text-caption">
            {{ $t('suppliersPage.neverSynced') }}
          </div>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              round
              dense
              icon="settings"
              size="sm"
              color="primary"
              @click="configureIntegration(props.row)"
            >
              <q-tooltip>{{ $t('suppliersPage.configureIntegration') }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="canSync(props.row)"
              flat
              round
              dense
              icon="sync"
              size="sm"
              color="positive"
              @click="syncSupplierProducts(props.row)"
              :loading="syncing[props.row.id]"
            >
              <q-tooltip>{{ $t('suppliersPage.syncProducts') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="edit"
              size="sm"
              @click="editSupplier(props.row)"
            >
              <q-tooltip>{{ $t('suppliersPage.editSupplier') }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              size="sm"
              color="negative"
              @click="deleteSupplier(props.row)"
            >
              <q-tooltip>{{ $t('suppliersPage.deleteSupplier') }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Add/Edit Supplier Dialog -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{
              editingSupplier
                ? $t('suppliersPage.editSupplier')
                : $t('suppliersPage.addSupplier')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveSupplier" class="q-gutter-md">
            <q-input
              v-model="supplierForm.name"
              :label="$t('suppliersPage.supplierName')"
              outlined
              :rules="[val => !!val || $t('validation.required')]"
            />

            <q-input
              v-model="supplierForm.contact_email"
              :label="$t('suppliersPage.contactEmail')"
              outlined
              type="email"
            />

            <q-input
              v-model="supplierForm.contact_phone"
              :label="$t('suppliersPage.contactPhone')"
              outlined
            />

            <q-input
              v-model="supplierForm.website"
              :label="$t('suppliersPage.website')"
              outlined
            />

            <q-input
              v-model="supplierForm.address"
              :label="$t('suppliersPage.address')"
              outlined
              type="textarea"
            />

            <div class="row q-gutter-md">
              <q-input
                v-model="supplierForm.city"
                :label="$t('suppliersPage.city')"
                outlined
                style="flex: 1"
              />

              <q-input
                v-model="supplierForm.postal_code"
                :label="$t('suppliersPage.postalCode')"
                outlined
                style="max-width: 150px"
              />
            </div>

            <q-input
              v-model="supplierForm.country"
              :label="$t('suppliersPage.country')"
              outlined
            />

            <q-input
              v-model.number="supplierForm.magento_vendor_id"
              :label="$t('suppliersPage.magentoVendorId')"
              outlined
              type="number"
            />

            <q-input
              v-model="supplierForm.notes"
              :label="$t('suppliersPage.notes')"
              outlined
              type="textarea"
            />

            <q-separator />

            <!-- Integration Configuration Section -->
            <div class="text-h6 q-mt-md">{{ $t('suppliersPage.integrationSettings') }}</div>
            
            <div class="row q-gutter-md">
              <q-select
                v-model="supplierForm.integration_type"
                :options="integrationTypeOptions"
                :label="$t('suppliersPage.integrationType')"
                outlined
                emit-value
                map-options
                style="flex: 1"
              />

              <q-select
                v-model="supplierForm.order_method"
                :options="orderMethodOptions"
                :label="$t('suppliersPage.orderMethod')"
                outlined
                emit-value
                map-options
                style="flex: 1"
              />
            </div>

            <q-toggle
              v-model="supplierForm.auto_sync_enabled"
              :label="$t('suppliersPage.autoSyncEnabled')"
              :disable="supplierForm.integration_type === 'manual'"
              color="positive"
            />

            <!-- Integration Config based on type -->
            <div v-if="supplierForm.integration_type === 'email'" class="q-gutter-md">
              <q-input
                v-model="integrationConfig.order_email"
                :label="$t('suppliersPage.orderEmail')"
                outlined
                type="email"
              />
            </div>

            <div v-if="supplierForm.integration_type === 'api'" class="q-gutter-md">
              <q-input
                v-model="integrationConfig.api_endpoint"
                :label="$t('suppliersPage.apiEndpoint')"
                outlined
              />
              <q-input
                v-model="integrationConfig.api_key"
                :label="$t('suppliersPage.apiKey')"
                outlined
                type="password"
              />
            </div>

            <div v-if="supplierForm.integration_type === 'edi'" class="q-gutter-md">
              <q-input
                v-model="integrationConfig.edi_endpoint"
                :label="$t('suppliersPage.ediEndpoint')"
                outlined
              />
              <q-input
                v-model="integrationConfig.edi_partner_id"
                :label="$t('suppliersPage.ediPartnerId')"
                outlined
              />
            </div>

            <q-toggle
              v-model="supplierForm.active"
              :label="$t('suppliersPage.activeSupplier')"
              color="positive"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" @click="closeDialog" />
          <q-btn
            color="primary"
            :label="$t('common.save')"
            @click="saveSupplier"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Integration Configuration Dialog -->
    <q-dialog v-model="showIntegrationDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">
            {{ $t('suppliersPage.configureIntegration') }} - {{ selectedSupplier?.name }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <q-banner v-if="selectedSupplier?.integration_type === 'manual'" class="bg-grey-2">
              <template #avatar>
                <q-icon name="info" color="grey-7" />
              </template>
              {{ $t('suppliersPage.manualIntegrationInfo') }}
            </q-banner>

            <div v-else>
              <div class="row q-gutter-md q-mb-md">
                <div class="col">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="text-subtitle2">{{ $t('suppliersPage.currentConfig') }}</div>
                      <div class="q-mt-sm">
                        <div><strong>{{ $t('suppliersPage.integrationType') }}:</strong> {{ getIntegrationTypeLabel(selectedSupplier?.integration_type) }}</div>
                        <div><strong>{{ $t('suppliersPage.orderMethod') }}:</strong> {{ getOrderMethodLabel(selectedSupplier?.order_method) }}</div>
                        <div><strong>{{ $t('suppliersPage.autoSync') }}:</strong> 
                          <q-chip 
                            :color="selectedSupplier?.auto_sync_enabled ? 'positive' : 'negative'"
                            :label="selectedSupplier?.auto_sync_enabled ? $t('common.yes') : $t('common.no')"
                            text-color="white"
                            dense
                          />
                        </div>
                        <div v-if="selectedSupplier?.last_sync_at">
                          <strong>{{ $t('suppliersPage.lastSync') }}:</strong> {{ formatDate(selectedSupplier.last_sync_at) }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <div class="row q-gutter-md">
                <q-btn
                  v-if="canSync(selectedSupplier)"
                  color="positive"
                  icon="sync"
                  :label="$t('suppliersPage.syncNow')"
                  @click="syncSupplierProducts(selectedSupplier)"
                  :loading="syncing[selectedSupplier?.id]"
                  unelevated
                />
                <q-btn
                  color="primary"
                  icon="settings"
                  :label="$t('suppliersPage.editSettings')"
                  @click="editSupplierIntegration"
                  unelevated
                />
                <q-btn
                  color="secondary"
                  icon="send"
                  :label="$t('suppliersPage.testConnection')"
                  @click="testConnection"
                  unelevated
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.close')" @click="closeIntegrationDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import PageTitle from 'src/components/PageTitle.vue';
import PageLayout from 'src/components/PageLayout.vue';
import FilterPanel from 'src/components/filters/FilterPanel.vue';
import { suppliersFilterPreset } from '@/presets/filters/suppliers';
import { supabase } from 'src/services/supabase';
import { monitoringService } from 'src/services/monitoring';
import type { FilterValues, FilterChangeEvent, FilterResetEvent } from '@/types/filters';

const $q = useQuasar();
const { t } = useI18n();

// Refs
const loading = ref(false);
const saving = ref(false);
const showDialog = ref(false);
const showIntegrationDialog = ref(false);
const editingSupplier = ref<any>(null);
const selectedSupplier = ref<any>(null);
const syncing = ref<Record<string, boolean>>({});

// New filter state for FilterPanel
const filterValues = ref<FilterValues>({});

// Form data
const supplierForm = ref({
  name: '',
  code: '',
  contact_email: '',
  contact_phone: '',
  contact_person: '',
  website: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'Netherlands',
  magento_vendor_id: null as number | null,
  notes: '',
  active: true,
  integration_type: 'manual',
  order_method: 'manual',
  auto_sync_enabled: false,
  integration_config: {},
});

// Integration config separate object
const integrationConfig = ref<any>({});

// Data
const suppliers = ref<any[]>([]);

// Integration type options
const integrationTypeOptions = computed(() => [
  { label: t('suppliersPage.integrationTypes.manual'), value: 'manual' },
  { label: t('suppliersPage.integrationTypes.email'), value: 'email' },
  { label: t('suppliersPage.integrationTypes.api'), value: 'api' },
  { label: t('suppliersPage.integrationTypes.edi'), value: 'edi' },
  { label: t('suppliersPage.integrationTypes.magento'), value: 'magento' },
]);

// Order method options
const orderMethodOptions = computed(() => [
  { label: t('suppliersPage.orderMethods.manual'), value: 'manual' },
  { label: t('suppliersPage.orderMethods.email'), value: 'email' },
  { label: t('suppliersPage.orderMethods.api'), value: 'api' },
  { label: t('suppliersPage.orderMethods.pdf'), value: 'pdf' },
]);

// Helper functions for UI
const getIntegrationTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    manual: 'grey-6',
    email: 'blue',
    api: 'green',
    edi: 'purple',
    magento: 'orange'
  };
  return colors[type] || 'grey-6';
};

const getIntegrationTypeLabel = (type: string) => {
  const option = integrationTypeOptions.value.find(opt => opt.value === type);
  return option?.label || type;
};

const getOrderMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    manual: 'grey-6',
    email: 'blue',
    api: 'green',
    pdf: 'orange'
  };
  return colors[method] || 'grey-6';
};

const getOrderMethodLabel = (method: string) => {
  const option = orderMethodOptions.value.find(opt => opt.value === method);
  return option?.label || method;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const canSync = (supplier: Supplier) => {
  return supplier.integration_type !== 'manual' && supplier.auto_sync_enabled;
};

// Filter event handlers
const handleFilterChange = (event: FilterChangeEvent) => {
  // Filter logic is handled by computed property
};

const handleFilterReset = (event: FilterResetEvent) => {
  filterValues.value = {};
  if (suppliersFilterPreset.defaultFilters) {
    Object.assign(filterValues.value, suppliersFilterPreset.defaultFilters);
  }
};

const handleFilterClear = () => {
  filterValues.value = {};
};

// Computed
const filteredSuppliers = computed(() => {
  let filtered = suppliers.value;

  // Apply search filter
  const searchTerm = filterValues.value.search;
  if (searchTerm) {
    const search = String(searchTerm).toLowerCase();
    filtered = filtered.filter(
      supplier =>
        supplier.name?.toLowerCase().includes(search) ||
        supplier.contact_email?.toLowerCase().includes(search) ||
        supplier.contact_phone?.toLowerCase().includes(search)
    );
  }

  // Apply status filter
  const statusFilter = filterValues.value.status;
  if (statusFilter !== undefined && statusFilter !== null && statusFilter !== '') {
    const isActive = Boolean(statusFilter);
    filtered = filtered.filter(supplier => supplier.active === isActive);
  }

  // Apply integration type filter
  const integrationType = filterValues.value.integration_type;
  if (integrationType) {
    filtered = filtered.filter(supplier => {
      if (integrationType === 'manual') {
        return !supplier.magento_vendor_id;
      } else if (integrationType === 'magento') {
        return supplier.magento_vendor_id;
      } else if (integrationType === 'api') {
        // Add logic for API integration when available
        return false;
      }
      return true;
    });
  }

  // Apply country filter
  const country = filterValues.value.country;
  if (country) {
    filtered = filtered.filter(supplier => supplier.country === country);
  }

  // Apply city filter
  const city = filterValues.value.city;
  if (city) {
    filtered = filtered.filter(supplier => supplier.city === city);
  }

  return filtered;
});

// Table columns
const columns = computed(() => [
  {
    name: 'name',
    label: t('suppliersPage.name'),
    field: 'name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'integration_status',
    label: t('suppliersPage.integrationStatus'),
    field: 'integration_type',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'order_method',
    label: t('suppliersPage.orderMethod'),
    field: 'order_method',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'contact_email',
    label: t('suppliersPage.email'),
    field: 'contact_email',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'contact_phone',
    label: t('suppliersPage.phone'),
    field: 'contact_phone',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'city',
    label: t('suppliersPage.city'),
    field: 'city',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'last_sync',
    label: t('suppliersPage.lastSync'),
    field: 'last_sync_at',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: t('suppliersPage.status'),
    field: 'active',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: t('suppliersPage.actions'),
    field: '',
    align: 'center' as const,
    sortable: false,
  },
]);

// Methods
const loadSuppliers = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) throw error;

    suppliers.value = data || [];
  } catch (error: unknown) {
    console.error('Failed to load suppliers:', error);
    $q.notify({
      type: 'negative',
      message: t('suppliersPage.loadError'),
    });
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  editingSupplier.value = null;
  supplierForm.value = {
    name: '',
    code: '',
    contact_email: '',
    contact_phone: '',
    contact_person: '',
    website: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Netherlands',
    magento_vendor_id: null,
    notes: '',
    active: true,
    integration_type: 'manual',
    order_method: 'manual',
    auto_sync_enabled: false,
    integration_config: {},
  };
  integrationConfig.value = {};
  showDialog.value = true;
};

const editSupplier = (supplier: Supplier) => {
  editingSupplier.value = supplier;
  supplierForm.value = { ...supplier };
  integrationConfig.value = supplier.integration_config || {};
  showDialog.value = true;
};

const saveSupplier = async () => {
  try {
    saving.value = true;

    // Merge integration config into the supplier form
    const supplierData = {
      ...supplierForm.value,
      integration_config: integrationConfig.value,
    };

    if (editingSupplier.value) {
      // Update existing supplier
      const { error } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', editingSupplier.value.id);

      if (error) throw error;

      $q.notify({
        type: 'positive',
        message: t('suppliersPage.supplierUpdated'),
      });
    } else {
      // Create new supplier
      const { error } = await supabase
        .from('suppliers')
        .insert([supplierData]);

      if (error) throw error;

      $q.notify({
        type: 'positive',
        message: t('suppliersPage.supplierCreated'),
      });
    }

    showDialog.value = false;
    await loadSuppliers();
  } catch (error: unknown) {
    console.error('Failed to save supplier:', error);
    $q.notify({
      type: 'negative',
      message: t('suppliersPage.saveError'),
    });
  } finally {
    saving.value = false;
  }
};

const deleteSupplier = async (supplier: Supplier) => {
  try {
    const confirmed = await new Promise((resolve) => {
      $q.dialog({
        title: t('suppliersPage.confirmDelete'),
        message: t('suppliersPage.confirmDeleteMessage', { name: supplier.name }),
        cancel: true,
        persistent: true,
      }).onOk(() => resolve(true))
        .onCancel(() => resolve(false));
    });

    if (!confirmed) { return; }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplier.id);

    if (error) throw error;

    $q.notify({
      type: 'positive',
      message: t('suppliersPage.supplierDeleted'),
    });

    await loadSuppliers();
  } catch (error: unknown) {
    console.error('Failed to delete supplier:', error);
    $q.notify({
      type: 'negative',
      message: t('suppliersPage.deleteError'),
    });
  }
};

const closeDialog = () => {
  showDialog.value = false;
  editingSupplier.value = null;
};

const importSuppliers = () => {
  $q.notify({
    type: 'info',
    message: t('common.comingSoon'),
  });
};

const configureIntegration = (supplier: Supplier) => {
  selectedSupplier.value = supplier;
  showIntegrationDialog.value = true;
};

const closeIntegrationDialog = () => {
  showIntegrationDialog.value = false;
  selectedSupplier.value = null;
};

const editSupplierIntegration = () => {
  editingSupplier.value = selectedSupplier.value;
  supplierForm.value = { ...selectedSupplier.value };
  showDialog.value = true;
  closeIntegrationDialog();
};

const testConnection = async () => {
  $q.notify({
    type: 'info',
    message: t('suppliersPage.testingConnection'),
  });
  try {
    // Simulate connection test - in real implementation, this would call the actual integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    $q.notify({
      type: 'positive',
      message: t('suppliersPage.connectionSuccessful'),
    });
  } catch (error: unknown) {
    $q.notify({
      type: 'negative',
      message: t('suppliersPage.connectionFailed', { error: error.message }),
    });
  }
};

const syncSupplierProducts = async (supplier: Supplier) => {
  if (!canSync(supplier)) {
    $q.notify({
      type: 'warning',
      message: t('suppliersPage.syncDisabledWarning'),
    });
    return;
  }

  syncing.value[supplier.id] = true;
  try {
    // Call the sync function we created in the database
    const { data, error } = await supabase.rpc('sync_supplier_products', {
      supplier_uuid: supplier.id
    });

    if (error) throw error;

    if (data?.success) {
      $q.notify({
        type: 'positive',
        message: t('suppliersPage.syncSuccess', { 
          name: supplier.name,
          count: data.products_synced
        }),
      });
      // Reload suppliers to get updated sync time
      await loadSuppliers();
    } else {
      throw new Error(data?.error || 'Sync failed');
    }
  } catch (error: unknown) {
    $q.notify({
      type: 'negative',
      message: t('suppliersPage.syncFailed', { name: supplier.name, error: error.message }),
    });
  } finally {
    syncing.value[supplier.id] = false;
  }
};

// Lifecycle
onMounted(async () => {
  await loadSuppliers();
  
  // Initialize filter values with defaults
  if (suppliersFilterPreset.defaultFilters) {
    Object.assign(filterValues.value, suppliersFilterPreset.defaultFilters);
  }
});
</script>

<style lang="scss" scoped>
.filters-section {
  .suppliers-filter-panel {
    // Custom styling for the FilterPanel in suppliers page
  }
}

.btn-modern {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
}
</style>
