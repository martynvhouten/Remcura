<template>
  <q-dialog
    v-model="isOpen"
    position="right"
    maximized
    class="product-details-dialog"
  >
    <q-card class="column no-wrap full-height">
      <!-- Header -->
      <q-card-section class="row items-center bg-primary text-white q-pa-md">
        <q-icon name="info" size="1.5rem" class="q-mr-sm" />
        <div class="text-h6">{{ $t('productsPage.details.title') }}</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          :title="$t('common.close')"
        />
      </q-card-section>

      <!-- Content -->
      <q-card-section class="col scroll">
        <div v-if="product" class="q-gutter-lg">
          <!-- Product Image -->
          <div v-if="product.image_url" class="text-center">
            <q-img
              :src="product.image_url"
              :alt="product.name"
              style="max-width: 300px; max-height: 200px"
              class="rounded-borders"
              fit="contain"
            >
              <template #error>
                <div class="absolute-full flex flex-center bg-grey-3">
                  <q-icon name="image" size="3rem" color="grey-5" />
                  <div class="q-ml-sm text-grey-6">
                    {{ $t('productsPage.details.noImage') }}
                  </div>
                </div>
              </template>
            </q-img>
          </div>

          <!-- Basic Information Card -->
          <BaseCard>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="info" class="q-mr-sm" />
                {{ $t('productsPage.details.basicInfo') }}
              </div>

              <div class="row q-gutter-md">
                <div class="col-12 col-md-6">
                  <q-list dense>
                    <q-item>
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.name') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ product.name }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.sku') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ product.sku || $t('common.noSku') }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.category') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          <q-chip
                            v-if="product.category"
                            :label="product.category"
                            size="sm"
                            color="grey-3"
                            text-color="grey-8"
                            icon="category"
                          />
                          <span v-else class="text-grey-6">-</span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="col-12 col-md-6">
                  <q-list dense>
                    <q-item v-if="product.brand">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.brand') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ product.brand }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="product.unit">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.unit') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ product.unit }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.price') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          <span v-if="bestPrice" class="text-h6 text-primary">
                            {{ formatPrice(bestPrice.price) }}
                          </span>
                          <span v-else class="text-grey-6">
                            {{ $t('productsPage.details.priceNotAvailable') }}
                          </span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- Description -->
              <div class="q-mt-md">
                <q-item-label class="text-caption text-grey-6 q-mb-xs">
                  {{ $t('productsPage.details.description') }}
                </q-item-label>
                <div class="text-body2">
                  {{
                    product.description ||
                    $t('productsPage.details.noDescription')
                  }}
                </div>
              </div>
            </q-card-section>
          </BaseCard>

          <!-- GS1 Information Card -->
          <BaseCard v-if="hasGS1Data">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="qr_code" class="q-mr-sm" />
                {{ $t('productsPage.details.gs1Info') }}
              </div>

              <div class="row q-gutter-md">
                <!-- Left Column: Core Identifiers -->
                <div class="col-12 col-md-6">
                  <q-list dense>
                    <q-item v-if="product.gtin">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.gtin') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          <q-chip
                            :label="product.gtin"
                            icon="qr_code_2"
                            color="primary"
                            text-color="white"
                            size="sm"
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="product.gpc_brick_code">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.gpcBrickCode') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ product.gpc_brick_code }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="product.country_of_origin">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.countryOfOrigin') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          <q-chip
                            :label="getCountryName(product.country_of_origin)"
                            :icon="getCountryFlag(product.country_of_origin)"
                            color="blue-grey-2"
                            text-color="blue-grey-8"
                            size="sm"
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="product.product_lifecycle_status">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.lifecycleStatus') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          <q-badge
                            :color="getLifecycleStatusColor(product.product_lifecycle_status)"
                            :label="$t(`productsPage.lifecycleStatus.${product.product_lifecycle_status}`)"
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Right Column: Packaging & Regulatory -->
                <div class="col-12 col-md-6">
                  <q-list dense>
                    <q-item v-if="hasPackagingInfo">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.netContent') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ product.net_content_value }} {{ product.net_content_uom }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="hasWeightInfo">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.weight') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          <div class="column">
                            <span v-if="product.net_weight">
                              {{ $t('productsPage.details.netWeight') }}: {{ product.net_weight }}g
                            </span>
                            <span v-if="product.gross_weight">
                              {{ $t('productsPage.details.grossWeight') }}: {{ product.gross_weight }}g
                            </span>
                          </div>
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="hasValidityInfo">
                      <q-item-section>
                        <q-item-label class="text-caption text-grey-6">
                          {{ $t('productsPage.details.validityPeriod') }}
                        </q-item-label>
                        <q-item-label class="text-weight-medium">
                          <div class="column">
                            <span v-if="product.effective_from_date">
                              {{ $t('productsPage.details.from') }}: {{ formatDate(product.effective_from_date) }}
                            </span>
                            <span v-if="product.effective_to_date">
                              {{ $t('productsPage.details.to') }}: {{ formatDate(product.effective_to_date) }}
                            </span>
                          </div>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- Unit Indicators -->
              <div v-if="hasUnitIndicators" class="q-mt-md">
                <q-item-label class="text-caption text-grey-6 q-mb-xs">
                  {{ $t('productsPage.details.unitIndicators') }}
                </q-item-label>
                <div class="row q-gutter-sm">
                  <q-chip
                    v-if="product.base_unit_indicator"
                    :label="$t('productsPage.details.baseUnit')"
                    icon="inventory"
                    color="green"
                    text-color="white"
                    size="sm"
                  />
                  <q-chip
                    v-if="product.orderable_unit_indicator"
                    :label="$t('productsPage.details.orderable')"
                    icon="shopping_cart"
                    color="blue"
                    text-color="white"
                    size="sm"
                  />
                  <q-chip
                    v-if="product.despatch_unit_indicator"
                    :label="$t('productsPage.details.despatchable')"
                    icon="local_shipping"
                    color="orange"
                    text-color="white"
                    size="sm"
                  />
                </div>
              </div>
            </q-card-section>
          </BaseCard>

          <!-- Stock Information Card -->
          <BaseCard>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="inventory_2" class="q-mr-sm" />
                {{ $t('productsPage.details.stockInfo') }}
              </div>

              <div class="row q-gutter-md">
                <div class="col-12 col-md-6">
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-caption text-grey-6">
                        {{ $t('productsPage.details.currentStock') }}
                      </q-item-label>
                      <q-item-label class="text-h6">
                        {{ product.total_stock }} {{ product.unit || '' }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon
                        :name="stockStatusIcon"
                        :color="stockStatusColor"
                        size="1.5rem"
                      />
                    </q-item-section>
                  </q-item>
                </div>

                <div class="col-12 col-md-6">
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-caption text-grey-6">
                        {{ $t('productsPage.table.stockStatus') }}
                      </q-item-label>
                      <q-item-label>
                        <q-badge
                          :color="stockStatusColor"
                          :label="
                            $t(
                              `productsPage.stockStatus.${product.stock_status}`
                            )
                          "
                        />
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </q-card-section>
          </BaseCard>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="bg-grey-1 q-pa-md">
        <q-btn
          :label="$t('productsPage.addToCart')"
          icon="add_shopping_cart"
          color="primary"
          class="q-mr-sm"
          :disable="product?.stock_status === 'out_of_stock'"
          @click="$emit('addToCart', product)"
        />
        <q-btn
          :label="$t('productsPage.addToOrderList')"
          icon="playlist_add"
          color="secondary"
          outline
          @click="$emit('addToOrderList', product)"
        />
        <q-space />
        <q-btn :label="$t('common.close')" color="grey-7" flat v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BaseCard from 'src/components/base/BaseCard.vue';
  import { useFormatting } from 'src/composables/useFormatting';
  import type { ProductWithStock } from 'src/types/inventory';

  interface Props {
    modelValue: boolean;
    product?: ProductWithStock | null;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'addToCart', product: ProductWithStock): void;
    (e: 'addToOrderList', product: ProductWithStock): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();
  const { t, locale } = useI18n();
  const { formatPrice } = useFormatting();

  const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  });

  const stockStatusColor = computed(() => {
    if (!props.product) return 'grey';

    switch (props.product.stock_status) {
      case 'in_stock':
        return 'positive';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'negative';
      default:
        return 'grey';
    }
  });

  const stockStatusIcon = computed(() => {
    if (!props.product) return 'help';

    switch (props.product.stock_status) {
      case 'in_stock':
        return 'check_circle';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'cancel';
      default:
        return 'help';
    }
  });

  const bestPrice = computed(() => {
    if (!props.product?.supplier_products?.length) return null;

    const pricesWithSupplier = props.product.supplier_products
      .filter(sp => sp.price && sp.price > 0)
      .map(sp => ({
        price: sp.price,
        supplier: sp.supplier_name || sp.supplier_id,
      }))
      .sort((a, b) => a.price - b.price);

    return pricesWithSupplier[0] || null;
  });

  // GS1 Data Computed Properties
  const hasGS1Data = computed(() => {
    if (!props.product) return false;
    return !!(
      props.product.gtin ||
      props.product.gpc_brick_code ||
      props.product.country_of_origin ||
      props.product.product_lifecycle_status ||
      hasPackagingInfo.value ||
      hasWeightInfo.value ||
      hasValidityInfo.value ||
      hasUnitIndicators.value
    );
  });

  const hasPackagingInfo = computed(() => {
    return !!(props.product?.net_content_value && props.product?.net_content_uom);
  });

  const hasWeightInfo = computed(() => {
    return !!(props.product?.net_weight || props.product?.gross_weight);
  });

  const hasValidityInfo = computed(() => {
    return !!(props.product?.effective_from_date || props.product?.effective_to_date);
  });

  const hasUnitIndicators = computed(() => {
    return !!(
      props.product?.base_unit_indicator ||
      props.product?.orderable_unit_indicator ||
      props.product?.despatch_unit_indicator
    );
  });

  // Helper Functions
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale.value);
  };

  const getCountryName = (countryCode: string): string => {
    const countryNames: Record<string, string> = {
      NLD: 'Nederland',
      DEU: 'Duitsland',
      BEL: 'België',
      FRA: 'Frankrijk',
      GBR: 'Verenigd Koninkrijk',
      ITA: 'Italië',
      ESP: 'Spanje',
      CHE: 'Zwitserland',
      AUT: 'Oostenrijk',
      USA: 'Verenigde Staten',
      CHN: 'China',
      JPN: 'Japan',
    };
    return countryNames[countryCode] || countryCode;
  };

  const getCountryFlag = (countryCode: string): string => {
    const countryFlags: Record<string, string> = {
      NLD: 'flag',
      DEU: 'flag',
      BEL: 'flag',
      FRA: 'flag',
      GBR: 'flag',
      ITA: 'flag',
      ESP: 'flag',
      CHE: 'flag',
      AUT: 'flag',
      USA: 'flag',
      CHN: 'flag',
      JPN: 'flag',
    };
    return countryFlags[countryCode] || 'public';
  };

  const getLifecycleStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'positive';
      case 'discontinued':
        return 'negative';
      case 'new':
        return 'info';
      case 'phase_out':
        return 'warning';
      default:
        return 'grey';
    }
  };
</script>

<style lang="scss" scoped>
  .product-details-dialog {
    .q-dialog__inner {
      padding: 0;
    }
  }
</style>
