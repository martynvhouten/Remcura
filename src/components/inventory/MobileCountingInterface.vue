<template>
  <div class="mobile-counting" :class="{ 'fullscreen-mode': isFullscreen }">
    <!-- Method Selection Screen -->
    <Transition name="fade" mode="out-in">
      <div
        v-if="currentStep === 'method-selection'"
        class="method-selection-screen"
      >
        <div class="method-header">
          <div class="header-content">
            <q-btn
              round
              flat
              icon="close"
              color="white"
              size="md"
              @click="$emit('close')"
            />
            <div class="session-info">
              <h1 class="main-title">{{ $t('counting.title') }}</h1>
              <p class="session-subtitle">
                {{ totalProducts }}
                {{ $t('counting.totalProducts').toLowerCase() }}
              </p>
            </div>
            <q-btn
              round
              flat
              :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              color="white"
              size="md"
              @click="toggleFullscreen"
            />
          </div>
        </div>

        <div class="method-content">
          <div class="method-selection">
            <div class="selection-header">
              <h2>{{ $t('counting.method.title') }}</h2>
              <p>{{ $t('counting.method.subtitle') }}</p>
            </div>

            <div class="method-options">
              <q-card
                class="method-option cursor-pointer"
                :class="{ selected: selectedMethod === 'scan' }"
                @click="selectMethod('scan')"
              >
                <div class="method-icon scan-icon">
                  <q-icon name="qr_code_scanner" />
                </div>
                <div class="method-info">
                  <h3>{{ $t('counting.method.scan') }}</h3>
                  <p>{{ $t('counting.method.scanDescription') }}</p>
                </div>
                <div class="method-indicator">
                  <q-icon
                    v-if="selectedMethod !== 'scan'"
                    name="radio_button_unchecked"
                  />
                  <q-icon v-else name="check_circle" />
                </div>
              </q-card>

              <q-card
                class="method-option cursor-pointer"
                :class="{ selected: selectedMethod === 'manual' }"
                @click="selectMethod('manual')"
              >
                <div class="method-icon manual-icon">
                  <q-icon name="edit" />
                </div>
                <div class="method-info">
                  <h3>{{ $t('counting.method.manual') }}</h3>
                  <p>{{ $t('counting.method.manualDescription') }}</p>
                </div>
                <div class="method-indicator">
                  <q-icon
                    v-if="selectedMethod !== 'manual'"
                    name="radio_button_unchecked"
                  />
                  <q-icon v-else name="check_circle" />
                </div>
              </q-card>
            </div>

            <div class="method-actions">
              <q-btn
                :disable="!selectedMethod"
                color="primary"
                size="lg"
                class="full-width"
                no-caps
                @click="startCounting"
              >
                <q-icon name="arrow_forward" class="q-mr-sm" />
                {{ $t('counting.method.continue') }}
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Product Counting Flow -->
    <Transition name="slide-up" mode="out-in">
      <div v-if="currentStep === 'counting'" class="counting-flow">
        <!-- Progress Header -->
        <div class="counting-header">
          <div class="header-background"></div>
          <div class="header-content">
            <q-btn
              round
              flat
              icon="arrow_back"
              color="white"
              size="md"
              @click="goBack"
            />

            <div class="progress-info">
              <div class="progress-text">
                {{
                  $t('counting.productFlow.progressOf', {
                    current: currentProductIndex + 1,
                    total: totalProducts,
                  })
                }}
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: progressPercentage + '%' }"
                ></div>
              </div>
            </div>

            <button class="fullscreen-btn" @click="toggleFullscreen">
              <q-icon :name="isFullscreen ? 'fullscreen_exit' : 'fullscreen'" />
            </button>
          </div>
        </div>

        <!-- Scanner Mode -->
        <div v-if="selectedMethod === 'scan'" class="scanner-mode">
          <div v-if="!showProductInput" class="scanner-interface">
            <div class="scanner-status">
              <h3>{{ $t('counting.scanner.scanning') }}</h3>
              <p>{{ $t('counting.scanner.placeBarcode') }}</p>
            </div>

            <div class="camera-container">
              <video
                ref="videoElement"
                autoplay
                playsinline
                class="camera-video"
                @loadedmetadata="onVideoLoaded"
              ></video>

              <div class="scan-overlay">
                <div class="scan-frame">
                  <div class="frame-corners">
                    <div class="corner corner-tl"></div>
                    <div class="corner corner-tr"></div>
                    <div class="corner corner-bl"></div>
                    <div class="corner corner-br"></div>
                  </div>
                  <div class="scan-line"></div>
                </div>
              </div>

              <!-- Camera Controls -->
              <div class="camera-controls">
                <button
                  v-if="canSwitchCamera"
                  class="camera-control-btn"
                  @click="switchCamera"
                >
                  <q-icon name="flip_camera_android" />
                </button>
                <button
                  v-if="hasFlash"
                  :class="['camera-control-btn', { active: flashEnabled }]"
                  @click="toggleFlash"
                >
                  <q-icon :name="flashEnabled ? 'flash_off' : 'flash_on'" />
                </button>
              </div>
            </div>

            <div class="scanner-actions">
              <button class="switch-method-btn" @click="switchToManual">
                <q-icon name="edit" />
                <span>{{ $t('counting.scanner.switchToManual') }}</span>
              </button>
            </div>
          </div>

          <!-- Product Input (after scan) -->
          <Transition name="slide-up">
            <div v-if="showProductInput" class="product-input-container">
              <ProductCountingCard
                :product="currentProduct"
                :method="selectedMethod"
                :current-stock="currentStock"
                :is-loading="submitting"
                @confirm="confirmCount"
                @skip="skipProduct"
                @cancel="showProductInput = false"
              />
            </div>
          </Transition>
        </div>

        <!-- Manual Mode -->
        <div v-if="selectedMethod === 'manual'" class="manual-mode">
          <ProductCountingCard
            :product="currentProduct"
            :method="selectedMethod"
            :current-stock="currentStock"
            :is-loading="submitting"
            @confirm="confirmCount"
            @skip="skipProduct"
          />
        </div>
      </div>
    </Transition>

    <!-- Completion Screen -->
    <Transition name="fade" mode="out-in">
      <div v-if="currentStep === 'complete'" class="completion-screen">
        <div class="completion-content">
          <div class="completion-icon">
            <q-icon name="check_circle" />
          </div>
          <h2>{{ $t('counting.productFlow.allComplete') }}</h2>
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-value">{{ countedProducts }}</span>
              <span class="stat-label">{{
                $t('counting.countedProducts')
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ discrepancies }}</span>
              <span class="stat-label">{{ $t('counting.discrepancies') }}</span>
            </div>
          </div>

          <div class="completion-actions">
            <button class="complete-btn" @click="$emit('session-complete')">
              <q-icon name="check" />
              <span>{{ $t('counting.completeSession') }}</span>
            </button>
            <button class="restart-btn" @click="restartCounting">
              <q-icon name="refresh" />
              <span>{{ $t('common.restart') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { useInventoryStore } from '@/stores/inventory';
  import ProductCountingCard from './ProductCountingCard.vue';

  // Types
  interface Product {
    id: string;
    name: string;
    sku: string;
    current_stock?: number;
    minimum_stock?: number;
    maximum_stock?: number;
    barcode?: string;
    gtin?: string;
    image_url?: string;
  }

  interface CountEntry {
    id: string;
    productName: string;
    oldStock: number;
    newStock: number;
    variance: number;
    timestamp: Date;
  }

  type CountingMethod = 'scan' | 'manual';
  type CountingStep = 'method-selection' | 'counting' | 'complete';

  // Props
  interface Props {
    locationId?: string;
    practiceId?: string;
    session?: unknown;
    products?: Product[];
  }

  const props = defineProps<Props>();

  // Emits
  const emit = defineEmits<{
    close: [];
    'product-counted': [];
    'session-complete': [];
  }>();

  // Composables
  const $q = useQuasar();
  const { t } = useI18n();
  const inventoryStore = useInventoryStore();

  // State
  const currentStep = ref<CountingStep>('method-selection');
  const selectedMethod = ref<CountingMethod | null>(null);
  const isFullscreen = ref(false);
  const currentProductIndex = ref(0);
  const showProductInput = ref(false);
  const submitting = ref(false);

  // Camera state
  const videoElement = ref<HTMLVideoElement | null>(null);
  const currentStream = ref<MediaStream | null>(null);
  const canSwitchCamera = ref(false);
  const hasFlash = ref(false);
  const flashEnabled = ref(false);
  const currentFacingMode = ref<'user' | 'environment'>('environment');
  const scanInterval = ref<number | null>(null);

  // Data
  const productsList = ref<Product[]>(props.products ?? []);
  const recentCounts = ref<CountEntry[]>([]);

  // Barcode Detection
  type BarcodeDetectionResult = { rawValue: string };
  interface BarcodeDetectorInstance {
    detect: (video: HTMLVideoElement) => Promise<BarcodeDetectionResult[]>;
  }
  interface BarcodeDetectorConstructor {
    new (): BarcodeDetectorInstance;
  }

  let barcodeDetector: BarcodeDetectorInstance | null = null;

  // Computed
  const totalProducts = computed(() => productsList.value.length);
  const countedProducts = computed(() => recentCounts.value.length);
  const discrepancies = computed(
    () => recentCounts.value.filter(c => c.variance !== 0).length
  );

  const progressPercentage = computed(() => {
    if (totalProducts.value === 0) return 0;
    return (currentProductIndex.value / totalProducts.value) * 100;
  });

  const currentProduct = computed(() => {
    if (currentProductIndex.value >= productsList.value.length) return null;
    return productsList.value[currentProductIndex.value];
  });

  const currentStock = computed(() => {
    if (!currentProduct.value) return 0;
    return currentProduct.value.current_stock || 0;
  });

  // Methods
  const selectMethod = (method: CountingMethod) => {
    selectedMethod.value = method;
  };

  const startCounting = async () => {
    if (!selectedMethod.value) return;

    currentStep.value = 'counting';

    // Initialize camera for scan mode
    if (selectedMethod.value === 'scan') {
      await startCamera();
    }
  };

  const goBack = () => {
    if (currentStep.value === 'counting') {
      stopCamera();
      currentStep.value = 'method-selection';
      currentProductIndex.value = 0;
      showProductInput.value = false;
    }
  };

  const switchToManual = () => {
    selectedMethod.value = 'manual';
    stopCamera();
    showProductInput.value = false;
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen.value) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error);
    }
  };

  // Camera Methods
  const startCamera = async () => {
    try {
      if (currentStream.value) {
        await stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode.value,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      currentStream.value = stream;
      if (videoElement.value) {
        videoElement.value.srcObject = stream;
      }

      // Initialize camera capabilities
      canSwitchCamera.value = await checkMultipleCameras();
      hasFlash.value = await checkFlashSupport();

      // Initialize barcode detection
      if ('BarcodeDetector' in window) {
        const Detector = (
          window as { BarcodeDetector?: BarcodeDetectorConstructor }
        ).BarcodeDetector;

        if (Detector) {
          barcodeDetector = new Detector();
          startScanning();
        }
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      $q.notify({
        type: 'negative',
        message: t('common.error'),
        caption: 'Camera toegang geweigerd',
      });
    }
  };

  const stopCamera = async () => {
    if (scanInterval.value) {
      clearInterval(scanInterval.value);
      scanInterval.value = null;
    }

    if (currentStream.value) {
      currentStream.value.getTracks().forEach(track => track.stop());
      currentStream.value = null;
    }

    if (videoElement.value) {
      videoElement.value.srcObject = null;
    }
  };

  const switchCamera = async () => {
    if (!canSwitchCamera.value) return;

    currentFacingMode.value =
      currentFacingMode.value === 'user' ? 'environment' : 'user';
    await stopCamera();
    await startCamera();
  };

  const toggleFlash = async () => {
    if (!hasFlash.value || !currentStream.value) return;

    try {
      const videoTrack = currentStream.value.getVideoTracks()[0];
      if (videoTrack) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashEnabled.value } as any], // torch is not standard
        });
        flashEnabled.value = !flashEnabled.value;
      }
    } catch (err) {
      console.warn('Flash toggle failed:', err);
    }
  };

  const checkMultipleCameras = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        device => device.kind === 'videoinput'
      );
      return videoDevices.length > 1;
    } catch {
      return false;
    }
  };

  const checkFlashSupport = async (): Promise<boolean> => {
    try {
      const stream = currentStream.value;
      if (!stream) return false;

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return false;
      
      const capabilities = videoTrack.getCapabilities();
      return 'torch' in capabilities;
    } catch {
      return false;
    }
  };

  const startScanning = () => {
    if (!barcodeDetector || scanInterval.value) return;

    scanInterval.value = window.setInterval(async () => {
      if (!videoElement.value || currentStep.value !== 'counting' || !barcodeDetector) return;

      try {
        const barcodes = await barcodeDetector.detect(videoElement.value);
        if (barcodes.length > 0 && barcodes[0]) {
          const barcode = barcodes[0].rawValue;
          await handleBarcodeScan(barcode);
        }
      } catch (error) {
        // Silently ignore scanning errors
      }
    }, 1000);
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      // Find product by barcode
      const foundProduct = productsList.value.find(
        p => p.barcode === barcode || p.gtin === barcode || p.sku === barcode
      );

      if (foundProduct) {
        // Set current product index
        const productIndex = productsList.value.findIndex(
          p => p.id === foundProduct.id
        );
        if (productIndex !== -1) {
          currentProductIndex.value = productIndex;
          showProductInput.value = true;

          $q.notify({
            type: 'positive',
            message: t('counting.scanner.productFound'),
            caption: foundProduct.name,
            timeout: 2000,
          });
        }
      } else {
        $q.notify({
          type: 'warning',
          message: t('counting.scanner.productNotFound'),
          caption: `Barcode: ${barcode}`,
          timeout: 3000,
        });
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('counting.productFlow.error'),
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    }
  };

  // Product Flow Methods
  const confirmCount = async (count: number) => {
    if (!currentProduct.value) return;

    try {
      submitting.value = true;

      const oldStock = currentStock.value;
      const variance = count - oldStock;

      // Add to recent counts
      recentCounts.value.push({
        id: currentProduct.value.id,
        productName: currentProduct.value.name,
        oldStock,
        newStock: count,
        variance,
        timestamp: new Date(),
      });

      $q.notify({
        type: 'positive',
        message: t('counting.productFlow.saved'),
        timeout: 1500,
      });

      // Emit event
      emit('product-counted');

      // Move to next product
      await nextProduct();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('counting.productFlow.error'),
        caption: error instanceof Error ? error.message : 'Onbekende fout',
      });
    } finally {
      submitting.value = false;
    }
  };

  const skipProduct = async () => {
    await nextProduct();
  };

  const nextProduct = async () => {
    showProductInput.value = false;

    // Optimized transition - shorter wait time
    await nextTick();

    if (currentProductIndex.value >= totalProducts.value - 1) {
      // All products counted
      currentStep.value = 'complete';
      stopCamera();
    } else {
      // Move to next product with immediate update
      currentProductIndex.value++;

      // Reset for scan mode without delay
      if (selectedMethod.value === 'scan') {
        showProductInput.value = false;
      }
    }
  };

  const restartCounting = () => {
    currentStep.value = 'method-selection';
    currentProductIndex.value = 0;
    selectedMethod.value = null;
    showProductInput.value = false;
    recentCounts.value = [];
  };

  const onVideoLoaded = () => {
    // Video loaded successfully
  };

  // Lifecycle
  onMounted(async () => {
    // Load initial data
    if (props.practiceId) {
      await inventoryStore.refreshData(props.practiceId);
    }

    // Initialize products list
    if (!props.products || props.products.length === 0) {
      productsList.value = inventoryStore.stockLevels.map(stock => ({
        id: stock.productId,
        name: stock.productName ?? 'Onbekend product',
        sku: stock.productName ?? '', // SKU not available on stock level view
        current_stock: stock.currentQuantity ?? 0,
        minimum_stock: stock.minimumQuantity ?? 0,
        maximum_stock: stock.maximumQuantity ?? 100,
        barcode: undefined, // Barcode not available on stock level view
        gtin: undefined,
        image_url: undefined,
      }));
    }

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      isFullscreen.value = !!document.fullscreenElement;
    });
  });

  onUnmounted(() => {
    stopCamera();
    document.removeEventListener('fullscreenchange', () => {});
  });

  // Watch for method changes
  watch(selectedMethod, newMethod => {
    if (newMethod === 'manual') {
      stopCamera();
    }
  });
