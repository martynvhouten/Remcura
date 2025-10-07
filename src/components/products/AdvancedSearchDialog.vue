<template>
  <BaseDialog
    v-model="isOpen"
    :title="$t('productsPage.advancedSearch.title')"
    icon="search"
    size="lg"
    variant="elegant"
    header-variant="solid"
  >
    <div class="advanced-search-content">
      <!-- Basic Search -->
      <div class="search-section">
        <h6 class="section-title">
          {{ $t('productsPage.advancedSearch.basicSearch') }}
        </h6>
        <div class="search-row">
          <q-input
            v-model="searchCriteria.search"
            :placeholder="$t('productsPage.advancedSearch.searchPlaceholder')"
            outlined
            clearable
            class="search-input full-width"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- GS1 Search -->
      <div class="search-section">
        <h6 class="section-title">
          <q-icon name="qr_code_2" class="q-mr-xs" />
          {{ $t('productsPage.advancedSearch.gs1Search') }}
        </h6>
        <div class="search-grid">
          <q-input
            v-model="searchCriteria.gtin"
            :placeholder="$t('productsPage.filters.gtinPlaceholder')"
            outlined
            clearable
            class="search-input"
          >
            <template #prepend>
              <q-icon name="qr_code_2" color="primary" />
            </template>
            <template #append>
              <q-btn
                flat
                round
                icon="qr_code_scanner"
                color="primary"
                size="sm"
                @click="$emit('open-scanner')"
              />
            </template>
          </q-input>

          <q-select
            v-model="searchCriteria.country_of_origin"
            :options="countryOptions"
            emit-value
            map-options
            clearable
            outlined
            :placeholder="$t('productsPage.filters.selectCountry')"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="flag" color="info" />
            </template>
          </q-select>

          <q-select
            v-model="searchCriteria.gpc_brick_code"
            :options="gpcOptions"
            emit-value
            map-options
            clearable
            outlined
            :placeholder="$t('productsPage.filters.selectGpc')"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="category" color="orange" />
            </template>
          </q-select>

          <q-select
            v-model="searchCriteria.lifecycle_status"
            :options="lifecycleOptions"
            emit-value
            map-options
            clearable
            outlined
            :placeholder="$t('productsPage.filters.selectLifecycle')"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="timeline" color="purple" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- Category & Supplier -->
      <div class="search-section">
        <h6 class="section-title">
          {{ $t('productsPage.advancedSearch.categorySupplier') }}
        </h6>
        <div class="search-grid">
          <q-select
            v-model="searchCriteria.category"
            :options="categoryOptions"
            emit-value
            map-options
            clearable
            outlined
            :placeholder="$t('productsPage.filters.selectCategory')"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="folder" color="amber" />
            </template>
          </q-select>

          <q-select
            v-model="searchCriteria.supplier"
            :options="supplierOptions"
            emit-value
            map-options
            clearable
            outlined
            :placeholder="$t('productsPage.filters.selectSupplier')"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="business" color="green" />
            </template>
          </q-select>

          <q-select
            v-model="searchCriteria.stock_status"
            :options="stockStatusOptions"
            emit-value
            map-options
            clearable
            outlined
            :placeholder="$t('productsPage.filters.selectStockStatus')"
            class="search-input"
          >
            <template #prepend>
              <q-icon name="inventory" color="blue" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- Price Range -->
      <div class="search-section">
        <h6 class="section-title">
          {{ $t('productsPage.advancedSearch.priceRange') }}
        </h6>
        <div class="price-range-section">
          <q-input
            v-model.number="searchCriteria.priceMin"
            type="number"
            outlined
            :placeholder="$t('productsPage.filters.minPrice')"
            class="price-input"
          >
            <template #prepend>
              <q-icon name="euro" />
            </template>
          </q-input>
          <span class="price-separator">-</span>
          <q-input
            v-model.number="searchCriteria.priceMax"
            type="number"
            outlined
            :placeholder="$t('productsPage.filters.maxPrice')"
            class="price-input"
          >
            <template #append>
              <q-icon name="euro" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Special Options -->
      <div class="search-section">
        <h6 class="section-title">
          {{ $t('productsPage.advancedSearch.specialOptions') }}
        </h6>
        <div class="options-grid">
          <q-toggle
            v-model="searchCriteria.orderable_only"
            :label="$t('productsPage.filters.orderableOnly')"
            color="positive"
            class="option-toggle"
          />
          <q-toggle
            v-model="searchCriteria.has_gtin"
            :label="$t('productsPage.advancedSearch.hasGtin')"
            color="primary"
            class="option-toggle"
          />
          <q-toggle
            v-model="searchCriteria.batch_tracked"
            :label="$t('productsPage.advancedSearch.batchTracked')"
            color="secondary"
            class="option-toggle"
          />
          <q-toggle
            v-model="searchCriteria.in_stock_only"
            :label="$t('productsPage.advancedSearch.inStockOnly')"
            color="positive"
            class="option-toggle"
          />
        </div>
      </div>

      <!-- Sorting -->
      <div class="search-section">
        <h6 class="section-title">
          {{ $t('productsPage.advancedSearch.sorting') }}
        </h6>
        <div class="sorting-section">
          <q-select
            v-model="searchCriteria.sort_by"
            :options="sortByOptions"
            emit-value
            map-options
            outlined
            :placeholder="$t('productsPage.advancedSearch.sortBy')"
            class="sort-select"
          >
            <template #prepend>
              <q-icon name="sort" />
            </template>
          </q-select>
          <q-btn-toggle
            v-model="searchCriteria.sort_order"
            :options="sortOrderOptions"
            color="primary"
            outline
            class="sort-toggle"
          />
        </div>
      </div>

      <!-- Results Preview -->
      <div v-if="showPreview" class="results-preview">
        <div class="preview-header">
          <h6 class="preview-title">
            <q-icon name="preview" class="q-mr-xs" />
            {{ $t('productsPage.advancedSearch.livePreview') }}
          </h6>
          <q-btn
            flat
            size="sm"
            :icon="previewExpanded ? 'expand_less' : 'expand_more'"
            @click="previewExpanded = !previewExpanded"
          />
        </div>

        <div class="preview-content">
          <div class="preview-stats">
            <q-chip
              :color="previewResults.count > 0 ? 'positive' : 'grey'"
              text-color="white"
              icon="search"
              size="md"
            >
              {{
                $t('productsPage.advancedSearch.resultsFound', {
                  count: previewResults.count,
                })
              }}
            </q-chip>

            <div v-if="previewResults.count > 0" class="preview-metrics">
              <q-chip
                v-if="previewResults.averagePrice"
                outline
                color="info"
                icon="euro"
                size="sm"
              >
                {{ $t('productsPage.advancedSearch.avgPrice') }}:
                {{ formatPrice(previewResults.averagePrice) }}
              </q-chip>

              <q-chip
                v-if="previewResults.inStockCount"
                outline
                color="positive"
                icon="inventory"
                size="sm"
              >
                {{ $t('productsPage.advancedSearch.inStock') }}:
                {{ previewResults.inStockCount }}
              </q-chip>

              <q-chip
                v-if="previewResults.gtinCount"
                outline
                color="primary"
                icon="qr_code_2"
                size="sm"
              >
                {{ $t('productsPage.advancedSearch.withGtin') }}:
                {{ previewResults.gtinCount }}
              </q-chip>
            </div>
          </div>

          <q-slide-transition>
            <div
              v-show="previewExpanded && previewResults.samples.length > 0"
              class="preview-samples"
            >
              <div class="samples-header">
                {{ $t('productsPage.advancedSearch.sampleResults') }}:
              </div>
              <div class="samples-list">
                <div
                  v-for="product in previewResults.samples"
                  :key="product.id"
                  class="sample-item"
                >
                  <div class="sample-info">
                    <div class="sample-name">{{ product.name }}</div>
                    <div class="sample-details">
                      <span v-if="product.sku" class="sample-sku">{{
                        product.sku
                      }}</span>
                      <span v-if="product.category" class="sample-category">{{
                        product.category
                      }}</span>
                      <span v-if="product.gtin" class="sample-gtin">
                        <q-icon name="qr_code_2" size="xs" />
                        {{ product.gtin }}
                      </span>
                    </div>
                  </div>
                  <div v-if="product.price" class="sample-price">
                    {{ formatPrice(product.price) }}
                  </div>
                </div>
              </div>
            </div>
          </q-slide-transition>
        </div>
      </div>
    </div>

    <template #actions>
      <q-btn flat :label="$t('common.cancel')" @click="isOpen = false" />
      <q-btn
        flat
        color="grey"
        :label="$t('productsPage.advancedSearch.reset')"
        @click="resetCriteria"
      />
      <q-btn
        color="primary"
        :label="$t('productsPage.advancedSearch.search')"
        :disable="!hasValidCriteria"
        icon="search"
        unelevated
        @click="performSearch"
      />
      <q-btn
        v-if="hasValidCriteria && previewResults.count > 0"
        flat
        color="info"
        :label="$t('productsPage.advancedSearch.previewTable')"
        icon="table_view"
        @click="$emit('preview-table')"
      />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BaseDialog from 'src/components/base/BaseDialog.vue';
  import type { ProductFilter } from 'src/types/inventory';

  // Props & Emits
  interface Props {
    modelValue: boolean;
    currentFilters: ProductFilter;
    countryOptions: Array<{ label: string; value: string }>;
    gpcOptions: Array<{ label: string; value: string }>;
    categoryOptions: Array<{ label: string; value: string }>;
    supplierOptions: Array<{ label: string; value: string }>;
    stockStatusOptions: Array<{ label: string; value: string }>;
    lifecycleOptions: Array<{ label: string; value: string }>;
    resultsCount?: number | null;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (
      e: 'search',
      criteria: ProductFilter & {
        priceMin?: number;
        priceMax?: number;
        has_gtin?: boolean;
        batch_tracked?: boolean;
        in_stock_only?: boolean;
      }
    ): void;
    (e: 'open-scanner'): void;
    (e: 'preview', criteria: any): void;
    (e: 'preview-table'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    resultsCount: null,
  });

  const emit = defineEmits<Emits>();

  // Composables
  const { t } = useI18n();

  // State
  const searchCriteria = ref({
    search: '',
    gtin: '',
    country_of_origin: '',
    gpc_brick_code: '',
    lifecycle_status: '',
    category: '',
    supplier: '',
    stock_status: '',
    sort_by: 'name' as const,
    sort_order: 'asc' as const,
    orderable_only: false,
    priceMin: null as number | null,
    priceMax: null as number | null,
    has_gtin: false,
    batch_tracked: false,
    in_stock_only: false,
  });

  const previewResults = ref({
    count: 0,
    averagePrice: null as number | null,
    inStockCount: 0,
    gtinCount: 0,
    samples: [] as Array<{
      id: string;
      name: string;
      sku?: string;
      category?: string;
      gtin?: string;
      price?: number;
    }>,
  });

  const previewExpanded = ref(false);
  const previewTimeout = ref<number | null>(null);

  // Computed
  const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  });

  const sortByOptions = computed(() => [
    { label: t('productsPage.sortBy.name'), value: 'name' },
    { label: t('productsPage.sortBy.price'), value: 'price' },
    { label: t('productsPage.sortBy.stock'), value: 'stock' },
    { label: t('productsPage.sortBy.category'), value: 'category' },
  ]);

  const sortOrderOptions = computed(() => [
    {
      label: t('productsPage.sortOrder.asc'),
      value: 'asc',
      icon: 'arrow_upward',
    },
    {
      label: t('productsPage.sortOrder.desc'),
      value: 'desc',
      icon: 'arrow_downward',
    },
  ]);

  const hasValidCriteria = computed(() => {
    return Object.values(searchCriteria.value).some(
      value => value !== '' && value !== null && value !== false
    );
  });

  const showPreview = computed(() => {
    return (
      hasValidCriteria.value &&
      (previewResults.value.count > 0 || previewResults.value.count === 0)
    );
  });

  // Format price helper
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Methods
  const resetCriteria = () => {
    searchCriteria.value = {
      search: '',
      gtin: '',
      country_of_origin: '',
      gpc_brick_code: '',
      lifecycle_status: '',
      category: '',
      supplier: '',
      stock_status: '',
      sort_by: 'name',
      sort_order: 'asc',
      orderable_only: false,
      priceMin: null,
      priceMax: null,
      has_gtin: false,
      batch_tracked: false,
      in_stock_only: false,
    };
  };

  const performSearch = () => {
    emit('search', { ...searchCriteria.value } as any);
    isOpen.value = false;
  };

  // Watch for criteria changes to show preview
  watch(
    searchCriteria,
    newCriteria => {
      if (hasValidCriteria.value) {
        // Debounce preview requests
        if (previewTimeout.value) {
          clearTimeout(previewTimeout.value);
        }

        previewTimeout.value = window.setTimeout(() => {
          emit('preview', newCriteria);
        }, 300);
      } else {
        // Clear preview when no criteria
        previewResults.value = {
          count: 0,
          averagePrice: null,
          inStockCount: 0,
          gtinCount: 0,
          samples: [],
        };
      }
    },
    { deep: true }
  );

  // Update preview results when results count changes
  watch(
    () => props.resultsCount,
    newCount => {
      if (newCount !== null) {
        previewResults.value.count = newCount;
      }
    }
  );

  // Initialize with current filters
  watch(
    () => props.currentFilters,
    newFilters => {
      if (newFilters) {
        Object.assign(searchCriteria.value, newFilters);
      }
    },
    { immediate: true }
  );
