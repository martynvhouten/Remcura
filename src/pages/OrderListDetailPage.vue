<template>
  <div class="order-detail-page">
    <!-- Modern Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb-nav">
          <q-btn
            flat
            round
            icon="arrow_back"
            @click="router.back()"
            class="back-btn"
          />
          <span class="breadcrumb-text">Bestellijsten</span>
          <q-icon
            name="chevron_right"
            size="16px"
            class="breadcrumb-separator"
          />
          <span class="breadcrumb-current">{{
            orderList?.name || 'Laden...'
          }}</span>
        </div>

        <div class="header-main">
          <div class="title-section">
            <div class="list-icon-large">
              <q-icon
                :name="getListIcon()"
                :color="getIconColor()"
                class="icon-size-2xl"
              />
            </div>
            <div class="title-content">
              <h1 class="page-title">{{ orderList?.name || 'Bestellijst' }}</h1>
              <p class="page-subtitle">
                {{ orderList?.description || 'Details en producten beheren' }}
              </p>
              <div class="title-meta">
                <q-badge
                  :color="statusColor"
                  :label="statusLabel"
                  class="status-badge"
                />
                <span class="meta-separator">•</span>
                <span class="meta-text"
                  >{{ orderList?.total_items || 0 }} producten</span
                >
                <span class="meta-separator">•</span>
                <span class="meta-text"
                  >€{{
                    formatCurrency((orderList as any)?.total_value || 0)
                  }}</span
                >
              </div>
            </div>
          </div>

          <div class="header-actions">
            <q-btn
              @click="addProduct"
              icon="add"
            :label="$t('orderLists.addProduct')"
              color="primary"
              unelevated
              no-caps
              class="primary-action"
            />
            <q-btn
              @click="editOrderList"
              icon="edit"
              outline
              color="primary"
              no-caps
              class="secondary-action"
            />
          <q-btn
            @click="confirmPlaceAll = true"
            icon="shopping_cart_checkout"
            color="primary"
            no-caps
            class="primary-action"
            :label="$t('orderLists.orderAll')"
          />
            <q-btn flat round icon="more_vert" class="menu-btn">
              <q-menu>
                <q-list dense>
                <q-item clickable @click="duplicateList" v-close-popup>
                    <q-item-section avatar>
                      <q-icon name="content_copy" />
                    </q-item-section>
                  <q-item-section>{{ $t('common.duplicate') }}</q-item-section>
                  </q-item>
                <q-item clickable @click="exportList" v-close-popup>
                    <q-item-section avatar>
                      <q-icon name="download" />
                    </q-item-section>
                  <q-item-section>{{ $t('common.export') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    clickable
                    @click="deleteList"
                    v-close-popup
                    class="text-negative"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" />
                    </q-item-section>
                  <q-item-section>{{ $t('common.delete') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-gears size="xl" color="primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="q-pa-lg">
      <q-banner class="bg-negative text-white">
        <template v-slot:avatar>
          <q-icon name="error" />
        </template>
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Opnieuw proberen" @click="loadOrderList" />
        </template>
      </q-banner>
    </div>

    <!-- Main Content -->
    <div v-else-if="orderList" class="main-content">
      <!-- Filters Section -->
      <div class="filters-section q-mb-md">
        <FilterPanel
          :preset="orderListsFilterPreset"
          v-model="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterReset"
          @clear="handleFilterClear"
          :loading="loadingItems"
          collapsible
          class="order-list-filter-panel"
        />
      </div>

      <!-- Table Header -->
      <div class="table-header q-mb-sm">
        <div class="row items-center justify-between">
          <div class="col-auto">
            <div class="table-info">
              <span class="table-count"
                >{{ filteredOrderListItems.length }} van
                {{ orderListItems.length }} items</span
              >
            </div>
          </div>

          <div class="col-auto">
            <q-btn
              flat
              round
              icon="refresh"
              @click="loadOrderListItems"
              :loading="loadingItems"
              color="grey-7"
              size="sm"
            >
              <q-tooltip>Vernieuwen</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Products Table (Direct, not in card container) -->
      <div v-if="loadingItems" class="loading-state">
        <q-inner-loading :showing="loadingItems">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </div>

      <div v-else-if="orderListItems.length === 0" class="empty-state">
        <div class="empty-icon">
          <q-icon name="inventory_2" class="icon-size-2xl" color="grey-4" />
        </div>
        <h3>Geen producten toegevoegd</h3>
        <p>Voeg producten toe aan deze bestellijst om te beginnen.</p>
        <q-btn
          @click="addProduct"
          icon="add"
          label="Eerste product toevoegen"
          color="primary"
          unelevated
          no-caps
        />
      </div>

      <div v-else class="medical-table">
        <SmartTable
          :data="filteredOrderListItems"
          :columns="orderListTableColumns"
          :config="smartTableConfig"
          row-key="id"
          :rows-per-page-options="[25, 50, 100]"
        >
          <!-- Loading -->
          <template #loading>
            <q-inner-loading showing color="primary" />
          </template>

          <!-- No Data -->
          <template #no-data>
            <div class="full-width row flex-center q-gutter-sm">
              <q-icon class="icon-size-xl" name="search_off" />
              <span>Geen producten gevonden met de huidige filters</span>
            </div>
          </template>

          <!-- Product Name Cell -->
          <template #body-cell-name="props">
            <q-td :props="props" class="product-name-cell">
              <div class="product-info">
                <div class="product-name">
                  {{
                    props.row.product_name ||
                    props.row.product?.name ||
                    'Onbekend product'
                  }}
                </div>
                <div class="product-sku">
                  {{
                    props.row.product_sku ||
                    props.row.product?.sku ||
                    'Geen SKU'
                  }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- Quantity Cell with Controls -->
          <template #body-cell-quantity="props">
            <q-td :props="props" class="quantity-cell">
              <div class="quantity-controls">
                <q-btn
                  flat
                  round
                  dense
                  icon="remove"
                  @click="decrementQuantity(props.row)"
                  :disable="props.row.suggested_quantity <= 0"
                  class="quantity-btn"
                />
                <q-input
                  v-model.number="props.row.suggested_quantity"
                  type="number"
                  min="0"
                  dense
                  outlined
                  class="quantity-input"
                  @update:model-value="updateItemQuantity(props.row)"
                  style="width: 80px"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  @click="incrementQuantity(props.row)"
                  class="quantity-btn"
                />
              </div>
            </q-td>
          </template>

          <!-- Unit Price Cell -->
          <template #body-cell-unit_price="props">
            <q-td :props="props" class="price-cell">
              €{{ (props.row.unit_price || 0).toFixed(2) }}
            </q-td>
          </template>

          <!-- Total Price Cell -->
          <template #body-cell-total_price="props">
            <q-td :props="props" class="total-price-cell">
              <strong
                >€{{
                  (
                    (props.row.suggested_quantity || 0) *
                    (props.row.unit_price || 0)
                  ).toFixed(2)
                }}</strong
              >
            </q-td>
          </template>

          <!-- Supplier Cell -->
          <template #body-cell-supplier="props">
            <q-td :props="props" class="supplier-cell">
              {{ props.row.supplier_product?.supplier?.name || 'Onbekend' }}
            </q-td>
          </template>

          <!-- Actions Cell -->
          <template #body-cell-actions="props">
            <q-td :props="props" class="actions-cell">
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  @click="editItem(props.row)"
                >
                  <q-tooltip>Bewerken</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="removeItem(props.row)"
                >
                  <q-tooltip>Verwijderen</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </SmartTable>
      </div>
    </div>

    <!-- Add Product Dialog -->
    <FormDialog
      v-model="showAddProductDialog"
      :title="$t('orderLists.addProduct')"
      :subtitle="$t('orderLists.addProductSubtitle')"
      icon="add_shopping_cart"
      size="md"
      :loading="addingProduct"
      :can-submit="!!(selectedProduct && newItemQuantity)"
      :submit-button-text="$t('common.add')"
      @submit="confirmAddProduct"
      @cancel="showAddProductDialog = false"
    >
      <div class="q-gutter-md">
        <q-select
          v-model="selectedProduct"
          :options="filteredProducts"
          option-label="name"
          option-value="id"
          :label="$t('products.search')"
          outlined
          use-input
          clearable
          @filter="filterProducts"
          :loading="loadingProducts"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-avatar size="sm">
                  <q-icon name="inventory" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.sku }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-input
          v-model.number="newItemQuantity"
          :label="$t('orderLists.recommendedQty')"
          type="number"
          min="1"
          outlined
        />
      </div>
    </FormDialog>

    <!-- Confirm place all dialog -->
    <q-dialog v-model="confirmPlaceAll">
      <q-card>
        <q-card-section class="text-h6">
          {{ $t('orderLists.confirmPlaceAllTitle') }}
        </q-card-section>
        <q-card-section>
          {{ $t('orderLists.confirmPlaceAllBody') }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('orderLists.orderAll')" @click="orderAll()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { useOrderListsStore } from '@/stores/orderLists';
  import { useProductsStore } from '@/stores/products';
  import { useAuthStore } from '@/stores/auth';
  import FormDialog from 'src/components/base/FormDialog.vue';
  import SmartTable from '@/components/tables/SmartTable.vue';
  import FilterPanel from '@/components/filters/FilterPanel.vue';
  import type { OrderListWithItems } from '@/types/stores';
  import type {
    FilterValues,
    FilterChangeEvent,
    FilterResetEvent,
  } from '@/types/filters';
  import { orderListsFilterPreset } from '@/presets/filters/orderLists';

  const route = useRoute();
  const router = useRouter();
  const $q = useQuasar();
  const orderListsStore = useOrderListsStore();
  const productsStore = useProductsStore();

  // State
  const loading = ref(true);
  const loadingItems = ref(false);
  const loadingProducts = ref(false);
  const addingProduct = ref(false);
  const error = ref<string | null>(null);
  const orderList = ref<OrderListWithItems | null>(null);
  const orderListItems = ref<any[]>([]);
  const showAddProductDialog = ref(false);
  const confirmPlaceAll = ref(false);
  const selectedProduct = ref<any>(null);
  const newItemQuantity = ref(1);
  const filteredProducts = ref<any[]>([]);

  // Filter state
  const filterValues = ref<FilterValues>({});

  // Table columns for order list items
  const orderListTableColumns = computed(() => [
    {
      name: 'name',
      label: 'Product',
      field: 'product_name',
      align: 'left' as const,
      sortable: true,
      style: 'width: 250px',
    },
    {
      name: 'quantity',
      label: 'Hoeveelheid',
      field: 'suggested_quantity',
      align: 'center' as const,
      sortable: true,
      style: 'width: 150px',
    },
    {
      name: 'unit_price',
      label: 'Prijs/stuk',
      field: 'unit_price',
      align: 'right' as const,
      sortable: true,
      style: 'width: 120px',
    },
    {
      name: 'total_price',
      label: 'Totaal',
      field: (row: any) =>
        (row.suggested_quantity || 0) * (row.unit_price || 0),
      align: 'right' as const,
      sortable: true,
      style: 'width: 120px',
    },
    {
      name: 'supplier',
      label: 'Leverancier',
      field: (row: any) => row.supplier_product?.supplier?.name || 'Onbekend',
      align: 'left' as const,
      sortable: true,
      style: 'width: 150px',
    },
    {
      name: 'actions',
      label: 'Acties',
      field: 'actions',
      align: 'center' as const,
      sortable: false,
      style: 'width: 120px',
    },
  ]);

  // Smart table configuration
  const smartTableConfig = computed(() => ({
    enableVirtualization: orderListItems.value.length > 100,
    clientSideThreshold: 50,
    serverSideThreshold: 200,
  }));

  // Computed
  const statusColor = computed(() => {
    if (!orderList.value) {
      return 'grey';
    }
    switch (orderList.value.status) {
      case 'ready':
        return 'positive';
      case 'draft':
        return 'warning';
      case 'submitted':
        return 'info';
      case 'confirmed':
        return 'primary';
      case 'delivered':
        return 'positive';
      case 'cancelled':
        return 'negative';
      default:
        return 'grey';
    }
  });

  const statusLabel = computed(() => {
    if (!orderList.value) {
      return 'Onbekend';
    }
    switch (orderList.value.status) {
      case 'ready':
        return 'Klaar';
      case 'draft':
        return 'Concept';
      case 'submitted':
        return 'Verzonden';
      case 'confirmed':
        return 'Bevestigd';
      case 'delivered':
        return 'Geleverd';
      case 'cancelled':
        return 'Geannuleerd';
      default:
        return 'Onbekend';
    }
  });

  // Filter computed properties
  const filteredOrderListItems = computed(() => {
    let filtered = [...orderListItems.value];

    // Text search
    if (
      filterValues.value.search &&
      typeof filterValues.value.search === 'string'
    ) {
      const search = filterValues.value.search.toLowerCase();
      filtered = filtered.filter(
        item =>
          (item.product_name || item.product?.name || '')
            .toLowerCase()
            .includes(search) ||
          (item.product_sku || item.product?.sku || '')
            .toLowerCase()
            .includes(search)
      );
    }

    // Supplier filter
    if (filterValues.value.supplier) {
      filtered = filtered.filter(
        item =>
          item.supplier_product?.supplier?.id === filterValues.value.supplier
      );
    }

    return filtered;
  });

  // Filter handlers
  const handleFilterChange = (event: FilterChangeEvent) => {
    if (
      event.value &&
      typeof event.value === 'object' &&
      !Array.isArray(event.value) &&
      !(event.value instanceof Date)
    ) {
      filterValues.value = {
        ...filterValues.value,
        ...(event.value as FilterValues),
      };
    }
  };

  const handleFilterReset = (event: FilterResetEvent) => {
    filterValues.value = {};
  };

  const handleFilterClear = () => {
    filterValues.value = {};
  };

  // Methods
  const loadOrderList = async () => {
    loading.value = true;
    error.value = null;

    try {
      const listId = route.params.id as string;
      orderList.value = await orderListsStore.getOrderListById(listId);
      await loadOrderListItems();
    } catch (err) {
      error.value = 'Kon bestellijst niet laden';
      console.error('Error loading order list:', err);
    } finally {
      loading.value = false;
    }
  };

  const loadOrderListItems = async () => {
    if (!orderList.value) {
      return;
    }

    loadingItems.value = true;
    try {
      // For now, we'll use the items from the orderList object
      // In the future, we can create a dedicated method for this
      orderListItems.value = orderList.value.items || [];
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Kon producten niet laden',
      });
    } finally {
      loadingItems.value = false;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
  };

  const getStockColor = (current: number, minimum: number) => {
    if (current === 0) {
      return 'negative';
    }
    if (current <= minimum) {
      return 'warning';
    }
    return 'positive';
  };

  const editOrderList = () => {
    $q.notify({
      type: 'info',
      message: 'Bewerken functionaliteit komt binnenkort',
    });
  };

  const addProduct = () => {
    showAddProductDialog.value = true;
    loadProducts();
  };

  const loadProducts = async () => {
    loadingProducts.value = true;
    try {
      const authStore = useAuthStore();
      if (authStore.clinicId) {
        await productsStore.fetchProducts(authStore.clinicId);
      }
      filteredProducts.value = productsStore.products.slice(0, 20); // Limit initial results
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Kon producten niet laden',
      });
    } finally {
      loadingProducts.value = false;
    }
  };

  const filterProducts = (
    val: string,
    update: (callback: () => void) => void
  ) => {
    update(() => {
      if (val === '') {
        filteredProducts.value = productsStore.products.slice(0, 20);
      } else {
        const needle = val.toLowerCase();
        filteredProducts.value = productsStore.products
          .filter(
            product =>
              product.name.toLowerCase().includes(needle) ||
              product.sku?.toLowerCase().includes(needle)
          )
          .slice(0, 20);
      }
    });
  };

  const confirmAddProduct = async () => {
    if (!selectedProduct.value || !orderList.value) {
      return;
    }

    addingProduct.value = true;
    try {
      // Find the first supplier product for this product
      const supplierProduct = selectedProduct.value.supplier_products?.[0];
      if (!supplierProduct) {
        throw new Error('Geen leverancier gevonden voor dit product');
      }

      await orderListsStore.addOrderListItem({
        order_list_id: orderList.value.id,
        product_id: selectedProduct.value.id,
        supplier_product_id: supplierProduct.id,
        requested_quantity: newItemQuantity.value,
        notes: '',
      });

      $q.notify({
        type: 'positive',
        message: 'Product toegevoegd aan bestellijst',
      });

      showAddProductDialog.value = false;
      selectedProduct.value = null;
      newItemQuantity.value = 1;

      // Reload the order list to get updated items
      await loadOrderList();
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Kon product niet toevoegen',
        caption: err instanceof Error ? err.message : 'Onbekende fout',
      });
    } finally {
      addingProduct.value = false;
    }
  };

  const updateItemQuantity = async (item: any) => {
    try {
      await orderListsStore.updateOrderListItem(item.id, {
        suggested_quantity: item.suggested_quantity,
      });

      $q.notify({
        type: 'positive',
        message: 'Hoeveelheid bijgewerkt',
        timeout: 1000,
      });
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Kon hoeveelheid niet bijwerken',
      });
    }
  };

  const incrementQuantity = (item: any) => {
    item.suggested_quantity = (item.suggested_quantity || 0) + 1;
    updateItemQuantity(item);
  };

  const decrementQuantity = (item: any) => {
    if (item.suggested_quantity > 0) {
      item.suggested_quantity = item.suggested_quantity - 1;
      updateItemQuantity(item);
    }
  };

  const duplicateList = async () => {
    try {
      await orderListsStore.duplicateOrderList(orderList.value!.id);
      $q.notify({
        type: 'positive',
        message: 'Bestellijst gedupliceerd',
      });
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Kon lijst niet dupliceren',
      });
    }
  };

  const orderAll = async () => {
    try {
      confirmPlaceAll.value = false;
      processingGlobalOrder.value = true;
      // Delegate to min/max orchestration if available
      if (orderListsStore.applyOrderSuggestions) {
        await orderListsStore.applyOrderSuggestions();
      }
      $q.notify({ type: 'positive', message: $t('orderLists.ordersCreated') as string });
    } catch (err) {
      $q.notify({ type: 'negative', message: $t('orderLists.processingError') as string });
    } finally {
      processingGlobalOrder.value = false;
    }
  };

  const exportList = () => {
    $q.notify({
      type: 'info',
      message: 'Export functionaliteit komt binnenkort',
    });
  };

  const deleteList = async () => {
    $q.dialog({
      title: 'Bestellijst verwijderen',
      message: `Weet je zeker dat je "${orderList.value?.name}" wilt verwijderen?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        await orderListsStore.deleteOrderList(orderList.value!.id);
        $q.notify({
          type: 'positive',
          message: 'Bestellijst verwijderd',
        });
        router.push('/order-lists');
      } catch (err) {
        $q.notify({
          type: 'negative',
          message: 'Kon lijst niet verwijderen',
        });
      }
    });
  };

  const getListIcon = () => {
    return 'list_alt';
  };

  const getIconColor = () => {
    return 'primary';
  };

  const editItem = (item: any) => {
    $q.notify({
      type: 'info',
      message: 'Bewerken functionaliteit komt binnenkort',
    });
  };

  const removeItem = async (item: any) => {
    $q.dialog({
      title: 'Product verwijderen',
      message: `Weet je zeker dat je "${
        item.product_name || item.product?.name
      }" wilt verwijderen?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        await orderListsStore.removeOrderListItem(item.id);

        $q.notify({
          type: 'positive',
          message: 'Product verwijderd',
        });

        // Reload the order list to get updated items
        await loadOrderList();
      } catch (err) {
        $q.notify({
          type: 'negative',
          message: 'Kon product niet verwijderen',
          caption: err instanceof Error ? err.message : 'Onbekende fout',
        });
      }
    });
  };

  // Lifecycle
  onMounted(() => {
    loadOrderList();
  });
