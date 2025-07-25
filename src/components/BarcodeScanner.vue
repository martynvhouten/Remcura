<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="standard"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="scanner-card">
      <!-- Header -->
      <q-card-section class="scanner-header">
        <div class="header-content">
          <div class="title-section">
            <q-icon name="qr_code_scanner" size="md" color="white" class="q-mr-sm" />
            <div>
              <div class="text-h6 text-white">{{ $t('barcodeScanner.title') }}</div>
              <div class="text-caption text-white opacity-80">
                {{ $t('barcodeScanner.subtitle') }}
              </div>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            @click="closeScanner"
            :title="$t('common.close')"
          />
        </div>
      </q-card-section>

      <!-- Camera Section -->
      <q-card-section class="scanner-body">
        <!-- Camera Preview -->
        <div class="camera-container">
          <div v-if="!cameraPermission" class="permission-prompt">
            <q-icon name="camera_alt" size="4rem" color="grey-5" class="q-mb-md" />
            <div class="text-h6 q-mb-sm">{{ $t('barcodeScanner.cameraPermission') }}</div>
            <div class="text-body2 text-grey-6 q-mb-lg text-center">
              {{ $t('barcodeScanner.permissionDescription') }}
            </div>
            <q-btn
              color="primary"
              icon="camera_alt"
              :label="$t('barcodeScanner.enableCamera')"
              @click="initializeCamera"
              :loading="initializing"
            />
          </div>

          <div v-else-if="error" class="error-state">
            <q-icon name="error" size="4rem" color="negative" class="q-mb-md" />
            <div class="text-h6 q-mb-sm text-negative">{{ $t('barcodeScanner.error') }}</div>
            <div class="text-body2 text-grey-6 q-mb-lg text-center">
              {{ error }}
            </div>
            <q-btn
              color="primary"
              icon="refresh"
              :label="$t('common.retry')"
              @click="initializeCamera"
              :loading="initializing"
            />
          </div>

          <div v-else class="camera-view">
            <!-- Video Element -->
            <video
              ref="videoElement"
              autoplay
              playsinline
              muted
              class="camera-video"
              :class="{ 'camera-active': cameraActive }"
            />
            
            <!-- Scanning Overlay -->
            <div class="scanning-overlay">
              <!-- Scanning Frame -->
              <div class="scan-frame">
                <div class="scan-corners">
                  <div class="corner corner-tl"></div>
                  <div class="corner corner-tr"></div>
                  <div class="corner corner-bl"></div>
                  <div class="corner corner-br"></div>
                </div>
                <div v-if="scanning" class="scan-line"></div>
              </div>
              
              <!-- Instructions -->
              <div class="scan-instructions">
                <div class="instruction-text">
                  {{ scanning ? $t('barcodeScanner.scanning') : $t('barcodeScanner.instructions') }}
                </div>
              </div>
            </div>

            <!-- Results -->
            <div v-if="lastScanResult" class="scan-result">
              <q-chip
                :color="lastScanResult.valid ? 'positive' : 'warning'"
                :text-color="lastScanResult.valid ? 'white' : 'dark'"
                :icon="lastScanResult.valid ? 'check' : 'warning'"
                :label="lastScanResult.code"
                size="lg"
                class="result-chip"
              />
            </div>
          </div>
        </div>

        <!-- Manual Input Section -->
        <div class="manual-input-section">
          <q-expansion-item
            icon="keyboard"
            :label="$t('barcodeScanner.manualInput')"
            class="manual-input-expander"
          >
            <div class="manual-input-content">
              <q-input
                v-model="manualInput"
                :placeholder="$t('barcodeScanner.enterBarcode')"
                outlined
                dense
                clearable
                @keyup.enter="processManualInput"
                class="q-mb-md"
              >
                <template #append>
                  <q-btn
                    flat
                    dense
                    round
                    icon="send"
                    color="primary"
                    @click="processManualInput"
                    :disable="!manualInput"
                  />
                </template>
              </q-input>
              <div class="text-caption text-grey-6">
                {{ $t('barcodeScanner.manualInputHelp') }}
              </div>
            </div>
          </q-expansion-item>
        </div>
      </q-card-section>

      <!-- Footer Actions -->
      <q-card-actions class="scanner-footer">
        <q-btn
          flat
          :label="$t('common.cancel')"
          @click="closeScanner"
          class="q-mr-auto"
        />
        
        <q-btn
          v-if="cameraActive"
          flat
          icon="flip_camera_android"
          :label="$t('barcodeScanner.switchCamera')"
          @click="switchCamera"
          :disable="!canSwitchCamera"
          class="q-mr-sm"
        />
        
        <q-btn
          v-if="cameraActive"
          flat
          :icon="flashEnabled ? 'flash_off' : 'flash_on'"
          :label="flashEnabled ? $t('barcodeScanner.flashOff') : $t('barcodeScanner.flashOn')"
          @click="toggleFlash"
          :disable="!hasFlash"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