</script>

<style lang="scss" scoped>
  .mobile-counting {
    height: 100vh;
    max-height: 100vh;
    background: var(--bg-primary);
    background-image: linear-gradient(
      135deg,
      var(--brand-primary),
      var(--brand-primary-light)
    );
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    &.fullscreen-mode {
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
    }
  }

  // Method Selection Screen
  .method-selection-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .method-header {
    padding: 1.5rem 1rem;
    color: white;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;

      // Header buttons are now q-btn components

      .session-info {
        text-align: center;
        flex: 1;

        .main-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: var(--font-weight-bold);
          margin-bottom: 0.25rem;
          color: white;
          font-family: var(--font-family);
        }

        .session-subtitle {
          margin: 0;
          font-size: 1rem;
          opacity: 0.9;
          font-weight: var(--font-weight-medium);
          color: white;
        }
      }
    }
  }

  .method-content {
    flex: 1;
    padding: 2rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .method-selection {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    box-shadow: var(--shadow-xl);

    .selection-header {
      text-align: center;
      margin-bottom: 2rem;

      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        font-family: var(--font-family);
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 1rem;
      }
    }

    .method-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;

      .method-option {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        border: 2px solid var(--border-primary);
        border-radius: var(--radius-base);
        background: var(--bg-primary);
        cursor: pointer;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;
        text-align: left;
        width: 100%;

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        &.selected {
          border-color: var(--brand-primary);
          background: var(--bg-primary);
          box-shadow: var(--shadow-lg);

          .method-icon {
            background: var(--brand-primary);
            color: white;
          }

          .method-indicator {
            color: var(--brand-primary);
          }
        }

        .method-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-base);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition:
            background-color 0.2s ease,
            color 0.2s ease;
          flex-shrink: 0;
        }

        .method-info {
          flex: 1;

          h3 {
            margin: 0 0 0.25rem 0;
            font-size: 1.1rem;
            font-weight: var(--font-weight-semibold);
            color: var(--text-primary);
          }

          p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
          }
        }

        .method-indicator {
          font-size: 24px;
          color: var(--text-tertiary);
          transition: color 0.2s ease;
        }
      }
    }

    .method-actions {
      display: flex;
      justify-content: center;
    }
  }

  // Counting Flow
  .counting-flow {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .counting-header {
    position: relative;
    padding: 1.5rem 1rem;
    color: white;

    .header-background {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(20px);
    }

    .header-content {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;

      .back-btn,
      .fullscreen-btn {
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }
      }

      .progress-info {
        text-align: center;
        flex: 1;

        .progress-text {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          width: 200px;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
          margin: 0 auto;

          .progress-fill {
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            transition: width 0.3s ease;
          }
        }
      }
    }
  }

  // Scanner Mode
  .scanner-mode {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .scanner-interface {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;

    .scanner-status {
      text-align: center;
      color: white;
      margin-bottom: 1rem;

      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      p {
        margin: 0;
        opacity: 0.8;
        font-size: 1rem;
      }
    }

    .camera-container {
      flex: 1;
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      background: #000;
      margin-bottom: 1rem;
      min-height: 400px;

      .camera-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .scan-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .scan-frame {
        position: relative;
        width: 280px;
        height: 280px;

        .frame-corners {
          position: absolute;
          inset: 0;

          .corner {
            position: absolute;
            width: 40px;
            height: 40px;
            border: 3px solid #00ff88;

            &.corner-tl {
              top: 0;
              left: 0;
              border-right: none;
              border-bottom: none;
              border-radius: 12px 0 0 0;
            }

            &.corner-tr {
              top: 0;
              right: 0;
              border-left: none;
              border-bottom: none;
              border-radius: 0 12px 0 0;
            }

            &.corner-bl {
              bottom: 0;
              left: 0;
              border-right: none;
              border-top: none;
              border-radius: 0 0 0 12px;
            }

            &.corner-br {
              bottom: 0;
              right: 0;
              border-left: none;
              border-top: none;
              border-radius: 0 0 12px 0;
            }
          }
        }

        .scan-line {
          position: absolute;
          top: 50%;
          left: 20px;
          right: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ff88, transparent);
          animation: scanning 2s ease-in-out infinite;
        }
      }

      .camera-controls {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.75rem;

        .camera-control-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);

          &:hover {
            background: rgba(0, 0, 0, 0.8);
            transform: scale(1.1);
          }

          &.active {
            background: #00ff88;
            color: #000;
          }
        }
      }
    }

    .scanner-actions {
      .switch-method-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        width: 100%;
        padding: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }

  .product-input-container {
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  // Manual Mode
  .manual-mode {
    flex: 1;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
  }

  // Completion Screen
  .completion-screen {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
  }

  .completion-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 3rem 2rem;
    text-align: center;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

    .completion-icon {
      font-size: 80px;
      color: #10b981;
      margin-bottom: 1.5rem;
    }

    h2 {
      margin: 0 0 2rem 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a202c;
    }

    .completion-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;

      .stat-item {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: #1a202c;
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
      }
    }

    .completion-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .complete-btn,
      .restart-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 56px;
      }

      .complete-btn {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }
      }

      .restart-btn {
        background: var(--color-surface-secondary);
        color: #64748b;
        border: 2px solid #e2e8f0;

        &:hover {
          background: var(--bg-tertiary);
          border-color: #cbd5e0;
        }
      }
    }
  }

  // Animations - GPU optimized
  @keyframes scanning {
    0%,
    100% {
      opacity: 0;
      transform: translateY(-50%) scaleX(0) translateZ(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-50%) scaleX(1) translateZ(0);
    }
  }

  // Transitions - Performance optimized
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
    will-change: opacity;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
    will-change: transform, opacity;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(20px) translateZ(0);
  }

  // Responsive Design
  @media (max-width: 768px) {
    .method-selection {
      padding: 1.5rem;
      margin: 1rem;

      .method-options .method-option {
        padding: 1rem;

        .method-icon {
          width: 48px;
          height: 48px;
          font-size: 20px;
        }

        .method-info h3 {
          font-size: 1rem;
        }

        .method-info p {
          font-size: 0.85rem;
        }
      }
    }

    .completion-content {
      padding: 2rem 1.5rem;

      .completion-stats {
        gap: 1.5rem;

        .stat-item .stat-value {
          font-size: 1.5rem;
        }
      }

      .completion-actions {
        .complete-btn,
        .restart-btn {
          padding: 0.875rem 1.25rem;
        }
      }
    }

    .counting-header .header-content .progress-info .progress-bar {
      width: 150px;
    }
  }

  // Dark mode support
  @media (prefers-color-scheme: dark) {
    .method-selection,
    .completion-content {
      background: rgba(45, 55, 72, 0.95);

      h2,
      h3 {
        color: #f7fafc;
      }

      .method-option {
        background: rgba(45, 55, 72, 0.8);
        border-color: rgba(255, 255, 255, 0.1);

        &.selected {
          background: rgba(102, 126, 234, 0.2);
        }
      }
    }
  }
</style>
