<template>
  <PageLayout>
    <PageTitle
      :title="$t('orderLists.title')"
      :subtitle="$t('orderLists.subtitle')"
    >
      <template #actions>
        <q-btn
          :label="$t('orderLists.create')"
          color="primary"
          icon="add"
          @click="showCreateDialog = true"
          :loading="orderListsStore.saving"
        />
      </template>
    </PageTitle>

    <!-- Modern FilterPanel Component -->
    <div class="filters-section q-mb-lg">
      <FilterPanel
        :preset="orderListsFilterPreset"
        v-model="filterValues"
        @change="handleFilterChange"
        @reset="handleFilterReset"
        @clear="handleFilterClear"
        :loading="orderListsStore.loading"
        collapsible
        class="order-lists-filter-panel"
      />
    </div>

    <!-- Order Lists Grid -->
    <div v-if="filteredOrderLists.length > 0" class="row q-gutter-md">
      <div
        v-for="orderList in filteredOrderLists"
        :key="orderList.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <BaseCard class="full-height">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="col">
                <div class="text-h6">{{ orderList.name }}</div>
                <div
                  v-if="orderList.description"
                  class="text-body2 text-grey-6"
                >
                  {{ orderList.description }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip
                  :color="getStatusColor(orderList.status)"
                  text-color="white"
                  size="sm"
                >
                  {{ $t(`orderLists.${orderList.status}`) }}
                </q-chip>
              </div>
            </div>

            <div class="row q-gutter-sm q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey-6">
                  {{ $t('orderLists.supplier') }}
                </div>
                <div class="text-body2">
                  {{ orderList.supplier?.name || t('common.unknownSupplier') }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">
                  {{ $t('orderLists.totalItems') }}
                </div>
                <div class="text-body2">{{ orderList.total_items }}</div>
              </div>
            </div>

            <div class="row q-gutter-sm q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey-6">
                  {{ $t('orderLists.totalAmount') }}
                </div>
                <div class="text-body2">
                  €{{ orderList.total_amount.toFixed(2) }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">
                  {{ $t('orderLists.updatedAt') }}
                </div>
                <div class="text-body2">
                  {{ formatDate(orderList.updated_at) }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn
              :label="$t('orderLists.edit')"
              color="primary"
              outline
              size="sm"
              @click="editOrderList(orderList)"
              class="q-mr-sm"
            />

            <q-btn
              v-if="orderList.status === 'ready'"
              :label="$t('orderLists.submit')"
              color="positive"
              unelevated
              size="sm"
              @click="submitOrderList(orderList)"
              class="q-mr-sm"
              :loading="submittingOrderLists.has(orderList.id)"
            />

            <q-btn
              v-if="orderList.status === 'ready' && orderList.supplier_id"
              :label="$t('orderLists.sendToSupplier')"
              color="primary"
              unelevated
              size="sm"
              @click="sendToSupplier(orderList)"
              class="q-mr-sm"
              :loading="sendingToSupplier[orderList.id]"
            />

            <q-btn
              :label="$t('orderLists.addToCart')"
              color="secondary"
              outline
              size="sm"
              @click="addListToCart(orderList)"
              :disable="orderList.total_items === 0"
            />

            <q-space />

            <q-btn-dropdown
              color="grey-7"
              outline
              size="sm"
              icon="more_vert"
              dropdown-icon="none"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  @click="duplicateOrderList(orderList)"
                >
                  <q-item-section avatar>
                    <q-icon name="content_copy" />
                  </q-item-section>
                  <q-item-section>{{
                    $t('orderLists.duplicate')
                  }}</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="autoFillOrderList(orderList)"
                  :disable="orderList.status !== 'draft'"
                >
                  <q-item-section avatar>
                    <q-icon name="auto_fix_high" />
                  </q-item-section>
                  <q-item-section>{{
                    $t('orderLists.autoFill')
                  }}</q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  v-close-popup
                  @click="deleteOrderList(orderList)"
                  class="text-negative"
                  :disable="orderList.status === 'submitted' || orderList.status === 'confirmed'"
                >
                  <q-item-section avatar>
                    <q-icon name="delete" />
                  </q-item-section>
                  <q-item-section>{{ $t('orderLists.delete') }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-card-actions>
        </BaseCard>
      </div>
    </div>

    <!-- Empty State -->
    <BaseCard v-else-if="!orderListsStore.loading" class="text-center q-pa-xl">
      <q-icon name="list_alt" size="4rem" color="grey-4" class="q-mb-md" />
      <div class="text-h6 q-mb-sm">{{ $t('orderLists.noLists') }}</div>
      <div class="text-body1 text-grey-6 q-mb-lg">
        {{ $t('orderLists.createNew') }}
      </div>
      <q-btn
        :label="$t('orderLists.create')"
        color="primary"
        @click="showCreateDialog = true"
      />
    </BaseCard>

    <!-- Loading State -->
    <div v-if="orderListsStore.loading" class="row q-gutter-md">
      <div v-for="i in 6" :key="i" class="col-12 col-md-6 col-lg-4">
        <q-skeleton height="200px" />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <OrderListDialog
      v-model="showCreateDialog"
      :order-list="selectedOrderList"
      @saved="onOrderListSaved"
    />

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('orderLists.deleteDialog') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ $t('orderLists.deleteConfirm') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('common.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            :label="$t('orderLists.delete')"
            color="negative"
            @click="confirmDelete"
            :loading="orderListsStore.saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { useOrderListsStore, type OrderListWithItems } from 'src/stores/orderLists';
  import { useSuppliersStore } from 'src/stores/suppliers';
  import { useProductsStore } from 'src/stores/products';
  import { useAuthStore } from 'src/stores/auth';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import { BaseCard } from 'src/components/cards';
  import FilterPanel from 'src/components/filters/FilterPanel.vue';
  import OrderListDialog from 'src/components/products/OrderListDialog.vue';
  import type { FilterValues, FilterChangeEvent, FilterResetEvent } from 'src/types/filters';
  import { orderListsFilterPreset } from 'src/presets/filters/orderLists';
  import { supabase } from 'src/services/supabase';

  const $q = useQuasar();
  const { t } = useI18n();

  // Stores
  const orderListsStore = useOrderListsStore();
  const suppliersStore = useSuppliersStore();
  const productsStore = useProductsStore();
  const authStore = useAuthStore();

  // State
  const showCreateDialog = ref(false);
  const showDeleteDialog = ref(false);
  const selectedOrderList = ref<OrderListWithItems | null>(null);
  const orderListToDelete = ref<OrderListWithItems | null>(null);
  const submittingOrderLists = ref<Set<string>>(new Set());
  const sendingToSupplier = ref<Record<string, boolean>>({});

  // Modern Filter System
  const filterValues = ref<FilterValues>({});

  // Legacy filters computed from FilterPanel values
  const filters = computed(() => ({
    search: String(filterValues.value.search || ''),
    supplier: String(filterValues.value.supplier || ''),
    status: String(filterValues.value.status || ''),
  }));

  // Computed

  const filteredOrderLists = computed(() => {
    let result = [...orderListsStore.orderLists];

    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      result = result.filter(
        list =>
          list.name.toLowerCase().includes(searchTerm) ||
          (list.description &&
            list.description.toLowerCase().includes(searchTerm)) ||
          (list.supplier?.name &&
            list.supplier.name.toLowerCase().includes(searchTerm))
      );
    }

    // Apply supplier filter
    if (filters.value.supplier) {
      result = result.filter(
        list => list.supplier_id === filters.value.supplier
      );
    }

    // Apply status filter
    if (filters.value.status) {
      result = result.filter(list => list.status === filters.value.status);
    }

    // Apply date range filter
    if (filterValues.value.dateRange) {
      const dateRange = filterValues.value.dateRange as { start?: string; end?: string };
      if (dateRange.start) {
        result = result.filter(list => new Date(list.updated_at) >= new Date(dateRange.start!));
      }
      if (dateRange.end) {
        result = result.filter(list => new Date(list.updated_at) <= new Date(dateRange.end!));
      }
    }

    // Apply amount range filter
    if (filterValues.value.amountRange) {
      const amountRange = filterValues.value.amountRange as { min?: number; max?: number };
      if (amountRange.min !== undefined) {
        result = result.filter(list => list.total_amount >= amountRange.min!);
      }
      if (amountRange.max !== undefined) {
        result = result.filter(list => list.total_amount <= amountRange.max!);
      }
    }

    // Apply has items filter
    if (filterValues.value.hasItems) {
      result = result.filter(list => list.total_items > 0);
    }

    return result;
  });

  // Filter Event Handlers
  const handleFilterChange = (event: FilterChangeEvent) => {
    // Handle individual filter changes - filters applied automatically via computed properties
  };

  const handleFilterReset = (event: FilterResetEvent) => {
    filterValues.value = { ...orderListsFilterPreset.defaultFilters } as FilterValues;
  };

  const handleFilterClear = () => {
    filterValues.value = {};
  };

  // Legacy clear filters method for compatibility
  const clearFilters = () => {
    handleFilterClear();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'grey',
      ready: 'blue',
      submitted: 'orange',
      confirmed: 'green',
      delivered: 'positive',
      cancelled: 'negative',
    };
    return colors[status] || 'grey';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const editOrderList = (orderList: OrderListWithItems) => {
    selectedOrderList.value = orderList;
    showCreateDialog.value = true;
  };

  const duplicateOrderList = async (orderList: OrderListWithItems) => {
    try {
      const newName = t('orderLists.duplicateName', { name: orderList.name });
      await orderListsStore.duplicateOrderList(orderList.id, newName);
      $q.notify({
        type: 'positive',
        message: t('orderLists.duplicated'),
      });
    } catch (error) {
      console.error(t('orderLists.saveError'), error);
      $q.notify({
        type: 'negative',
        message: t('orderLists.saveError'),
      });
    }
  };

  const deleteOrderList = (orderList: OrderListWithItems) => {
    orderListToDelete.value = orderList;
    showDeleteDialog.value = true;
  };

  const confirmDelete = async () => {
    if (!orderListToDelete.value) { return; }

    try {
      await orderListsStore.deleteOrderList(orderListToDelete.value.id);
      showDeleteDialog.value = false;
      orderListToDelete.value = null;
      $q.notify({
        type: 'positive',
        message: t('orderLists.deleted'),
      });
    } catch (error) {
      console.error(t('orderLists.deleteError'), error);
      $q.notify({
        type: 'negative',
        message: t('orderLists.deleteError'),
      });
    }
  };

  const addListToCart = async (orderList: OrderListWithItems) => {
    try {
      await orderListsStore.addToCart(orderList.id);
      $q.notify({
        type: 'positive',
        message: t('orderLists.addedToCart'),
      });
    } catch (error) {
      console.error(t('orderLists.cartError'), error);
      $q.notify({
        type: 'negative',
        message: t('orderLists.cartError'),
      });
    }
  };

  const autoFillOrderList = async (orderList: OrderListWithItems) => {
    try {
      await orderListsStore.autoFillFromStockLevels(orderList.id);
      $q.notify({
        type: 'positive',
        message: t('orderLists.autoFilled'),
      });
    } catch (error) {
      console.error(t('orderLists.autoFillError'), error);
      $q.notify({
        type: 'negative',
        message: t('orderLists.autoFillError'),
      });
    }
  };

  const submitOrderList = async (orderList: OrderListWithItems) => {
    // Show confirmation dialog
    $q.dialog({
      title: t('orderLists.submitConfirm'),
      message: t('orderLists.submitMessage', {
        name: orderList.name,
        supplier: orderList.supplier?.name || t('common.unknownSupplier'),
        items: orderList.total_items,
        amount: `€${orderList.total_amount.toFixed(2)}`
      }),
      persistent: true,
      ok: {
        label: t('orderLists.confirmSubmit'),
        color: 'positive'
      },
      cancel: {
        label: t('common.cancel'),
        color: 'grey',
        flat: true
      }
    }).onOk(async () => {
      try {
        // Set submitting state (for loading indicator)
        submittingOrderLists.value.add(orderList.id);
        
        await orderListsStore.changeOrderListStatus(orderList.id, 'submitted');
        
        $q.notify({
          type: 'positive',
          message: t('orderLists.submitted', { name: orderList.name }),
          timeout: 3000,
          actions: [
            {
              label: t('orderLists.viewSubmitted'),
              color: 'white',
              handler: () => {
                // Could navigate to submitted orders view
                // Navigate to submitted orders
              }
            }
          ]
        });
      } catch (error) {
        console.error('Error submitting order list:', error);
        $q.notify({
          type: 'negative',
          message: t('orderLists.submitError'),
        });
      } finally {
        submittingOrderLists.value.delete(orderList.id);
      }
    });
  };

  const sendToSupplier = async (orderList: OrderListWithItems) => {
    // Show supplier order method dialog first
    $q.dialog({
      title: t('orderLists.sendToSupplierConfirm'),
      message: t('orderLists.sendToSupplierMessage', {
        name: orderList.name,
        supplier: orderList.supplier?.name || t('common.unknownSupplier'),
        method: orderList.supplier?.order_method || 'manual'
      }),
      persistent: true,
      ok: {
        label: t('orderLists.confirmSend'),
        color: 'primary'
      },
      cancel: {
        label: t('common.cancel'),
        color: 'grey',
        flat: true
      }
    }).onOk(async () => {
      try {
        sendingToSupplier.value[orderList.id] = true;
        
        // Call the supplier order function we created
        const { data, error } = await supabase.rpc('send_supplier_order', {
          order_list_uuid: orderList.id,
          supplier_uuid: orderList.supplier_id
        });

        if (error) throw error;

        if (data?.success) {
          $q.notify({
            type: 'positive',
            message: t('orderLists.sentToSupplier', { 
              name: orderList.name,
              method: data.order_method 
            }),
          });
          
          // Reload order lists to get updated status
          const practiceId = authStore.clinicId;
          if (practiceId) {
            await orderListsStore.fetchOrderLists(practiceId);
          }
        } else {
          throw new Error(data?.error || 'Send failed');
        }
      } catch (error: any) {
        console.error('Error sending to supplier:', error);
        $q.notify({
          type: 'negative',
          message: t('orderLists.sendError', { error: error.message }),
        });
      } finally {
        sendingToSupplier.value[orderList.id] = false;
      }
    });
  };

  const onOrderListSaved = () => {
    showCreateDialog.value = false;
    selectedOrderList.value = null;
  };

  // Lifecycle
  onMounted(async () => {
    try {
      const practiceId = authStore.clinicId;
      if (practiceId) {
        await Promise.all([
          orderListsStore.fetchOrderLists(practiceId),
          suppliersStore.fetchSuppliers(),
          productsStore.fetchProducts(practiceId),
        ]);
      }

      // Initialize filter values with defaults
      if (orderListsFilterPreset.defaultFilters) {
        filterValues.value = { ...orderListsFilterPreset.defaultFilters } as FilterValues;
      }
    } catch (error) {
      console.error(t('orderLists.loadError'), error);
      $q.notify({
        type: 'negative',
        message: t('orderLists.loadError'),
      });
    }
  });

  // Watch for practice changes
  watch(
    () => authStore.clinicId,
    async newPracticeId => {
      if (newPracticeId) {
        try {
          await orderListsStore.fetchOrderLists(newPracticeId);
        } catch (error) {
          console.error(t('orderLists.loadError'), error);
          $q.notify({
            type: 'negative',
            message: t('orderLists.loadError'),
          });
        }
      }
    }
  );
</script>

<style scoped>
  .full-height {
    height: 100%;
  }
</style>
