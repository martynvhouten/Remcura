<template>
  <div class="list-widget">
    <!-- Order Suggestions List -->
    <div v-if="widgetId === 'order-suggestions'" class="suggestions-list">
      <div v-if="!data.suggestions?.length" class="empty-state">
        <q-icon name="lightbulb" color="info" size="2rem" />
        <p>Geen bestel suggesties</p>
      </div>
      <div v-else class="suggestion-items">
        <div 
          v-for="suggestion in data.suggestions"
          :key="suggestion.id"
          class="suggestion-item"
        >
          <div class="suggestion-content">
            <div class="suggestion-header">
              <h6 class="product-name">{{ suggestion.products?.name }}</h6>
              <q-chip 
                :color="getUrgencyColor(suggestion.urgency_level)"
                text-color="white"
                size="sm"
              >
                {{ getUrgencyLabel(suggestion.urgency_level) }}
              </q-chip>
            </div>
            <div class="suggestion-details">
              <div class="stock-info">
                <span class="label">Huidige voorraad:</span>
                <span class="value">{{ suggestion.current_stock }}</span>
              </div>
              <div class="suggestion-quantity">
                <span class="label">Voorgesteld:</span>
                <span class="value">{{ suggestion.suggested_quantity }}</span>
              </div>
            </div>
            <div class="suggestion-actions">
              <q-btn
                size="sm"
                color="primary"
                label="Bestellen"
                no-caps
                @click="createOrder(suggestion)"
              />
              <q-btn
                size="sm"
                flat
                color="primary"
                label="Details"
                no-caps
                @click="viewProduct(suggestion)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders List -->
    <div v-else-if="widgetId === 'recent-orders'" class="orders-list">
      <div v-if="!data.orders?.length" class="empty-state">
        <q-icon name="shopping_cart" color="grey-5" size="2rem" />
        <p>Geen recente bestellingen</p>
      </div>
      <div v-else class="order-items">
        <div 
          v-for="order in data.orders"
          :key="order.id"
          class="order-item"
        >
          <div class="order-content">
            <div class="order-header">
              <span class="order-number">#{{ order.order_number }}</span>
              <q-chip 
                :color="getStatusColor(order.status)"
                text-color="white"
                size="sm"
              >
                {{ getStatusLabel(order.status) }}
              </q-chip>
            </div>
            <div class="order-details">
              <div class="order-meta">
                <span class="label">Datum:</span>
                <span class="value">{{ formatDate(order.order_date) }}</span>
              </div>
              <div class="order-amount" v-if="order.total_amount">
                <span class="label">Bedrag:</span>
                <span class="value">{{ formatCurrency(order.total_amount) }}</span>
              </div>
            </div>
            <div class="order-actions">
              <q-btn
                size="sm"
                color="primary"
                label="Bekijken"
                no-caps
                @click="viewOrder(order)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generic List (fallback) -->
    <div v-else class="generic-list">
      <div class="list-items">
        <div 
          v-for="(item, index) in genericItems"
          :key="index"
          class="list-item"
        >
          <q-icon :name="item.icon || 'info'" color="primary" />
          <div class="item-content">
            <div class="item-title">{{ item.title || item.name }}</div>
            <div class="item-subtitle">{{ item.subtitle || item.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFormatting } from '@/composables/useFormatting';

interface ListData {
  suggestions?: Array<{
    id: string;
    current_stock: number;
    suggested_quantity: number;
    urgency_level: string;
    products?: {
      name: string;
      sku: string;
    };
  }>;
  orders?: Array<{
    id: string;
    order_number: string;
    status: string;
    order_date: string;
    total_amount?: number;
  }>;
  items?: Array<{
    id?: string;
    title?: string;
    name?: string;
    subtitle?: string;
    description?: string;
    icon?: string;
  }>;
}

interface Props {
  data: ListData;
  widgetId: string;
}

const props = defineProps<Props>();
const router = useRouter();
const { formatDate, formatCurrency } = useFormatting();

const genericItems = computed(() => props.data.items || []);

function getUrgencyColor(urgency: string): string {
  switch (urgency.toLowerCase()) {
    case 'critical': return 'red';
    case 'high': return 'deep-orange';
    case 'medium': return 'orange';
    case 'low': return 'blue';
    default: return 'grey';
  }
}

function getUrgencyLabel(urgency: string): string {
  switch (urgency.toLowerCase()) {
    case 'critical': return 'Kritiek';
    case 'high': return 'Hoog';
    case 'medium': return 'Gemiddeld';
    case 'low': return 'Laag';
    default: return urgency;
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'delivered': return 'positive';
    case 'shipped': return 'info';
    case 'confirmed': return 'primary';
    case 'submitted': return 'warning';
    case 'draft': return 'grey';
    case 'cancelled': return 'negative';
    default: return 'grey';
  }
}

function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'delivered': return 'Geleverd';
    case 'shipped': return 'Verzonden';
    case 'confirmed': return 'Bevestigd';
    case 'submitted': return 'Verstuurd';
    case 'draft': return 'Concept';
    case 'cancelled': return 'Geannuleerd';
    default: return status;
  }
}

