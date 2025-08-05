<template>
  <div class="mobile-counting-interface">
    <!-- Header with current session info -->
    <div class="counting-header q-pa-md bg-primary text-white">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <div class="text-h6">📱 Mobiele Telling</div>
          <div class="text-caption">{{ currentLocation?.name || 'Alle locaties' }}</div>
        </div>
        <div class="col-auto text-right">
          <div class="text-subtitle2">{{ countedItems }} / {{ totalItems }}</div>
          <div class="text-caption">Geteld</div>
        </div>
      </div>
    </div>

    <!-- Scanner Section -->
    <div class="scanner-section q-pa-md">
      <div class="row q-gutter-sm">
        <!-- Barcode Scanner Button -->
        <div class="col">
          <q-btn
            @click="startScanning"
            :loading="isScanning"
            color="primary"
            size="lg"
            class="full-width"
            icon="qr_code_scanner"
            :label="isScanning ? 'Scannen...' : 'Scan Barcode'"
          />
        </div>
        
        <!-- Manual Search Button -->
        <div class="col-auto">
          <q-btn
            @click="showSearchDialog = true"
            color="secondary"
            size="lg"
            icon="search"
            round
          />
        </div>
      </div>

      <!-- Last scanned item display -->
      <div v-if="lastScannedItem" class="q-mt-md">
        <q-card class="bg-green-1 border-green">
          <q-card-section class="q-py-sm">
            <div class="text-caption text-green-8">Laatst gescand:</div>
            <div class="text-subtitle2">{{ lastScannedItem.name }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Barcode Scanner -->
      <BarcodeScanner
        v-if="isScanning"
        @scan="handleBarcodeScan"
        @close="stopScanning"
        class="q-mt-md"
      />
    </div>

    <!-- Quick Count Interface -->
    <div v-if="selectedProduct" class="count-interface q-pa-md bg-grey-1">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ selectedProduct.name }}</div>
          <div class="text-caption text-grey-6">SKU: {{ selectedProduct.sku }}</div>
          
          <!-- Current stock display -->
          <div class="row items-center q-mt-md">
            <div class="col-auto">
              <div class="text-caption">Huidige voorraad:</div>
              <div class="text-h4 text-primary">{{ currentStock }}</div>
            </div>
            <div class="col text-right">
              <div class="text-caption">Min: {{ selectedProduct.minimum_stock || 0 }}</div>
              <div class="text-caption">Max: {{ selectedProduct.maximum_stock || 100 }}</div>
            </div>
          </div>

          <!-- Stock level indicator -->
          <div class="q-mt-sm">
            <q-linear-progress
              :value="stockPercentage"
              :color="stockColor"
              size="10px"
              class="q-mt-xs"
            />
            <div class="text-center text-caption q-mt-xs">
              {{ stockStatusText }}
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Count input with large buttons -->
          <div class="count-controls">
            <div class="row q-gutter-sm items-center">
              <!-- Decrease buttons -->
              <q-btn
                @click="adjustCount(-10)"
                color="negative"
                icon="remove"
                label="-10"
                size="md"
                class="col-auto"
              />
              <q-btn
                @click="adjustCount(-1)"
                color="negative"
                icon="remove"
                size="lg"
                round
                class="col-auto"
              />
              
              <!-- Current count input -->
              <div class="col text-center">
                <q-input
                  v-model.number="newCount"
                  type="number"
                  outlined
                  dense
                  class="count-input"
                  style="max-width: 100px; margin: 0 auto;"
                  @keyup.enter="confirmCount"
                  input-style="text-align: center; font-size: 18px; font-weight: bold;"
                />
              </div>
              
              <!-- Increase buttons -->
              <q-btn
                @click="adjustCount(1)"
                color="positive"
                icon="add"
                size="lg"
                round
                class="col-auto"
              />
              <q-btn
                @click="adjustCount(10)"
                color="positive"
                icon="add"
                label="+10"
                size="md"
                class="col-auto"
              />
            </div>

            <!-- Quick preset buttons -->
            <div class="row q-gutter-xs q-mt-md">
              <q-btn
                v-for="preset in quickPresets"
                :key="preset"
                @click="setCount(preset)"
                :label="preset.toString()"
                color="grey-5"
                size="sm"
                class="col"
              />
            </div>

            <!-- Action buttons -->
            <div class="row q-gutter-sm q-mt-lg">
              <q-btn
                @click="confirmCount"
                color="primary"
                icon="check"
                label="Bevestigen"
                size="lg"
                class="col"
                :disable="newCount < 0"
              />
              <q-btn
                @click="skipProduct"
                color="grey"
                icon="skip_next"
                label="Overslaan"
                size="lg"
                class="col"
                outline
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Progress & Summary -->
    <div class="progress-section q-pa-md">
      <div class="row q-gutter-md">
        <!-- Progress Card -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section class="text-center">
              <q-circular-progress
                :value="progressPercentage"
                size="80px"
                :thickness="0.15"
                color="primary"
                track-color="grey-3"
                class="q-ma-md"
                show-value
              >
                {{ Math.round(progressPercentage) }}%
              </q-circular-progress>
              <div class="text-subtitle2">Voortgang</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quick Stats -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Statistieken</div>
              <div class="row q-gutter-sm">
                <div class="col text-center">
                  <div class="text-h6 text-positive">{{ itemsInStock }}</div>
                  <div class="text-caption">Op voorraad</div>
                </div>
                <div class="col text-center">
                  <div class="text-h6 text-warning">{{ itemsLowStock }}</div>
                  <div class="text-caption">Laag</div>
                </div>
                <div class="col text-center">
                  <div class="text-h6 text-negative">{{ itemsOutOfStock }}</div>
                  <div class="text-caption">Uitverkocht</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Recent activity -->
    <div class="recent-activity q-pa-md" v-if="recentCounts.length > 0">
      <div class="text-subtitle2 q-mb-sm">🕒 Recente tellingen</div>
      <q-list dense>
        <q-item
          v-for="count in recentCounts.slice(0, 5)"
          :key="count.id"
          class="q-pa-sm"
        >
          <q-item-section avatar>
            <q-icon
              :name="count.variance > 0 ? 'trending_up' : count.variance < 0 ? 'trending_down' : 'remove'"
              :color="count.variance > 0 ? 'positive' : count.variance < 0 ? 'negative' : 'grey'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ count.productName }}</q-item-label>
            <q-item-label caption>
              {{ count.oldStock }} → {{ count.newStock }}
              <span v-if="count.variance !== 0" :class="`text-${count.variance > 0 ? 'positive' : 'negative'}`">
                ({{ count.variance > 0 ? '+' : '' }}{{ count.variance }})
              </span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label caption>{{ formatTime(count.timestamp) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Product Search Dialog -->
    <q-dialog v-model="showSearchDialog" position="top">
      <q-card style="width: 350px; max-width: 90vw;">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Product zoeken</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="searchQuery"
            label="Zoek product..."
            outlined
            dense
            autofocus
            @keyup.enter="searchProducts"
            clearable
          >
            <template v-slot:append>
              <q-btn
                @click="searchProducts"
                icon="search"
                color="primary"
                flat
                dense
                round
              />
            </template>
          </q-input>

          <!-- Search results -->
          <div v-if="searchResults.length > 0" class="q-mt-md">
            <q-list dense>
              <q-item
                v-for="product in searchResults"
                :key="product.id"
                clickable
                @click="selectProductFromSearch(product)"
                class="q-pa-sm"
              >
                <q-item-section>
                  <q-item-label>{{ product.name }}</q-item-label>
                  <q-item-label caption>{{ product.sku }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge
                    :color="getStockBadgeColor(product.current_stock, product.minimum_stock)"
                    :label="product.current_stock || 0"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Sluiten" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Completion Dialog -->
    <q-dialog v-model="showCompletionDialog" persistent>
      <q-card>
        <q-card-section class="text-center q-pa-lg">
          <q-icon name="check_circle" size="64px" color="positive" />
          <div class="text-h5 q-mt-md">Telling voltooid! 🎉</div>
          <div class="text-body1 q-mt-sm">
            Je hebt {{ countedItems }} producten geteld
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col text-center">
              <div class="text-h6 text-positive">{{ itemsInStock }}</div>
              <div class="text-caption">Op voorraad</div>
            </div>
            <div class="col text-center">
              <div class="text-h6 text-warning">{{ itemsLowStock }}</div>
              <div class="text-caption">Laag</div>
            </div>
            <div class="col text-center">
              <div class="text-h6 text-negative">{{ itemsOutOfStock }}</div>
              <div class="text-caption">Uitverkocht</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-lg">
          <q-btn
            @click="startNewCounting"
            label="Nieuwe telling"
            color="primary"
            size="lg"
            icon="refresh"
            class="q-mr-sm"
          />
          <q-btn
            @click="finishCounting"
            label="Afsluiten"
            color="grey"
            size="lg"
            outline
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '@/stores/inventory';
import BarcodeScanner from '@/components/BarcodeScanner.vue';

interface Product {
  id: string;
  name: string;
  sku: string;
  current_stock?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  barcode?: string;
  gtin?: string;
}

interface CountEntry {
  id: string;
  productName: string;
  oldStock: number;
  newStock: number;
  variance: number;
  timestamp: Date;
}

const $q = useQuasar();
const router = useRouter();
const inventoryStore = useInventoryStore();

// State
const isScanning = ref(false);
const selectedProduct = ref<Product | null>(null);
const currentStock = ref(0);
const newCount = ref(0);
const lastScannedItem = ref<Product | null>(null);
const showSearchDialog = ref(false);
const showCompletionDialog = ref(false);
const searchQuery = ref('');
const searchResults = ref<Product[]>([]);
const recentCounts = ref<CountEntry[]>([]);

const currentLocation = ref<any>(null);

// Props (could be passed from parent component)
const props = defineProps<{
  locationId?: string;
  practiceId?: string;
}>();

// Computed properties
const totalItems = computed(() => inventoryStore.stockLevels.length);
const countedItems = computed(() => recentCounts.value.length);

const progressPercentage = computed(() => {
  if (totalItems.value === 0) return 0;
  return (countedItems.value / totalItems.value) * 100;
});

const stockPercentage = computed(() => {
  if (!selectedProduct.value) return 0;
  const max = selectedProduct.value.maximum_stock || 100;
  return Math.min((currentStock.value / max) * 100, 100);
});

const stockColor = computed(() => {
  if (!selectedProduct.value) return 'grey';
  const min = selectedProduct.value.minimum_stock || 0;
  
  if (currentStock.value === 0) return 'negative';
  if (currentStock.value <= min) return 'warning';
  if (currentStock.value >= (selectedProduct.value.maximum_stock || 100)) return 'info';
  return 'positive';
});

const stockStatusText = computed(() => {
  if (!selectedProduct.value) return '';
  const min = selectedProduct.value.minimum_stock || 0;
  const max = selectedProduct.value.maximum_stock || 100;
  
  if (currentStock.value === 0) return 'Uitverkocht';
  if (currentStock.value <= min) return 'Onder minimum';
  if (currentStock.value >= max) return 'Boven maximum';
  return 'Binnen bereik';
});

const itemsInStock = computed(() => 
  recentCounts.value.filter(c => c.newStock > 0).length
);

const itemsLowStock = computed(() => 
  recentCounts.value.filter(c => {
    const product = inventoryStore.stockLevels.find(s => s.product_id === c.id);
    return c.newStock > 0 && c.newStock <= (product?.minimum_quantity || 0);
  }).length
);

const itemsOutOfStock = computed(() => 
  recentCounts.value.filter(c => c.newStock === 0).length
);

const quickPresets = computed(() => {
  if (!selectedProduct.value) return [0, 5, 10, 25, 50];
  
  const min = selectedProduct.value.minimum_stock || 0;
  const max = selectedProduct.value.maximum_stock || 100;
  
  return [0, Math.floor(min), Math.floor(min * 2), Math.floor(max / 2), max];
});

// Methods
const startScanning = () => {
  isScanning.value = true;
};

const stopScanning = () => {
  isScanning.value = false;
};

const handleBarcodeScan = async (barcode: string) => {
  try {
    stopScanning();
    
    // Find product by barcode/GTIN
    const product = inventoryStore.stockLevels.find(s => 
      s.product?.barcode === barcode || 
      s.product?.gtin === barcode ||
      s.product?.sku === barcode
    );

    if (product) {
      await selectProduct(product);
      lastScannedItem.value = product.product;
      
      $q.notify({
        type: 'positive',
        message: `Product gevonden: ${product.product?.name}`,
        timeout: 2000
      });
    } else {
      $q.notify({
        type: 'warning',
        message: 'Product niet gevonden',
        caption: `Barcode: ${barcode}`,
        timeout: 3000
      });
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Fout bij scannen',
      caption: error instanceof Error ? error.message : 'Onbekende fout'
    });
  }
};

const selectProduct = async (stockLevel: any) => {
  selectedProduct.value = {
    id: stockLevel.product_id,
    name: stockLevel.product?.name || 'Onbekend product',
    sku: stockLevel.product?.sku || '',
    current_stock: stockLevel.current_quantity || 0,
    minimum_stock: stockLevel.minimum_quantity || 0,
    maximum_stock: stockLevel.maximum_quantity || 100,
    barcode: stockLevel.product?.barcode,
    gtin: stockLevel.product?.gtin,
  };
  
  currentStock.value = selectedProduct.value.current_stock || 0;
  newCount.value = currentStock.value;
};

const selectProductFromSearch = (product: Product) => {
  const stockLevel = inventoryStore.stockLevels.find(s => s.product_id === product.id);
  if (stockLevel) {
    selectProduct(stockLevel);
  }
  showSearchDialog.value = false;
  searchQuery.value = '';
  searchResults.value = [];
};

const searchProducts = async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase();
  searchResults.value = inventoryStore.stockLevels
    .filter(s => 
      s.product?.name?.toLowerCase().includes(query) ||
      s.product?.sku?.toLowerCase().includes(query) ||
      s.product?.barcode?.includes(query) ||
      s.product?.gtin?.includes(query)
    )
    .map(s => ({
      id: s.product_id,
      name: s.product?.name || 'Onbekend',
      sku: s.product?.sku || '',
      current_stock: s.current_quantity || 0,
      minimum_stock: s.minimum_quantity || 0,
      maximum_stock: s.maximum_quantity || 100,
    }))
    .slice(0, 10);
};

const adjustCount = (delta: number) => {
  newCount.value = Math.max(0, newCount.value + delta);
};

const setCount = (count: number) => {
  newCount.value = count;
};

const confirmCount = async () => {
  if (!selectedProduct.value) return;

  try {
    const oldStock = currentStock.value;
    const variance = newCount.value - oldStock;

    // Update stock level via inventory store
    await inventoryStore.updateStockLevel({
      practice_id: props.practiceId || inventoryStore.currentPracticeId!,
      location_id: props.locationId || '',
      product_id: selectedProduct.value.id,
      quantity_change: variance,
      movement_type: 'count',
      reason_code: 'manual_count',
      notes: `Mobiele telling: ${oldStock} → ${newCount.value}`,
    });

    // Add to recent counts
    recentCounts.value.unshift({
      id: selectedProduct.value.id,
      productName: selectedProduct.value.name,
      oldStock,
      newStock: newCount.value,
      variance,
      timestamp: new Date(),
    });

    // Update current stock
    currentStock.value = newCount.value;
    selectedProduct.value.current_stock = newCount.value;

    $q.notify({
      type: 'positive',
      message: 'Voorraad bijgewerkt!',
      caption: `${selectedProduct.value.name}: ${oldStock} → ${newCount.value}`,
      timeout: 2000,
      actions: [
        { 
          label: 'Ongedaan maken', 
          color: 'white',
          handler: () => undoLastCount()
        }
      ]
    });

    // Clear selection to continue with next product
    selectedProduct.value = null;
    
    // Check if counting is complete
    if (countedItems.value >= totalItems.value) {
      showCompletionDialog.value = true;
    }

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Fout bij bijwerken voorraad',
      caption: error instanceof Error ? error.message : 'Onbekende fout'
    });
  }
};

