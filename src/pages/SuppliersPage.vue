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
            icon="cloud_upload"
            :label="$t('suppliersPage.importSuppliers')"
            @click="importSuppliers"
            unelevated
            no-caps
            class="btn-modern"
          />
          <q-btn
            color="primary"
            icon="add"
            :label="$t('suppliersPage.addSupplier')"
            @click="openAddDialog"
            unelevated
            no-caps
            class="btn-modern"
          />
        </template>
      </PageTitle>
    </template>

    <!-- Search and Filters -->
    <div class="row q-gutter-md q-mb-lg">
      <q-input
        v-model="searchTerm"
        :placeholder="$t('suppliersPage.searchSuppliers')"
        outlined
        dense
        style="min-width: 300px"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="statusFilter"
        :options="statusOptions"
        :label="$t('suppliersPage.filterByStatus')"
        outlined
        dense
        style="min-width: 200px"
        clearable
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

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            icon="edit"
            dense
            color="primary"
            flat
            round
            :aria-label="$t('suppliersPage.editSupplierTooltip')"
            @click="editSupplier(props.row)"
          />
          <q-btn
            v-if="!props.row.magento_vendor_id"
            icon="link"
            dense
            color="orange"
            flat
            round
            :aria-label="$t('suppliersPage.linkToMagentoTooltip')"
            @click="linkToMagento(props.row)"
          />
          <q-btn
            icon="delete"
            dense
            color="negative"
            flat
            round
            :aria-label="$t('suppliersPage.deleteSupplierTooltip')"
            @click="deleteSupplier(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Add/Edit Supplier Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{
              editingSupplier
                ? $t('suppliersPage.editSupplier')
                : $t('suppliersPage.addNewSupplier')
            }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-12">
              <q-input
                v-model="supplierForm.name"
                :label="$t('suppliersPage.supplierName')"
                outlined
                dense
                :rules="[val => !!val || $t('suppliersPage.nameRequired')]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="supplierForm.contact_email"
                :label="$t('suppliersPage.contactEmail')"
                outlined
                dense
                type="email"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="supplierForm.contact_phone"
                :label="$t('suppliersPage.contactPhone')"
                outlined
                dense
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="supplierForm.website"
                :label="$t('suppliersPage.website')"
                outlined
                dense
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="supplierForm.address"
                :label="$t('suppliersPage.address')"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="supplierForm.city"
                :label="$t('suppliersPage.city')"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="supplierForm.postal_code"
                :label="$t('suppliersPage.postalCode')"
                outlined
                dense
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="supplierForm.country"
                :label="$t('suppliersPage.country')"
                outlined
                dense
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="supplierForm.magento_vendor_id"
                :label="$t('suppliersPage.magentoVendorId')"
                outlined
                dense
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="supplierForm.notes"
                :label="$t('suppliersPage.notes')"
                outlined
                dense
                type="textarea"
                rows="3"
              />
            </div>

            <div class="col-12">
              <q-toggle
                v-model="supplierForm.active"
                :label="$t('suppliersPage.activeSupplier')"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            :label="$t('suppliersPage.cancel')"
            color="grey"
            flat
            @click="closeDialog"
          />
          <q-btn
            :label="$t('suppliersPage.save')"
            color="primary"
            @click="saveSupplier"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Loading State -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import PageTitle from 'src/components/PageTitle.vue';
  import PageLayout from 'src/components/PageLayout.vue';
  import { supabase } from 'src/services/supabase';
  import { monitoringService } from 'src/services/monitoring';

  const $q = useQuasar();
  const { t } = useI18n();

  // Refs
  const loading = ref(false);
  const saving = ref(false);
  const showDialog = ref(false);
  const editingSupplier = ref<any>(null);
  const searchTerm = ref('');
  const statusFilter = ref<string | null>(null);

  // Form data
  const supplierForm = ref({
    name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    magento_vendor_id: null as number | null,
    notes: '',
    active: true,
  });

  // Data
  const suppliers = ref<any[]>([]);

  // Options
  const statusOptions = [
    { label: t('suppliersPage.active'), value: 'active' },
    { label: t('suppliersPage.inactive'), value: 'inactive' },
  ];

  // Computed
  const filteredSuppliers = computed(() => {
    let filtered = suppliers.value;

    // Filter by search term
    if (searchTerm.value) {
      const search = searchTerm.value.toLowerCase();
      filtered = filtered.filter(
        supplier =>
          supplier.name?.toLowerCase().includes(search) ||
          supplier.contact_email?.toLowerCase().includes(search) ||
          supplier.contact_phone?.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (statusFilter.value) {
      const isActive = statusFilter.value === 'active';
      filtered = filtered.filter(supplier => supplier.active === isActive);
    }

    return filtered;
  });

  // Table columns
  const columns = [
    {
      name: 'name',
      label: t('suppliersPage.supplierName'),
      align: 'left' as const,
      field: 'name',
      sortable: true,
    },
    {
      name: 'contact_info',
      label: t('suppliersPage.contactInformation'),
      align: 'left' as const,
      field: (row: any) =>
        `${row.contact_email || ''} ${row.contact_phone || ''}`.trim() || '-',
      sortable: false,
    },
    {
      name: 'location',
      label: t('suppliersPage.location'),
      align: 'left' as const,
      field: (row: any) =>
        `${row.city || ''} ${row.country || ''}`.trim() || '-',
      sortable: false,
    },
    {
      name: 'magento_link',
      label: t('suppliersPage.magentoLink'),
      align: 'center' as const,
      field: 'magento_vendor_id',
      sortable: false,
    },
    {
      name: 'status',
      label: t('suppliersPage.status'),
      align: 'center' as const,
      field: 'active',
      sortable: true,
    },
    {
      name: 'actions',
      label: t('suppliersPage.actions'),
      align: 'center' as const,
      field: '',
      sortable: false,
    },
  ];

  // Methods
  const loadSuppliers = async () => {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;

      suppliers.value = data || [];

      await monitoringService.trackEvent('suppliers_viewed', {
        count: suppliers.value.length,
      });
    } catch (error) {
      console.error('Error loading suppliers:', error);
      $q.notify({
        type: 'negative',
        message: t('suppliersPage.loadSuppliersError'),
      });
    } finally {
      loading.value = false;
    }
  };

  const openAddDialog = () => {
    editingSupplier.value = null;
    supplierForm.value = {
      name: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      address: '',
      city: '',
      postal_code: '',
      country: '',
      magento_vendor_id: null,
      notes: '',
      active: true,
    };
    showDialog.value = true;
  };

  const editSupplier = (supplier: any) => {
    editingSupplier.value = supplier;
    supplierForm.value = { ...supplier };
    showDialog.value = true;
  };

  const closeDialog = () => {
    showDialog.value = false;
    editingSupplier.value = null;
  };

  const saveSupplier = async () => {
    if (!supplierForm.value.name?.trim()) {
      $q.notify({
        type: 'negative',
        message: t('suppliersPage.nameRequired'),
      });
      return;
    }

    saving.value = true;
    try {
      const supplierData = { ...supplierForm.value };

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

        await monitoringService.trackEvent('supplier_updated', {
          supplier_id: editingSupplier.value.id,
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

        await monitoringService.trackEvent('supplier_created', {
          name: supplierData.name,
        });
      }

      closeDialog();
      await loadSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      $q.notify({
        type: 'negative',
        message: t('suppliersPage.saveSupplierError'),
      });
    } finally {
      saving.value = false;
    }
  };

  const deleteSupplier = (supplier: any) => {
    $q.dialog({
      title: t('suppliersPage.confirmDelete'),
      message: t('suppliersPage.confirmDeleteMessage', { name: supplier.name }),
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        const { error } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', supplier.id);

        if (error) throw error;

        $q.notify({
          type: 'positive',
          message: t('suppliersPage.supplierDeleted'),
        });

        await monitoringService.trackEvent('supplier_deleted', {
          supplier_id: supplier.id,
          name: supplier.name,
        });

        await loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        $q.notify({
          type: 'negative',
          message: t('suppliersPage.deleteSupplierError'),
        });
      }
    });
  };

  const linkToMagento = (supplier: any) => {
    $q.dialog({
      title: t('suppliersPage.linkToMagento'),
      message: t('suppliersPage.linkToMagentoPrompt'),
      prompt: {
        model: '',
        type: 'text',
      },
      cancel: true,
      persistent: true,
    }).onOk(async (vendorId: string) => {
      if (!vendorId?.trim()) return;

      try {
        const { error } = await supabase
          .from('suppliers')
          .update({ magento_vendor_id: parseInt(vendorId.trim()) })
          .eq('id', supplier.id);

        if (error) throw error;

        $q.notify({
          type: 'positive',
          message: t('suppliersPage.supplierLinkedToMagento'),
        });

        await monitoringService.trackEvent('supplier_linked_magento', {
          supplier_id: supplier.id,
          vendor_id: vendorId.trim(),
        });

        await loadSuppliers();
      } catch (error) {
        console.error('Error linking supplier to Magento:', error);
        $q.notify({
          type: 'negative',
          message: t('suppliersPage.linkMagentoError'),
        });
      }
    });
  };

  const importSuppliers = () => {
    $q.notify({
      type: 'info',
      message: t('suppliersPage.importFeatureComingSoon'),
    });
  };

  // Lifecycle
  onMounted(() => {
    loadSuppliers();
  });
</script>

<style scoped>
  .q-table {
    background: white;
  }

  .import-suppliers-btn {
    background: linear-gradient(135deg, #0f766e, #0d9488);
    color: white;
    border-radius: 12px;
    padding: 8px 20px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .import-suppliers-btn:hover {
    background: linear-gradient(135deg, #134e4a, #0f766e);
    box-shadow: 0 6px 20px rgba(15, 118, 110, 0.4);
    transform: translateY(-2px);
  }

  .import-suppliers-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(15, 118, 110, 0.3);
  }

  .import-suppliers-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  .import-suppliers-btn:hover::before {
    left: 100%;
  }

  .import-suppliers-btn .q-icon {
    margin-right: 8px;
    font-size: 18px;
  }
</style>
