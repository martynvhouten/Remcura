<template>
  <div class="simple-order-card" @click="openOrderList">
    <!-- Card Header -->
    <div class="card-header">
      <div class="header-left">
        <div class="list-icon">
          <q-icon
            :name="getListIcon()"
            :color="getIconColor()"
            class="icon-size-lg"
          />
        </div>
        <div class="list-info">
          <h3 class="list-title">{{ orderList.name }}</h3>
          <p v-if="orderList.description" class="list-subtitle">
            {{ orderList.description }}
          </p>
        </div>
      </div>

      <div class="header-right">
        <q-badge
          :color="statusColor"
          :label="statusLabel"
          class="status-badge"
        />
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Critical Alert (only if critical items exist) -->
      <div v-if="hasCriticalItems" class="critical-alert">
        <q-icon name="warning" color="negative" class="icon-size-base" />
        <span class="alert-text">{{ criticalItemsCount }} kritieke items</span>
      </div>

      <!-- Basic Info -->
      <div class="basic-info">
        <div class="info-item">
          <q-icon name="inventory" class="info-icon icon-size-sm" />
          <span>{{ orderList.total_items || 0 }} producten</span>
        </div>
        <div v-if="hasItemsToOrder" class="info-item order-ready">
          <q-icon name="shopping_cart" class="info-icon icon-size-sm" />
          <span>{{ itemsToOrderCount }} te bestellen</span>
        </div>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="card-footer">
      <q-btn
        @click.stop="openOrderList"
        icon="open_in_new"
        label="Beheren"
        color="primary"
        outline
        no-caps
        size="sm"
        class="manage-btn"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import type { OrderListDTO } from '@/domain/inventory/dto';

  interface Props {
    orderList: OrderListDTO;
    reorderAdvice?: any | null;
  }

  const props = defineProps<Props>();
  const router = useRouter();

  // Computed properties
  const statusColor = computed(() => {
    switch (props.orderList.status) {
      case 'ready':
        return 'positive';
      case 'draft':
        return 'warning';
      case 'submitted':
        return 'info';
      case 'confirmed':
        return 'primary';
      case 'delivered':
        return 'positive';
      case 'cancelled':
        return 'negative';
      default:
        return 'grey';
    }
  });

  const statusLabel = computed(() => {
    switch (props.orderList.status) {
      case 'ready':
        return 'Klaar';
      case 'draft':
        return 'Concept';
      case 'submitted':
        return 'Verstuurd';
      case 'confirmed':
        return 'Bevestigd';
      case 'delivered':
        return 'Geleverd';
      case 'cancelled':
        return 'Geannuleerd';
      default:
        return 'Onbekend';
    }
  });

  const hasCriticalItems = computed(() => {
    return props.reorderAdvice?.items_by_urgency?.critical?.length > 0;
  });

  const criticalItemsCount = computed(() => {
    return props.reorderAdvice?.items_by_urgency?.critical?.length || 0;
  });

  const hasItemsToOrder = computed(() => {
    return props.reorderAdvice?.total_items_to_order > 0;
  });

  const itemsToOrderCount = computed(() => {
    return props.reorderAdvice?.total_items_to_order || 0;
  });

  // Methods
  const getListIcon = () => {
    switch (props.orderList.status) {
      case 'ready':
        return 'check_circle';
      case 'draft':
        return 'edit';
      case 'submitted':
        return 'send';
      case 'confirmed':
        return 'verified';
      case 'delivered':
        return 'local_shipping';
      case 'cancelled':
        return 'cancel';
      default:
        return 'list_alt';
    }
  };

  const getIconColor = () => {
    return statusColor.value;
  };

  const openOrderList = () => {
    router.push(`/order-lists/${props.orderList.id}`);
  };
</script>

<style scoped>
  .simple-order-card {
    background: white;
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    transition: all 0.2s ease;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.04);
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .simple-order-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  /* Header */
  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }

  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .list-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(25, 118, 210, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .list-info {
    flex: 1;
    min-width: 0;
  }

  .list-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px 0;
    line-height: 1.3;
    word-break: break-word;
  }

  .list-subtitle {
    font-size: 12px;
    color: #666;
    margin: 0;
    line-height: 1.4;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .header-right {
    flex-shrink: 0;
  }

  .status-badge {
    font-size: 10px;
    font-weight: 500;
    padding: 3px 6px;
    border-radius: 4px;
  }

  /* Content */
  .card-content {
    flex: 1;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .critical-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(244, 67, 54, 0.05);
    border: 1px solid rgba(244, 67, 54, 0.1);
    border-radius: 6px;
  }

  .alert-text {
    font-size: 12px;
    color: #d32f2f;
    font-weight: 500;
  }

  .basic-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #666;
  }

  .info-item.order-ready {
    color: #1976d2;
    font-weight: 500;
  }

  .info-icon {
    color: #999;
  }

  .info-item.order-ready .info-icon {
    color: #1976d2;
  }

  /* Footer */
  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.04);
    background: rgba(0, 0, 0, 0.01);
  }

  .manage-btn {
    width: 100%;
    border-radius: 6px;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .card-header {
      padding: 14px 14px 10px;
    }

    .card-content {
      padding: 10px 14px;
    }

    .card-footer {
      padding: 10px 14px;
    }

    .list-title {
      font-size: 14px;
    }

    .list-subtitle {
      font-size: 11px;
    }
  }
</style>
