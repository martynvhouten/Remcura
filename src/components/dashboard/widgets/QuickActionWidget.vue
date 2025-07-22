<template>
  <div class="quick-action-widget" @click="handleAction">
    <div class="action-content">
      <q-icon 
        :name="actionIcon"
        size="3rem"
        :color="actionColor"
        class="action-icon"
      />
      <h6 class="action-title">{{ actionTitle }}</h6>
      <p class="action-description">{{ data.description }}</p>
      
      <q-btn
        :color="actionColor"
        :label="actionButtonLabel"
        unelevated
        no-caps
        class="action-button"
        @click.stop="handleAction"
      />
    </div>

    <!-- Special animations for scan action -->
    <div v-if="data.action === 'scan'" class="scan-animation">
      <div class="scan-line" :class="{ active: isScanning }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

interface QuickActionData {
  action: string;
  description: string;
  title?: string;
  icon?: string;
  color?: string;
  route?: string;
}

interface Props {
  data: QuickActionData;
}

const props = defineProps<Props>();
const router = useRouter();
const $q = useQuasar();
const isScanning = ref(false);

const actionIcon = computed(() => {
  switch (props.data.action) {
    case 'scan':
      return 'qr_code_scanner';
    case 'order':
      return 'add_shopping_cart';
    case 'update':
      return 'edit';
    case 'export':
      return 'download';
    default:
      return props.data.icon || 'touch_app';
  }
});

const actionColor = computed(() => {
  switch (props.data.action) {
    case 'scan':
      return 'primary';
    case 'order':
      return 'positive';
    case 'update':
      return 'info';
    case 'export':
      return 'purple';
    default:
      return props.data.color || 'primary';
  }
});

const actionTitle = computed(() => {
  if (props.data.title) return props.data.title;
  
  switch (props.data.action) {
    case 'scan':
      return 'Snel Scannen';
    case 'order':
      return 'Nieuwe Bestelling';
    case 'update':
      return 'Voorraad Bijwerken';
    case 'export':
      return 'Export Data';
    default:
      return 'Actie';
  }
});

const actionButtonLabel = computed(() => {
  switch (props.data.action) {
    case 'scan':
      return 'Start Scanner';
    case 'order':
      return 'Bestelling Maken';
    case 'update':
      return 'Bewerk Voorraad';
    case 'export':
      return 'Exporteren';
    default:
      return 'Start';
  }
});

function handleAction() {
  switch (props.data.action) {
    case 'scan':
      handleScanAction();
      break;
    case 'order':
      router.push('/orders/new');
      break;
    case 'update':
      router.push('/inventory/levels');
      break;
    case 'export':
      handleExportAction();
      break;
    default:
      if (props.data.route) {
        router.push(props.data.route);
      }
  }
}

function handleScanAction() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    // Show scanning animation
    isScanning.value = true;
    
    // Simulate scan or redirect to actual scanner
    setTimeout(() => {
      isScanning.value = false;
      router.push('/scan');
    }, 1000);
  } else {
    $q.notify({
      type: 'warning',
      message: 'Camera niet beschikbaar',
      caption: 'Probeer handmatig een product toe te voegen'
    });
  }
}

function handleExportAction() {
  $q.notify({
    type: 'info',
    message: 'Export gestart',
    caption: 'Je ontvangt een melding wanneer de export klaar is'
  });
  // Here you would implement actual export functionality
}
</script>

<style lang="scss" scoped>
.quick-action-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--space-6);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    .action-icon {
      transform: scale(1.1);
    }
    
    .action-button {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }
  
  .action-content {
    z-index: 2;
    position: relative;
  }
  
  .action-icon {
    margin-bottom: var(--space-4);
    transition: transform 0.2s ease;
    opacity: 0.9;
  }
  
  .action-title {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--text-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
  }
  
  .action-description {
    margin: 0 0 var(--space-6) 0;
    color: var(--text-muted);
    font-size: var(--text-sm);
    line-height: 1.5;
  }
  
  .action-button {
    min-width: 120px;
    transition: all 0.2s ease;
  }
}

// Scan animation
.scan-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  .scan-line {
    position: absolute;
    top: 20%;
    left: 20%;
    right: 20%;
    height: 2px;
    background: var(--primary);
    opacity: 0;
    transform: translateY(-100%);
    transition: all 0.3s ease;
    
    &.active {
      opacity: 1;
      transform: translateY(0);
      animation: scanMove 2s ease-in-out infinite;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: -1px;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--primary),
        transparent
      );
      opacity: 0.7;
    }
  }
}

@keyframes scanMove {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(calc(60vh - 20px));
    opacity: 0;
  }
}

// Interactive states
.quick-action-widget {
  &:active {
    transform: scale(0.98);
  }
}

// Dark mode
body.body--dark {
  .quick-action-widget {
    .action-title {
      color: var(--text-primary-dark);
    }
  }
  
  .scan-animation .scan-line {
    background: var(--primary-300);
    
    &::before {
      background: linear-gradient(
        90deg,
        transparent,
        var(--primary-300),
        transparent
      );
    }
  }
}

// Mobile optimizations
@media (max-width: 768px) {
  .quick-action-widget {
    padding: var(--space-4);
    
    .action-icon {
      size: 2.5rem;
      margin-bottom: var(--space-3);
    }
    
    .action-title {
      font-size: var(--text-lg);
      margin-bottom: var(--space-2);
    }
    
    .action-description {
      font-size: var(--text-xs);
      margin-bottom: var(--space-4);
    }
    
    .action-button {
      min-width: 100px;
      font-size: var(--text-sm);
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .quick-action-widget {
    &:hover {
      .action-icon {
        transform: none;
      }
      
      .action-button {
        transform: none;
      }
    }
    
    .action-icon,
    .action-button {
      transition: none;
    }
  }
  
  .scan-animation .scan-line {
    &.active {
      animation: none;
      opacity: 0.5;
    }
  }
}
</style> 