// Types
interface ScanResult {
  code: string;
  valid: boolean;
  format?: string | undefined;
}

interface BarcodeDetector {
  detect(imageSource: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface DetectedBarcode {
  rawValue: string;
  format: string;
  boundingBox: DOMRectReadOnly;
  cornerPoints: { x: number; y: number }[];
}

// Props & Emits
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'scan': [code: string];
}>();

// Composables
const { t } = useI18n();
const $q = useQuasar();

// State
const videoElement = ref<HTMLVideoElement | null>(null);
const cameraPermission = ref(false);
const cameraActive = ref(false);
const scanning = ref(false);
const initializing = ref(false);
const error = ref<string | null>(null);
const currentStream = ref<MediaStream | null>(null);
const scanInterval = ref<number | null>(null);
const lastScanResult = ref<ScanResult | null>(null);
const manualInput = ref('');

// Camera capabilities
const canSwitchCamera = ref(false);
const hasFlash = ref(false);
const flashEnabled = ref(false);
const currentFacingMode = ref<'user' | 'environment'>('environment');

// Barcode detector
let barcodeDetector: BarcodeDetector | null = null;

// GTIN Validation
const isValidGTIN = (code: string): boolean => {
  if (!code) return false;
  const cleanCode = code.trim().replace(/\D/g, '');
  
  // GTIN can be 8, 12, 13, or 14 digits
  const gtinRegex = /^(\d{8}|\d{12}|\d{13}|\d{14})$/;
  if (!gtinRegex.test(cleanCode)) return false;

  // Check digit validation for GTIN-13 and GTIN-14
  if (cleanCode.length === 13 || cleanCode.length === 14) {
    return validateGTINCheckDigit(cleanCode);
  }
  
  return true;
};

const validateGTINCheckDigit = (gtin: string): boolean => {
  const digits = gtin.split('').map(Number);
  const checkDigit = digits.pop()!;
  
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const weight = (digits.length - i) % 2 === 0 ? 1 : 3;
    sum += digits[i] * weight;
  }
  
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return calculatedCheckDigit === checkDigit;
};

// Camera initialization
const initializeCamera = async () => {
  initializing.value = true;
  error.value = null;

  try {
           // Check if BarcodeDetector is supported
  if ('BarcodeDetector' in window) {
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    const formats = await BarcodeDetectorClass?.getSupportedFormats();
       if (formats.includes('ean_13') || formats.includes('code_128')) {
         barcodeDetector = new BarcodeDetectorClass({
           formats: ['ean_8', 'ean_13', 'code_128', 'code_39', 'upc_a', 'upc_e']
         });
       }
     }

    // Request camera permission
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode.value,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    currentStream.value = stream;
    cameraPermission.value = true;

         // Check camera capabilities
     const videoTrack = stream.getVideoTracks()[0];
     if (videoTrack) {
       const capabilities = videoTrack.getCapabilities();
       hasFlash.value = !!(capabilities as any).torch;
     }
     
     canSwitchCamera.value = await checkMultipleCameras();

    // Set up video element
    await nextTick();
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      await videoElement.value.play();
      cameraActive.value = true;
      startScanning();
    }
  } catch (err: any) {
    console.error('Camera initialization failed:', err);
    error.value = err.name === 'NotAllowedError' 
      ? t('barcodeScanner.permissionDenied')
      : err.name === 'NotFoundError'
      ? t('barcodeScanner.noCameraFound')
      : t('barcodeScanner.cameraError');
  } finally {
    initializing.value = false;
  }
};

const checkMultipleCameras = async (): Promise<boolean> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    return videoDevices.length > 1;
  } catch {
    return false;
  }
};

const startScanning = () => {
  if (!cameraActive.value || scanning.value) return;
  
  scanning.value = true;
  
  scanInterval.value = window.setInterval(async () => {
    if (!videoElement.value || !cameraActive.value) return;
    
    try {
      await scanFrame();
    } catch (err) {
      console.warn('Scan frame error:', err);
    }
  }, 250); // Scan every 250ms
};