const skipProduct = () => {
  selectedProduct.value = null;
};

const undoLastCount = async () => {
  const lastCount = recentCounts.value[0];
  if (!lastCount) return;

  try {
    const variance = lastCount.oldStock - lastCount.newStock;
    
    await inventoryStore.updateStockLevel({
      practice_id: props.practiceId || inventoryStore.currentPracticeId!,
      location_id: props.locationId || '',
      product_id: lastCount.id,
      quantity_change: variance,
      movement_type: 'adjustment',
      reason_code: 'undo_count',
      notes: `Ongedaan maken telling: ${lastCount.newStock} → ${lastCount.oldStock}`,
    });

    recentCounts.value.shift();

    $q.notify({
      type: 'info',
      message: 'Telling ongedaan gemaakt',
      timeout: 2000
    });

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Fout bij ongedaan maken',
      caption: error instanceof Error ? error.message : 'Onbekende fout'
    });
  }
};

const getStockBadgeColor = (currentStock: number, minStock: number) => {
  if (currentStock === 0) return 'negative';
  if (currentStock <= minStock) return 'warning';
  return 'positive';
};

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('nl-NL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const startNewCounting = () => {
  recentCounts.value = [];
  selectedProduct.value = null;
  showCompletionDialog.value = false;
};

const finishCounting = () => {
  router.push('/inventory');
};