function createOrder(suggestion: any) {
  router.push({
    path: '/orders/new',
    query: { 
      product: suggestion.products?.sku,
      quantity: suggestion.suggested_quantity
    }
  });
}

function viewProduct(suggestion: any) {
  router.push({
    path: '/inventory/levels',
    query: { search: suggestion.products?.sku }
  });
}

function viewOrder(order: any) {
  router.push(`/orders/${order.id}`);
}
</script>

<style lang="scss" scoped>
.list-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-muted);
  padding: var(--space-6);
  
  p {
    margin: var(--space-3) 0 0 0;
    font-size: var(--text-base);
  }
}

// Suggestions List
.suggestions-list,
.orders-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .suggestion-items,
  .order-items {
    flex: 1;
    overflow-y: auto;
    
    .suggestion-item,
    .order-item {
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
      
      &:hover {
        background: var(--neutral-50);
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .suggestion-content,
      .order-content {
        .suggestion-header,
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
          
          .product-name {
            margin: 0;
            font-size: var(--text-base);
            font-weight: var(--font-weight-semibold);
            color: var(--text-primary);
          }
          
          .order-number {
            font-weight: var(--font-weight-semibold);
            color: var(--text-primary);
          }
        }
        
        .suggestion-details,
        .order-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          
          > div {
            display: flex;
            justify-content: space-between;
            font-size: var(--text-sm);
            
            .label {
              color: var(--text-muted);
            }
            
            .value {
              font-weight: var(--font-weight-medium);
              color: var(--text-primary);
            }
          }
        }
        
        .suggestion-actions,
        .order-actions {
          display: flex;
          gap: var(--space-2);
        }
      }
    }
  }
}

// Generic List
.generic-list {
  .list-items {
    .list-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border-bottom: 1px solid var(--neutral-200);
      
      &:hover {
        background: var(--neutral-50);
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-content {
        flex: 1;
        
        .item-title {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }
        
        .item-subtitle {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }
      }
    }
  }
}

// Dark mode
body.body--dark {
  .suggestion-item,
  .order-item,
  .list-item {
    border-color: var(--neutral-700);
    
    &:hover {
      background: var(--neutral-800);
    }
  }
  
  .suggestion-content,
  .order-content {
    .suggestion-header .product-name,
    .order-header .order-number {
      color: var(--text-primary-dark);
    }
    
    .suggestion-details,
    .order-details {
      .value {
        color: var(--text-primary-dark);
      }
    }
  }
  
  .list-item .item-content .item-title {
    color: var(--text-primary-dark);
  }
  
  .empty-state {
    color: var(--text-muted-dark);
  }
}

// Mobile optimizations
@media (max-width: 768px) {
  .suggestion-details,
  .order-details {
    grid-template-columns: 1fr !important;
    gap: var(--space-1);
  }
  
  .suggestion-actions,
  .order-actions {
    flex-direction: column;
    
    .q-btn {
      justify-content: center;
    }
  }
  
  .suggestion-header,
  .order-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: var(--space-2);
  }
}
</style> 