const scanFrame = async () => {
  if (!videoElement.value || !barcodeDetector || !videoElement.value.videoWidth) return;

  try {
    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoElement.value.videoWidth;
    canvas.height = videoElement.value.videoHeight;
    ctx.drawImage(videoElement.value, 0, 0);

    // Detect barcodes
    const barcodes = await barcodeDetector.detect(canvas);
    
    if (barcodes.length > 0) {
      const barcode = barcodes[0];
      if (barcode) {
        processScanResult(barcode.rawValue, barcode.format);
      }
    }
  } catch (err) {
    // Fallback: try image bitmap approach
    try {
      const bitmap = await createImageBitmap(videoElement.value!);
      const barcodes = await barcodeDetector!.detect(bitmap);
      
      if (barcodes.length > 0) {
        const barcode = barcodes[0];
        if (barcode) {
          processScanResult(barcode.rawValue, barcode.format);
        }
      }
    } catch (fallbackErr) {
      console.warn('Barcode detection failed:', fallbackErr);
    }
  }
};

 const processScanResult = (code: string, format?: string) => {
   const valid = isValidGTIN(code);
   
   lastScanResult.value = { code, valid, format: format || undefined };
  
  if (valid) {
    // Valid GTIN found
    $q.notify({
      type: 'positive',
      message: t('barcodeScanner.validGtin', { gtin: code }),
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
    
    emit('scan', code);
    closeScanner();
  } else {
    // Invalid format
    $q.notify({
      type: 'warning',
      message: t('barcodeScanner.invalidFormat', { code }),
      icon: 'warning',
      position: 'top',
      timeout: 3000
    });
  }
};

const processManualInput = () => {
  if (!manualInput.value.trim()) return;
  
  const code = manualInput.value.trim();
  processScanResult(code);
  manualInput.value = '';
};

const switchCamera = async () => {
  if (!canSwitchCamera.value) return;

  currentFacingMode.value = currentFacingMode.value === 'user' ? 'environment' : 'user';
  
  await stopCamera();
  await initializeCamera();
};

 const toggleFlash = async () => {
   if (!hasFlash.value || !currentStream.value) return;

   try {
     const videoTrack = currentStream.value.getVideoTracks()[0];
     if (videoTrack) {
       await videoTrack.applyConstraints({
         advanced: [{ torch: !flashEnabled.value } as any]
       });
       flashEnabled.value = !flashEnabled.value;
     }
   } catch (err) {
     console.warn('Flash toggle failed:', err);
   }
 };

const stopCamera = async () => {
  scanning.value = false;
  cameraActive.value = false;
  
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

const closeScanner = async () => {
  await stopCamera();
  lastScanResult.value = null;
  error.value = null;
  emit('update:modelValue', false);
};

// Watchers
watch(() => props.modelValue, async (newVal) => {
  if (newVal && !cameraActive.value) {
    await initializeCamera();
  } else if (!newVal) {
    await stopCamera();
  }
});

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    initializeCamera();
  }
});

onUnmounted(() => {
  stopCamera();
});
</script>

<style lang="scss" scoped>
.scanner-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: black;
}

.scanner-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  padding: 1rem;
  flex-shrink: 0;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-section {
      display: flex;
      align-items: center;
    }
  }
}

.scanner-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: black;
}

.camera-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.permission-prompt,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: white;
}

.camera-view {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); // Mirror effect for front camera
  
  &.camera-active {
    opacity: 1;
  }
}

.scanning-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  position: relative;
  width: 280px;
  height: 280px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;

  .scan-corners {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .corner {
      position: absolute;
      width: 30px;
      height: 30px;
      border: 3px solid var(--q-primary);

      &.corner-tl {
        top: -3px;
        left: -3px;
        border-right: none;
        border-bottom: none;
        border-radius: 12px 0 0 0;
      }

      &.corner-tr {
        top: -3px;
        right: -3px;
        border-left: none;
        border-bottom: none;
        border-radius: 0 12px 0 0;
      }

      &.corner-bl {
        bottom: -3px;
        left: -3px;
        border-right: none;
        border-top: none;
        border-radius: 0 0 0 12px;
      }

      &.corner-br {
        bottom: -3px;
        right: -3px;
        border-left: none;
        border-top: none;
        border-radius: 0 0 12px 0;
      }
    }
  }

  .scan-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--q-primary), transparent);
    animation: scan-line 2s ease-in-out infinite;
  }
}

@keyframes scan-line {
  0% {
    top: 0;
    opacity: 1;
  }
  50% {
    top: calc(100% - 2px);
    opacity: 0.8;
  }
  100% {
    top: 0;
    opacity: 1;
  }
}

.scan-instructions {
  margin-top: 2rem;
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);

  .instruction-text {
    font-size: 1rem;
    font-weight: 500;
  }
}

.scan-result {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);

  .result-chip {
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.manual-input-section {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);

  .manual-input-expander {
    color: white;
  }

  .manual-input-content {
    padding-top: 1rem;
    color: white;
  }
}

.scanner-footer {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem;
  color: white;
  flex-shrink: 0;
}

// Mobile optimizations
@media (max-width: 768px) {
  .scan-frame {
    width: 240px;
    height: 240px;
  }
  
  .scan-instructions {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    
    .instruction-text {
      font-size: 0.9rem;
    }
  }
}
</style>