</script>

<style lang="scss" scoped>
  // Dialog styling is handled by BaseDialog

  .advanced-search-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-6);

    .search-section {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      border: 1px solid var(--border-primary);
      box-shadow: var(--shadow-sm);

      .section-title {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--space-4) 0;
        color: var(--brand-primary);
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--border-primary);
        padding-bottom: var(--space-3);
      }
    }

    .search-row {
      display: flex;
      gap: 1rem;

      .search-input {
        flex: 1;
      }
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;

      .search-input {
        width: 100%;
      }
    }

    .price-range-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 400px;

      .price-input {
        flex: 1;
      }

      .price-separator {
        color: rgba(0, 0, 0, 0.6);
        font-weight: 500;
        font-size: 1.1rem;
      }
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;

      .option-toggle {
        justify-self: start;
      }
    }

    .sorting-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 500px;

      .sort-select {
        flex: 1;
      }

      .sort-toggle {
        border-radius: 6px;
      }
    }

    .results-preview {
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.02);

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .preview-title {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--q-primary);
        }
      }

      .preview-content {
        .preview-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          margin-bottom: 1rem;

          .preview-metrics {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
        }

        .preview-samples {
          .samples-header {
            font-size: 0.85rem;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.7);
            margin-bottom: 0.5rem;
          }

          .samples-list {
            .sample-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem;
              margin-bottom: 0.5rem;
              background: white;
              border-radius: 6px;
              border: 1px solid rgba(0, 0, 0, 0.08);

              &:last-child {
                margin-bottom: 0;
              }

              .sample-info {
                flex: 1;

                .sample-name {
                  font-size: 0.9rem;
                  font-weight: 500;
                  margin-bottom: 0.25rem;
                }

                .sample-details {
                  display: flex;
                  gap: 0.5rem;
                  font-size: 0.75rem;
                  color: rgba(0, 0, 0, 0.6);

                  .sample-sku {
                    background: rgba(0, 0, 0, 0.1);
                    padding: 0.1rem 0.4rem;
                    border-radius: 3px;
                    font-family: monospace;
                  }

                  .sample-category {
                    color: var(--q-amber);
                  }

                  .sample-gtin {
                    color: var(--q-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                  }
                }
              }

              .sample-price {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--q-primary);
              }
            }
          }
        }
      }
    }
  }

  // Mobile responsiveness
  @media (max-width: 768px) {
    .advanced-search-dialog {
      .advanced-search-card {
        min-width: 95vw;
        max-width: 95vw;
        margin: 1rem;
      }
    }

    .advanced-search-content {
      .search-grid {
        grid-template-columns: 1fr;
      }

      .price-range-section {
        flex-direction: column;
        align-items: stretch;
        max-width: none;

        .price-separator {
          text-align: center;
        }
      }

      .sorting-section {
        flex-direction: column;
        align-items: stretch;
        max-width: none;
      }

      .options-grid {
        grid-template-columns: 1fr;

        .option-toggle {
          justify-self: stretch;
        }
      }
    }
  }
</style>