// Lifecycle
onMounted(async () => {
  // Load initial data
  if (props.practiceId) {
    await inventoryStore.refreshData(props.practiceId);
  }

  // Set up location if provided
  if (props.locationId) {
    // Would fetch location details
  }
});

onUnmounted(() => {
  stopScanning();
});

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (newQuery.length >= 2) {
    searchProducts();
  } else {
    searchResults.value = [];
  }
});
</script>

<style scoped>
.mobile-counting-interface {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.counting-header {
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.scanner-section {
  position: relative;
}



.scanner-frame::before,
.scanner-frame::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #00ff00;
}

.scanner-frame::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.scanner-frame::after {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.scanner-instructions {
  color: white;
  font-weight: 500;
  margin-top: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.7);
}

.count-interface {
  border-radius: 20px 20px 0 0;
  background: white;
}

.count-controls {
  padding: 16px 0;
}

.count-input input {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2;
}

.progress-section {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
}

.recent-activity {
  background: white;
  border-radius: 20px 20px 0 0;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .counting-header {
    border-radius: 0;
  }
  
  .count-interface {
    border-radius: 20px 20px 0 0;
    margin-top: -10px;
  }
  
  .scanner-frame {
    width: 150px;
    height: 150px;
  }
}

/* Touch-friendly button sizes */
.q-btn {
  min-height: 48px;
}

.count-controls .q-btn {
  min-height: 56px;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .scanner-overlay {
    animation: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .mobile-counting-interface {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
  
  .progress-section {
    background: rgba(45, 55, 72, 0.8);
  }
}
</style>