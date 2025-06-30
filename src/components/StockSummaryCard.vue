<template>
  <q-card 
    :class="[
      'stock-summary-card card-modern',
      { 'card-interactive': clickable },
      `card-${color}`
    ]"
    @click="handleClick"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    :aria-label="clickable ? $attrs['aria-label'] || `${title}: ${formattedValue}. Click for details.` : `${title}: ${formattedValue}`"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
  >
    <!-- Background decoration -->
    <div class="card-decoration" :class="`decoration-${color}`" aria-hidden="true"></div>
    
    <q-card-section class="card-content">
      <div class="content-layout">
        <!-- Icon section with enhanced styling -->
        <div class="icon-section">
          <div class="icon-container" :class="`icon-${color}`">
            <q-icon 
              :name="icon" 
              size="28px"
              class="card-icon"
              aria-hidden="true"
            />
          </div>
        </div>
        
        <!-- Content section -->
        <div class="text-section">
          <div class="card-title" :id="`card-title-${$attrs.id || title.replace(/\s+/g, '-').toLowerCase()}`">{{ title }}</div>
          <div class="card-value" :class="[`text-${color}`, { 'loading-shimmer': loading }]" :aria-labelledby="`card-title-${$attrs.id || title.replace(/\s+/g, '-').toLowerCase()}`">
            {{ formattedValue }}
          </div>
          <div class="card-trend" v-if="trend" role="status" :aria-label="`Trend: ${trend.direction === 'up' ? 'increased' : 'decreased'} by ${trend.percentage} percent compared to last month`">
          <q-icon 
              :name="trend.direction === 'up' ? 'trending_up' : 'trending_down'"
              :color="trend.direction === 'up' ? 'positive' : 'negative'"
              size="14px"
              aria-hidden="true"
            />
            <span :class="trend.direction === 'up' ? 'text-positive' : 'text-negative'">
              {{ trend.percentage }}%
            </span>
            <span class="trend-period">{{ $t('dashboard.vsLastMonth') }}</span>
          </div>
        </div>
      </div>
    </q-card-section>
    
    <!-- Interactive indicator -->
    <div v-if="clickable" class="interaction-indicator" aria-hidden="true">
      <q-icon name="arrow_forward" size="16px" />
    </div>
    
    <!-- Hover effect overlay -->
    <div class="hover-overlay" aria-hidden="true"></div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './base/BaseCard.vue'

interface Trend {
  direction: 'up' | 'down'
  percentage: number
}

interface Props {
  title: string
  value: number | string
  icon: string
  color?: 'primary' | 'secondary' | 'positive' | 'negative' | 'warning' | 'info'
  clickable?: boolean
  trend?: Trend
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  clickable: false,
  loading: false
})

const emit = defineEmits<{
  click: []
}>()

// Computed properties
const formattedValue = computed(() => {
  if (props.loading) return '...'
  
  if (typeof props.value === 'number') {
    // Format large numbers with K/M suffixes
    if (props.value >= 1000000) {
      return (props.value / 1000000).toFixed(1) + 'M'
    } else if (props.value >= 1000) {
      return (props.value / 1000).toFixed(1) + 'K'
    }
    return props.value.toLocaleString()
  }
  return props.value
})

