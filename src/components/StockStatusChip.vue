<template>
  <div class="stock-status-chip">
    <q-chip 
      :color="chipColor" 
      text-color="white" 
      :icon="chipIcon"
      size="sm"
      :class="[
        'chip-modern',
        `chip-${chipVariant}`,
        { 'chip-critical': isCritical }
      ]"
      :aria-label="chipAriaLabel"
      role="status"
    >
      <span class="chip-label">{{ chipLabel }}</span>
      <div v-if="isCritical" class="urgency-indicator" aria-hidden="true"></div>
    </q-chip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStockStatus } from 'src/composables/useStockStatus'

interface Props {
  currentStock: number
  minimumStock: number
  maximumStock?: number
}

const props = defineProps<Props>()
const { getStockInfo } = useStockStatus()

// Get comprehensive stock information using the composable
const stockInfo = computed(() => getStockInfo(
  props.currentStock,
  props.minimumStock,
  props.maximumStock
))

// Derived computed properties for template use
const chipColor = computed(() => stockInfo.value.color)
const chipIcon = computed(() => stockInfo.value.icon)
const chipLabel = computed(() => stockInfo.value.label)
const isCritical = computed(() => stockInfo.value.isCritical)
const chipAriaLabel = computed(() => stockInfo.value.label)

// Chip variant for styling (mapped from status)
const chipVariant = computed(() => {
  const variantMap = {
    'out-of-stock': 'critical',
    'low-stock': 'warning',
    'in-stock': 'success',
    'high-stock': 'info'
  }
  return variantMap[stockInfo.value.status] || 'success'
})
</script>

<style lang="scss" scoped>
.stock-status-chip {
  position: relative;
  display: inline-block;
  
  .chip-modern {
    border-radius: var(--radius-full);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);
    position: relative;
    overflow: hidden;
    
    // Enhanced styling for different states
    &.chip-critical {
      animation: criticalPulse 2s ease-in-out infinite;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
    }
    
    &.chip-warning {
      box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2);
    }
    
    &.chip-success {
      box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
    }
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    // Enhanced chip content
    :deep(.q-chip__content) {
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      
      .q-icon {
        font-size: 14px;
        transition: transform var(--transition-base);
      }
    }
    
    &:hover :deep(.q-chip__content .q-icon) {
      transform: scale(1.1);
    }
    
    .chip-label {
      font-size: var(--text-xs);
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.025em;
      text-transform: uppercase;
    }
    
    // Urgency indicator for critical items
    .urgency-indicator {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
      background: var(--brand-danger);
      animation: urgencyBlink 1.5s ease-in-out infinite;
    }
  }
}

// Critical pulse animation
@keyframes criticalPulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3), var(--shadow-sm);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1), var(--shadow-sm);
  }
}

// Urgency indicator blink
@keyframes urgencyBlink {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
}

// Dark mode adjustments
body.body--dark {
  .chip-modern {
    &.chip-critical {
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4), var(--shadow-sm);
    }
    
    &.chip-warning {
      box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.3), var(--shadow-sm);
    }
    
    &.chip-success {
      box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3), var(--shadow-sm);
    }
  }
}

// Accessibility enhancement for reduced motion
@media (prefers-reduced-motion: reduce) {
  .chip-critical {
    animation: none !important;
  }
  
  .urgency-indicator {
    animation: none !important;
    opacity: 1 !important;
  }
  
  .chip-modern:hover {
    transform: none !important;
  }
}
</style> 