</script>

<style scoped>
  /* Table Header Styling */
  .table-header {
    padding: 0;
  }

  .table-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .table-count {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  /* Compact margins for better spacing */
  .filters-section {
    margin-bottom: 16px;
  }

  .table-header {
    margin-bottom: 8px;
  }

  /* Ensure medical-table styling is applied */
  .medical-table {
    margin-top: 0;
  }
  /* Order list detail page styles */
  .order-detail-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--neutral-50) 0%, var(--neutral-200) 100%);
  }

  /* Page Header */
  .page-header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
    box-shadow: var(--shadow-sm);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 32px;
  }

  .breadcrumb-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .back-btn {
    color: var(--text-secondary);
    width: 36px;
    height: 36px;
  }

  .back-btn:hover {
    background: var(--hover-bg);
  }

  .breadcrumb-text {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .breadcrumb-separator {
    color: var(--neutral-300);
  }

  .breadcrumb-current {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }

  .header-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
  }

  .list-icon-large {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      rgba(30, 58, 138, 0.08),
      rgba(30, 58, 138, 0.16)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .title-content {
    flex: 1;
    min-width: 0;
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px 0;
    line-height: 1.2;
  }

  .page-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0 0 12px 0;
    line-height: 1.4;
  }

  .title-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .status-badge {
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 8px;
  }

  .meta-separator {
    color: var(--neutral-300);
    font-weight: 500;
  }

  .meta-text {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .primary-action {
    font-size: 14px;
    font-weight: 500;
    padding: 10px 20px;
    border-radius: 8px;
  }

  .secondary-action {
    font-size: 14px;
    font-weight: 500;
    padding: 10px 16px;
    border-radius: 8px;
  }

  .menu-btn {
    width: 40px;
    height: 40px;
    color: var(--text-secondary);
  }

  .menu-btn:hover {
    background: var(--hover-bg);
  }

  /* Main Content */
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
  }

  /* Stats Bar */
  .stats-bar {
    margin-bottom: 32px;
  }

  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }

  .stat-card {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-primary);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    background: var(--hover-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Products Section */
  .products-section {
    background: var(--bg-secondary);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-primary);
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    border-bottom: 1px solid var(--border-primary);
    background: linear-gradient(135deg, var(--neutral-50) 0%, rgba(248, 250, 252, 0.5) 100%);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-title h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .item-count {
    background: var(--hover-bg);
    color: var(--brand-primary-light);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .refresh-btn {
    color: var(--text-secondary);
    width: 36px;
    height: 36px;
  }

  .refresh-btn:hover {
    background: var(--hover-bg);
  }

  /* Products Table Container */
  .products-table-container {
    position: relative;
    min-height: 200px;
  }

  .loading-state {
    height: 200px;
    position: relative;
  }

  .empty-state {
    text-align: center;
    padding: 64px 32px;
  }

  .empty-icon {
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }

  .empty-state p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0 0 24px 0;
  }

  /* Products Grid */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
    padding: 24px 32px 32px;
  }

  .product-card {
    background: var(--neutral-50);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    overflow: hidden;
  }

  .product-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .product-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
  }

  .product-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .product-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--hover-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .product-details {
    flex: 1;
    min-width: 0;
  }

  .product-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px 0;
    line-height: 1.3;
    word-break: break-word;
  }

  .product-sku {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
    font-family: var(--font-family-mono);
  }

  .product-menu {
    width: 32px;
    height: 32px;
    color: var(--text-secondary);
  }

  .product-menu:hover {
    background: var(--hover-bg);
  }

  .product-content {
    padding: 20px;
  }

  .quantity-section {
    margin-bottom: 20px;
  }

  .quantity-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quantity-btn {
    width: 32px;
    height: 32px;
    color: var(--text-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
  }

  .quantity-btn:hover {
    background: var(--hover-bg);
    border-color: var(--hover-border);
  }

  .quantity-input {
    width: 80px;
  }

  .quantity-input input {
    text-align: center;
    font-weight: 600;
  }

  .product-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .meta-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .meta-label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .meta-value {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 600;
  }

  .total-price {
    color: var(--brand-success-light);
    font-size: 14px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .header-content {
      padding: 16px 20px;
    }

    .header-main {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .title-section {
      width: 100%;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .main-content {
      padding: 20px 16px;
    }

    .stats-container {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
    }

    .section-actions {
      width: 100%;
      justify-content: space-between;
    }

    .products-grid {
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 20px;
    }

    .product-card {
      margin: 0;
    }

    .quantity-controls {
      justify-content: center;
    }
  }

  /* Dark Mode Support */
  .body--dark .order-detail-page {
    background: var(--bg-primary);
  }

  .body--dark .page-header {
    background: var(--bg-secondary);
    border-bottom-color: var(--border-primary);
  }

  .body--dark .page-title {
    color: var(--text-primary);
  }

  .body--dark .page-subtitle {
    color: var(--text-secondary);
  }

  .body--dark .stat-card,
  .body--dark .products-section {
    background: var(--bg-secondary);
    border-color: var(--border-primary);
  }

  .body--dark .product-card {
    background: var(--bg-secondary);
  }

  .body--dark .product-header {
    background: var(--bg-secondary);
    border-bottom-color: var(--border-primary);
  }

  .body--dark .product-name {
    color: var(--text-primary);
  }

  .body--dark .meta-value {
    color: var(--text-primary);
  }
</style>