// Methods
const handleClick = () => {
  if (props.clickable && !props.loading) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
.stock-summary-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  
  // Color variants with beautiful gradients and borders
  &.card-primary {
    --card-accent: var(--brand-primary);
    --card-bg: rgba(99, 102, 241, 0.12);
    border-left: 4px solid var(--brand-primary);
    border-bottom: 1px solid rgba(99, 102, 241, 0.2);
    border-right: none;
    border-top: none;
  }
  
  &.card-secondary {
    --card-accent: var(--brand-secondary);
    --card-bg: rgba(6, 182, 212, 0.12);
    border-left: 4px solid var(--brand-secondary);
    border-bottom: 1px solid rgba(6, 182, 212, 0.2);
    border-right: none;
    border-top: none;
  }
  
  &.card-positive {
    --card-accent: var(--brand-success);
    --card-bg: rgba(16, 185, 129, 0.12);
    border-left: 4px solid var(--brand-success);
    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
    border-right: none;
    border-top: none;
  }
  
  &.card-negative {
    --card-accent: var(--brand-danger);
    --card-bg: rgba(239, 68, 68, 0.12);
    border-left: 4px solid var(--brand-danger);
    border-bottom: 1px solid rgba(239, 68, 68, 0.2);
    border-right: none;
    border-top: none;
  }
  
  &.card-warning {
    --card-accent: var(--brand-warning);
    --card-bg: rgba(245, 158, 11, 0.12);
    border-left: 4px solid var(--brand-warning);
    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    border-right: none;
    border-top: none;
  }
  
  &.card-info {
    --card-accent: var(--brand-info);
    --card-bg: rgba(6, 182, 212, 0.12);
    border-left: 4px solid var(--brand-info);
    border-bottom: 1px solid rgba(6, 182, 212, 0.2);
    border-right: none;
    border-top: none;
  }
  
  // Background decoration
  .card-decoration {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    opacity: 0.08;
    filter: blur(1px);
    transform: rotate(45deg) scale(1.2);
    transition: all var(--transition-base);
    
    &.decoration-primary {
      background: radial-gradient(circle, var(--brand-primary) 0%, var(--brand-primary-light) 70%, transparent 100%);
    }
  
    &.decoration-secondary {
      background: radial-gradient(circle, var(--brand-secondary) 0%, var(--brand-info) 70%, transparent 100%);
    }
    
    &.decoration-positive {
      background: radial-gradient(circle, var(--brand-success) 0%, var(--brand-success-light) 70%, transparent 100%);
    }
    
    &.decoration-negative {
      background: radial-gradient(circle, var(--brand-danger) 0%, var(--brand-danger-light) 70%, transparent 100%);
    }
    
    &.decoration-warning {
      background: radial-gradient(circle, var(--brand-warning) 0%, var(--brand-warning-light) 70%, transparent 100%);
    }
  
    &.decoration-info {
      background: radial-gradient(circle, var(--brand-info) 0%, var(--brand-info-light) 70%, transparent 100%);
    }
    
    // Add a second smaller decoration for more depth
    &::after {
      content: '';
      position: absolute;
      top: 30px;
      left: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: inherit;
      opacity: 0.6;
      filter: blur(2px);
      transform: scale(1.3);
    }
  }
  
  // Card content
  .card-content {
    position: relative;
    z-index: 2;
    padding: var(--space-6);
    background: transparent;
    
    .content-layout {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      
      .icon-section {
        flex-shrink: 0;
        
        .icon-container {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
          
          &.icon-primary {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.08));
            color: var(--brand-primary);
            border: 1px solid rgba(99, 102, 241, 0.3);
          }
          
          &.icon-secondary {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08));
            color: var(--brand-secondary);
            border: 1px solid rgba(6, 182, 212, 0.3);
          }
          
          &.icon-positive {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08));
            color: var(--brand-success);
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          
          &.icon-negative {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08));
            color: var(--brand-danger);
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          
          &.icon-warning {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08));
            color: var(--brand-warning);
            border: 1px solid rgba(245, 158, 11, 0.3);
          }
          
          &.icon-info {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.08));
            color: var(--brand-info);
            border: 1px solid rgba(6, 182, 212, 0.3);
          }
        }
      }
      
      .text-section {
        flex: 1;
        min-width: 0;
        
        .card-title {
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--neutral-600);
          margin-bottom: var(--space-2);
          text-transform: none;
          letter-spacing: 0.025em;
        }
        
        .card-value {
          font-size: 2rem;
          font-weight: var(--font-weight-bold);
          line-height: 1.1;
          margin-bottom: var(--space-3);
          
          &.text-primary { color: var(--brand-primary); }
          &.text-secondary { color: var(--brand-secondary); }
          &.text-positive { color: var(--brand-success); }
          &.text-negative { color: var(--brand-danger); }
          &.text-warning { color: var(--brand-warning); }
          &.text-info { color: var(--brand-info); }
          
          &.loading-shimmer {
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: var(--radius-base);
            color: transparent;
          }
        }
  
        .card-trend {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          min-height: 18px; // Ensure consistent height even when trend is missing
          
          .trend-period {
            color: var(--neutral-500);
          }
        }
      }
    }
  }
  
  // Interactive cards (clickable)
  &.card-interactive {
    cursor: pointer;
    transition: all var(--transition-base);
    
    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: var(--shadow-lg);
      border-color: var(--card-accent);
      
      .card-decoration {
        opacity: 0.12;
        transform: rotate(45deg) scale(1.4);
      }
      
      .hover-overlay {
        opacity: 0.05;
      }
      
      .interaction-indicator {
        opacity: 1;
        transform: translateX(4px);
      }
    }
    
    &:focus {
      outline: 2px solid var(--brand-primary);
      outline-offset: 2px;
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    &:active {
      transform: translateY(-1px) scale(1.01);
    }
  }
  
  // Interactive indicator (arrow in corner)
  .interaction-indicator {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    opacity: 0;
    color: var(--card-accent);
    background: rgba(255, 255, 255, 0.9);
    border-radius: var(--radius-full);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(8px);
    transition: all var(--transition-base);
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  
  // Hover overlay
  .hover-overlay {
    position: absolute;
    inset: 0;
    background: var(--card-bg);
    opacity: 0;
    pointer-events: none;
    transition: all var(--transition-base);
    border-radius: inherit;
  }
}

// Dark mode adjustments
body.body--dark .stock-summary-card {
  background: linear-gradient(145deg, rgba(23, 23, 23, 0.95), rgba(23, 23, 23, 0.85));
  border-color: rgba(255, 255, 255, 0.05);
  
  .card-content .text-section {
    .card-title {
      color: var(--neutral-600);
    }
    
    .card-value {
      color: inherit; // Keep brand colors
    }
    
    .card-trend {
      .trend-period {
        color: var(--neutral-600);
      }
    }
  }
  
  .interaction-indicator {
    background: rgba(23, 23, 23, 0.9);
    color: var(--card-accent);
  }
}

// Responsive design
@media (max-width: 768px) {
  .stock-summary-card {
    .card-content {
      padding: var(--space-5);
      
      .content-layout {
        gap: var(--space-3);
        
        .icon-section .icon-container {
          width: 48px;
          height: 48px;
        }
        
        .text-section .card-value {
          font-size: 1.75rem;
        }
      }
    }
    
    .interaction-indicator {
      width: 28px;
      height: 28px;
      top: var(--space-3);
      right: var(--space-3);
    }
  }
}

// Loading shimmer animation
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// Reduce motion for accessibility
@media (prefers-reduced-motion: reduce) {
  .stock-summary-card {
    .card-decoration,
    .hover-overlay,
    .interaction-indicator,
    .icon-container {
      transition: none !important;
    }
    
    &.card-interactive:hover {
      transform: none !important;
    }
    
    .loading-shimmer {
      animation: none !important;
    }
  }
}
</style> 