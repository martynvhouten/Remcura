<template>
  <q-page class="mobile-counting-test-page">
    <!-- Test Header -->
    <div class="test-header">
      <h1>Mobiel Tellen - Test Interface</h1>
      <p>Test de nieuwe moderne mobiel tellen interface op verschillende schermformaten</p>
      
      <!-- Device Simulation Controls -->
      <div class="device-controls">
        <q-btn-group>
          <q-btn 
            @click="setViewport('mobile')" 
            :color="currentViewport === 'mobile' ? 'primary' : 'grey'"
            label="📱 Mobile"
            size="sm"
          />
          <q-btn 
            @click="setViewport('tablet')" 
            :color="currentViewport === 'tablet' ? 'primary' : 'grey'"
            label="📟 Tablet"
            size="sm"
          />
          <q-btn 
            @click="setViewport('desktop')" 
            :color="currentViewport === 'desktop' ? 'primary' : 'grey'"
            label="🖥️ Desktop"
            size="sm"
          />
        </q-btn-group>
        
        <q-btn 
          @click="toggleDarkMode" 
          :icon="darkMode ? 'light_mode' : 'dark_mode'"
          :label="darkMode ? 'Light Mode' : 'Dark Mode'"
          outline
          size="sm"
        />
      </div>
    </div>

    <!-- Device Viewport Simulator -->
    <div class="viewport-simulator" :class="viewportClass">
      <div class="device-frame">
        <div class="device-screen">
          <MobileCountingInterface 
            :practice-id="testPracticeId"
            :location-id="testLocationId"
            @close="handleClose"
          />
        </div>
      </div>
    </div>

    <!-- Test Information -->
    <div class="test-info">
      <q-card>
        <q-card-section>
          <h3>Test Features:</h3>
          <ul>
            <li>✅ Compacte camera preview (geen full-screen overlay)</li>
            <li>✅ Geïntegreerde barcode scanner</li>
            <li>✅ Touch-friendly interface</li>
            <li>✅ Swipe gestures (links = overslaan, rechts = bevestigen)</li>
            <li>✅ Haptic feedback op ondersteunde devices</li>
            <li>✅ Moderne card-based layout</li>
            <li>✅ Responsive design voor alle schermformaten</li>
            <li>✅ Dark mode support</li>
          </ul>
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md">
        <q-card-section>
          <h3>Swipe Instructies:</h3>
          <div class="swipe-demo">
            <div class="swipe-item left">
              <q-icon name="keyboard_arrow_left" size="2rem" />
              <span>Swipe links om product over te slaan</span>
            </div>
            <div class="swipe-item right">
              <q-icon name="keyboard_arrow_right" size="2rem" />
              <span>Swipe rechts om telling te bevestigen</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import MobileCountingInterface from 'src/components/inventory/MobileCountingInterface.vue';

const $q = useQuasar();

// Test state
const currentViewport = ref<'mobile' | 'tablet' | 'desktop'>('mobile');
const darkMode = ref(false);
const testPracticeId = ref('test-practice-1');
const testLocationId = ref('test-location-1');

// Computed
const viewportClass = computed(() => {
  return `viewport-${currentViewport.value}${darkMode.value ? ' dark-mode' : ''}`;
});

// Methods
const setViewport = (viewport: 'mobile' | 'tablet' | 'desktop') => {
  currentViewport.value = viewport;
  
  $q.notify({
    message: `Viewport changed to ${viewport}`,
    type: 'info',
    position: 'top',
    timeout: 1000
  });
};

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  
  // Apply dark mode to body for testing
  if (darkMode.value) {
    document.body.classList.add('body--dark');
  } else {
    document.body.classList.remove('body--dark');
  }
  
  $q.notify({
    message: `${darkMode.value ? 'Dark' : 'Light'} mode enabled`,
    type: 'info',
    position: 'top',
    timeout: 1000
  });
};

const handleClose = () => {
  $q.notify({
    message: 'Mobiel tellen interface gesloten',
    type: 'info',
    position: 'top'
  });
};
</script>

<style lang="scss" scoped>
.mobile-counting-test-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
}

.test-header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    margin: 0 0 0.5rem 0;
    color: #1e293b;
    font-size: 2rem;
    font-weight: 700;
  }

  p {
    color: #64748b;
    font-size: 1.125rem;
    margin-bottom: 1.5rem;
  }

  .device-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
}

.viewport-simulator {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  
  .device-frame {
    background: #1e293b;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: #64748b;
      border-radius: 2px;
    }
    
    .device-screen {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }
  }

  &.viewport-mobile .device-frame {
    width: 375px;
    .device-screen {
      height: 667px;
    }
  }

  &.viewport-tablet .device-frame {
    width: 768px;
    .device-screen {
      height: 1024px;
    }
  }

  &.viewport-desktop .device-frame {
    width: 1024px;
    .device-screen {
      height: 768px;
    }
  }

  &.dark-mode .device-frame .device-screen {
    background: #1e293b;
  }
}

.test-info {
  max-width: 800px;
  margin: 0 auto;

  h3 {
    margin: 0 0 1rem 0;
    color: #1e293b;
    font-size: 1.25rem;
    font-weight: 600;
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
      color: #475569;
    }
  }

  .swipe-demo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;

    .swipe-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
      font-weight: 500;

      &.left {
        background: #fef3c7;
        color: #d97706;
      }

      &.right {
        background: #dcfce7;
        color: #16a34a;
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 1200px) {
  .viewport-simulator {
    &.viewport-desktop .device-frame {
      width: 90vw;
      max-width: 800px;
    }
  }
}

@media (max-width: 900px) {
  .viewport-simulator {
    &.viewport-tablet .device-frame {
      width: 90vw;
      max-width: 600px;
      .device-screen {
        height: 800px;
      }
    }
  }
}

@media (max-width: 600px) {
  .mobile-counting-test-page {
    padding: 1rem;
  }

  .viewport-simulator {
    &.viewport-mobile .device-frame {
      width: 100%;
      max-width: 350px;
      .device-screen {
        height: 600px;
      }
    }
  }

  .test-info .swipe-demo {
    grid-template-columns: 1fr;
  }
}

// Dark mode
body.body--dark {
  .mobile-counting-test-page {
    background: #0f172a;
  }

  .test-header {
    h1 {
      color: #f1f5f9;
    }

    p {
      color: #94a3b8;
    }
  }

  .test-info {
    h3 {
      color: #f1f5f9;
    }

    ul li {
      color: #cbd5e1;
    }
  }
}
</style>