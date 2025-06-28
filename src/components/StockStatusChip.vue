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
import { useI18n } from 'vue-i18n'
import type { ClinicProduct } from 'src/types/supabase'

interface Props {
  product: ClinicProduct
}

const props = defineProps<Props>()
const { t } = useI18n()

const chipColor = computed(() => {
  if (props.product.current_stock === 0) return 'negative'
  if (props.product.current_stock <= props.product.minimum_stock) return 'warning'
  return 'positive'
})

const chipVariant = computed(() => {
  if (props.product.current_stock === 0) return 'critical'
  if (props.product.current_stock <= props.product.minimum_stock) return 'warning'
  return 'success'
})

const chipIcon = computed(() => {
  if (props.product.current_stock === 0) return 'error'
  if (props.product.current_stock <= props.product.minimum_stock) return 'warning'
  return 'check_circle'
})

const chipLabel = computed(() => {
  if (props.product.current_stock === 0) return t('products.outOfStock')
  if (props.product.current_stock <= props.product.minimum_stock) return t('products.lowStock')
  return t('products.inStock')
})

const isCritical = computed(() => props.product.current_stock === 0)

const chipAriaLabel = computed(() => {
  if (props.product.current_stock === 0) return t('products.outOfStock')
  if (props.product.current_stock <= props.product.minimum_stock) return t('products.lowStock')
  return t('products.inStock')
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