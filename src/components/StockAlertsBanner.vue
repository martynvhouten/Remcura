<template>
  <div v-if="hasAlerts" class="stock-notifications">
    <!-- Low stock notification -->
    <Transition name="notification-slide" appear>
      <div
        v-if="lowStockCount > 0 && !lowStockDismissed"
        class="notification-card warning"
        @click="goToProducts"
      >
        <div class="notification-icon">
          <q-icon name="warning" size="16px" />
        </div>
        <div class="notification-content">
          <div class="notification-title">Low Stock</div>
          <div class="notification-message">
            {{ lowStockCount }} {{ lowStockCount === 1 ? 'product needs' : 'products need' }} attention
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="close"
          @click.stop="dismissLowStockAlert"
          class="notification-dismiss"
        >
          <q-tooltip>Dismiss</q-tooltip>
        </q-btn>
      </div>
    </Transition>

    <!-- Out of stock notification -->
    <Transition name="notification-slide" appear>
      <div
        v-if="outOfStockCount > 0 && !outOfStockDismissed"
        class="notification-card critical"
        @click="goToProducts"
      >
        <div class="notification-icon">
          <q-icon name="error" size="16px" />
        </div>
        <div class="notification-content">
          <div class="notification-title">Out of Stock</div>
          <div class="notification-message">
            {{ outOfStockCount }} {{ outOfStockCount === 1 ? 'product is' : 'products are' }} unavailable
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="close"
          @click.stop="dismissOutOfStockAlert"
          class="notification-dismiss"
        >
          <q-tooltip>Dismiss</q-tooltip>
        </q-btn>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useClinicStore } from 'src/stores/clinic'

const router = useRouter()
const { t } = useI18n()
const clinicStore = useClinicStore()

// Local state for dismissing alerts
const lowStockDismissed = ref(false)
const outOfStockDismissed = ref(false)

// Computed properties
const lowStockCount = computed(() => clinicStore.lowStockProducts.length)
const outOfStockCount = computed(() => clinicStore.outOfStockProducts.length)

const hasAlerts = computed(() => 
  (lowStockCount.value > 0 && !lowStockDismissed.value) ||
  (outOfStockCount.value > 0 && !outOfStockDismissed.value)
)

// Methods
const goToProducts = () => {
  router.push({ name: 'products' })
}

const dismissLowStockAlert = () => {
  lowStockDismissed.value = true
}

const dismissOutOfStockAlert = () => {
  outOfStockDismissed.value = true
}

// Reset dismissal when counts change (new alerts)
watch(() => lowStockCount.value, (newCount: number, oldCount: number) => {
  if (newCount > oldCount) {
    lowStockDismissed.value = false
  }
})

watch(() => outOfStockCount.value, (newCount: number, oldCount: number) => {
  if (newCount > oldCount) {
    outOfStockDismissed.value = false
  }
})
</script>

<style lang="scss" scoped>
.stock-notifications {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
}

.notification-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &.warning {
    border-left-color: #f59e0b;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(254, 243, 199, 0.9));
    
    .notification-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    
    .notification-title {
      color: #92400e;
    }
  }
  
  &.critical {
    border-left-color: #ef4444;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(254, 226, 226, 0.9));
    animation: criticalPulse 3s ease-in-out infinite;
    
    .notification-icon {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
      animation: iconPulse 2s ease-in-out infinite;
    }
    
    .notification-title {
      color: #991b1b;
    }
  }
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
  
  .notification-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    line-height: 1.2;
  }
  
  .notification-message {
    font-size: 12px;
    color: #64748b;
    line-height: 1.3;
  }
}

.notification-dismiss {
  color: #94a3b8;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(148, 163, 184, 0.1);
    color: #64748b;
  }
}

// Animations
@keyframes criticalPulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  50% {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(239, 68, 68, 0.1);
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

// Transition animations
.notification-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// Dark mode support
body.body--dark {
  .notification-card {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(71, 85, 105, 0.3);
    
    &.warning {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(69, 26, 3, 0.3));
      
      .notification-title {
        color: #fbbf24;
      }
    }
    
    &.critical {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(69, 10, 10, 0.3));
      
      .notification-title {
        color: #f87171;
      }
    }
    
    .notification-message {
      color: #cbd5e1;
    }
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .stock-notifications {
    top: 70px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
  
  .notification-card {
    padding: 14px;
    
    .notification-content {
      .notification-title {
        font-size: 13px;
      }
      
      .notification-message {
        font-size: 11px;
      }
    }
  }
}

@media (max-width: 480px) {
  .stock-notifications {
    top: 60px;
    right: 12px;
    left: 12px;
  }
  
  .notification-card {
    padding: 12px;
    gap: 10px;
    
    .notification-icon {
      width: 28px;
      height: 28px;
    }
  }
}
</style> 