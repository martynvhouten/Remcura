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

    <!-- Filters -->
    <BaseCard class="q-mb-md">
      <div class="row q-gutter-md items-center">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filters.search"
            :placeholder="$t('common.search')"
            outlined
            dense
            clearable
            debounce="300"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.supplier"
            :options="supplierOptions"
            :label="$t('orderLists.supplier')"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.status"
            :options="statusOptions"
            :label="$t('orderLists.status')"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-2">
          <q-btn
            :label="$t('common.clearFilters')"
            outline
            color="primary"
            @click="clearFilters"
            size="md"
          />
        </div>
      </div>
    </BaseCard>

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
                  {{ $t("orderLists.supplier") }}
                </div>
                <div class="text-body2">
                  {{ orderList.supplier?.name || t('common.unknownSupplier') }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">
                  {{ $t("orderLists.totalItems") }}
                </div>
                <div class="text-body2">{{ orderList.total_items }}</div>
              </div>
            </div>

            <div class="row q-gutter-sm q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey-6">
                  {{ $t("orderLists.totalAmount") }}
                </div>
                <div class="text-body2">
                  €{{ orderList.total_amount.toFixed(2) }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">
                  {{ $t("orderLists.updatedAt") }}
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
                    $t("orderLists.duplicate")
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
                    $t("orderLists.autoFill")
                  }}</q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  v-close-popup
                  @click="deleteOrderList(orderList)"
                  class="text-negative"
                >
                  <q-item-section avatar>
                    <q-icon name="delete" />
                  </q-item-section>
                  <q-item-section>{{ $t("orderLists.delete") }}</q-item-section>
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
      <div class="text-h6 q-mb-sm">{{ $t("orderLists.noLists") }}</div>
      <div class="text-body1 text-grey-6 q-mb-lg">
        {{ $t("orderLists.createNew") }}
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
          <div class="text-h6">{{ $t("orderLists.deleteDialog") }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ $t("orderLists.deleteConfirm") }}
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
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useOrderListsStore } from "src/stores/orderLists";
import { useSuppliersStore } from "src/stores/suppliers";
import { useProductsStore } from "src/stores/products";
import { useAuthStore } from "src/stores/auth";
import PageLayout from "src/components/PageLayout.vue";
import PageTitle from "src/components/PageTitle.vue";
import BaseCard from "src/components/base/BaseCard.vue";
import OrderListDialog from "src/components/products/OrderListDialog.vue";
import type { OrderListWithItems } from "src/stores/orderLists";

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

// Filters
const filters = ref({
  search: "",
  supplier: "",
  status: "",
});

// Computed
const supplierOptions = computed(() => [
  { label: t("common.all"), value: "" },
  ...suppliersStore.suppliers.map((supplier) => ({
    label: supplier.name,
    value: supplier.id,
  })),
]);

const statusOptions = computed(() => [
  { label: t("common.all"), value: "" },
  { label: t("orderLists.draft"), value: "draft" },
  { label: t("orderLists.ready"), value: "ready" },
  { label: t("orderLists.submitted"), value: "submitted" },
  { label: t("orderLists.confirmed"), value: "confirmed" },
  { label: t("orderLists.delivered"), value: "delivered" },
  { label: t("orderLists.cancelled"), value: "cancelled" },
]);

const filteredOrderLists = computed(() => {
  let result = [...orderListsStore.orderLists];

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    result = result.filter(
      (list) =>
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
      (list) => list.supplier_id === filters.value.supplier
    );
  }

  // Apply status filter
  if (filters.value.status) {
    result = result.filter((list) => list.status === filters.value.status);
  }

  return result;
});

// Methods
const clearFilters = () => {
  filters.value = {
    search: "",
    supplier: "",
    status: "",
  };
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "grey",
    ready: "blue",
    submitted: "orange",
    confirmed: "green",
    delivered: "positive",
    cancelled: "negative",
  };
  return colors[status] || "grey";
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
    const newName = t("orderLists.duplicateName", { name: orderList.name });
    await orderListsStore.duplicateOrderList(orderList.id, newName);
    $q.notify({
      type: "positive",
      message: t("orderLists.duplicated"),
    });
  } catch (error) {
    console.error(t("orderLists.saveError"), error);
    $q.notify({
      type: "negative",
      message: t("orderLists.saveError"),
    });
  }
};

const deleteOrderList = (orderList: OrderListWithItems) => {
  orderListToDelete.value = orderList;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!orderListToDelete.value) return;

  try {
    await orderListsStore.deleteOrderList(orderListToDelete.value.id);
    showDeleteDialog.value = false;
    orderListToDelete.value = null;
    $q.notify({
      type: "positive",
      message: t("orderLists.deleted"),
    });
  } catch (error) {
    console.error(t("orderLists.deleteError"), error);
    $q.notify({
      type: "negative",
      message: t("orderLists.deleteError"),
    });
  }
};

const addListToCart = async (orderList: OrderListWithItems) => {
  try {
    await orderListsStore.addToCart(orderList.id);
    $q.notify({
      type: "positive",
      message: t("orderLists.addedToCart"),
    });
  } catch (error) {
    console.error(t("orderLists.cartError"), error);
    $q.notify({
      type: "negative",
      message: t("orderLists.cartError"),
    });
  }
};

const autoFillOrderList = async (orderList: OrderListWithItems) => {
  try {
    await orderListsStore.autoFillFromStockLevels(orderList.id);
    $q.notify({
      type: "positive",
      message: t("orderLists.autoFilled"),
    });
  } catch (error) {
    console.error(t("orderLists.autoFillError"), error);
    $q.notify({
      type: "negative",
      message: t("orderLists.autoFillError"),
    });
  }
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
  } catch (error) {
    console.error(t("orderLists.loadError"), error);
    $q.notify({
      type: "negative",
      message: t("orderLists.loadError"),
    });
  }
});

// Watch for practice changes
watch(
  () => authStore.clinicId,
  async (newPracticeId) => {
    if (newPracticeId) {
      try {
        await orderListsStore.fetchOrderLists(newPracticeId);
      } catch (error) {
        console.error(t("orderLists.loadError"), error);
        $q.notify({
          type: "negative",
          message: t("orderLists.loadError"),
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
