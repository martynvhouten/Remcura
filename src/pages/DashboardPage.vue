<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('nav.dashboard')"
        :subtitle="`${$t('dashboard.welcome')}, ${userProfile?.full_name || $t('dashboard.user')}`"
        icon="dashboard"
        :meta="[
          { icon: 'schedule', text: currentTime },
          { icon: 'domain', text: clinicName }
        ]"
      >
        <template #actions>
          <q-btn
            color="primary"
            icon="refresh"
            :label="$t('common.refresh')"
            @click="refreshData"
            :loading="loading"
            class="btn-modern"
            unelevated
          />
          <q-btn
            color="primary"
            icon="analytics"
            :label="$t('dashboard.viewAnalytics')"
            outline
            class="btn-modern"
            @click="() => $router.push('/analytics')"
          />
        </template>
      </PageTitle>
    </template>

    <!-- Summary Cards Grid -->
    <div class="summary-section animate-slide-up">
      <div class="summary-grid" role="region" aria-labelledby="summary-title">
        <h2 id="summary-title" class="sr-only">{{ $t('dashboard.summaryOverview') || 'Dashboard Summary' }}</h2>
        <StockSummaryCard
          :title="$t('dashboard.totalProducts')"
          :value="totalProducts"
          icon="inventory_2"
          color="primary"
          :clickable="true"
          :trend="{ direction: 'up', percentage: 12 }"
          @click="goToProducts"
          :aria-label="`${$t('dashboard.totalProducts')}: ${totalProducts} products. Click to view all products.`"
        />
        
        <StockSummaryCard
          :title="$t('dashboard.lowStockItems')"
          :value="lowStockCount"
          icon="warning"
          color="warning"
          :clickable="true"
          :trend="{ direction: 'down', percentage: 8 }"
          @click="goToProducts"
          :aria-label="`${$t('dashboard.lowStockItems')}: ${lowStockCount} items with low stock. Click to view details.`"
        />
        
        <StockSummaryCard
          :title="$t('dashboard.outOfStockItems')"
          :value="outOfStockCount"
          icon="error"
          color="negative"
          :clickable="true"
          :trend="{ direction: 'down', percentage: 0 }"
          @click="goToProducts"
          :aria-label="`${$t('dashboard.outOfStockItems')}: ${outOfStockCount} items out of stock. Click to view details.`"
        />
        
        <StockSummaryCard
          :title="$t('dashboard.reorderSuggestions')"
          :value="reorderSuggestionsCount"
          icon="shopping_cart"
          color="info"
          :clickable="true"
          :trend="{ direction: 'up', percentage: 15 }"
          @click="goToProducts"
          :aria-label="`${$t('dashboard.reorderSuggestions')}: ${reorderSuggestionsCount} items suggested for reorder. Click to view details.`"
        />
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid animate-scale-in">
      <!-- Low Stock Items Card -->
      <div class="content-card">
        <q-card class="card-modern card-elevated full-height" role="region" aria-labelledby="low-stock-title">
          <q-card-section class="card-header">
            <div class="card-header-content">
              <div class="card-title-section">
                <q-icon name="warning" color="warning" class="title-icon icon-lg" aria-hidden="true" />
                <div class="title-content">
                  <h2 id="low-stock-title" class="card-title">{{ $t('dashboard.lowStockItems') }}</h2>
                  <p class="card-subtitle">{{ $t('dashboard.itemsRequiringAttention') }}</p>
                </div>
              </div>
              <q-btn
                flat
                round
                icon="more_vert"
                class="options-btn"
                :aria-label="$t('dashboard.moreOptions') || 'More options'"
              >
                <q-menu>
                  <q-list role="menu" :aria-label="$t('dashboard.optionsMenu') || 'Options menu'">
                    <q-item clickable @click="goToProducts" role="menuitem">
                      <q-item-section>{{ $t('dashboard.viewAllProducts') }}</q-item-section>
                    </q-item>
                    <q-item clickable role="menuitem">
                      <q-item-section>{{ $t('dashboard.exportToCsv') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-content">
            <!-- Empty state -->
            <div v-if="lowStockItems.length === 0" class="empty-state animate-fade-in">
              <div class="empty-icon">
                <q-icon name="check_circle" color="positive" class="empty-state-icon" aria-hidden="true" />
              </div>
              <h3 class="empty-title">{{ $t('dashboard.noLowStock') || 'Geen lage voorraad' }}</h3>
              <p class="empty-description">{{ $t('dashboard.allProductsWellStocked') || 'Alle producten zijn goed op voorraad' }}</p>
              <div class="empty-actions">
                <q-btn 
                  color="primary" 
                  icon="inventory_2" 
                  label="Bekijk alle producten" 
                  @click="goToProducts"
                  outline
                  class="btn-modern"
                />
              </div>
            </div>

            <!-- Items list -->
            <q-list v-else class="items-list" role="list" :aria-label="$t('dashboard.lowStockItemsList') || 'Low stock items list'">
              <q-item
                v-for="product in lowStockItems.slice(0, 8)"
                :key="product.id"
                class="item-row"
                :class="{ 'item-critical': product.current_stock === 0 }"
                clickable
                @click="goToProducts"
                role="listitem"
                :aria-label="`${product.product_name} - ${product.current_stock} units in stock, minimum ${product.minimum_stock}. ${product.current_stock === 0 ? 'Out of stock.' : 'Low stock.'} Click to view details.`"
                tabindex="0"
                @keydown.enter="goToProducts"
                @keydown.space="goToProducts"
              >
                  <q-item-section avatar>
                    <q-avatar 
                      :color="product.current_stock === 0 ? 'negative' : 'warning'" 
                      text-color="white"
                      class="product-avatar"
                    >
                      <q-icon name="inventory_2" class="product-icon" aria-hidden="true" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                  <q-item-label class="item-name">{{ product.product_name }}</q-item-label>
                  <q-item-label caption class="item-sku">
                      SKU: {{ product.product_sku || 'N/A' }}
                    </q-item-label>
                  </q-item-section>

                <q-item-section side class="item-stock">
                  <div class="stock-info">
                    <div class="stock-numbers">
                      <span class="current-stock" :class="product.current_stock === 0 ? 'text-negative' : 'text-warning'">
                          {{ product.current_stock }}
                        </span>
                      <span class="stock-separator">/</span>
                      <span class="min-stock">{{ product.minimum_stock }}</span>
                      </div>
                    <div class="stock-labels">
                      <span class="stock-label">{{ $t('dashboard.currentMin') }}</span>
                      </div>
                    </div>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="arrow_forward"
                    color="primary"
                    class="action-btn"
                    :aria-label="$t('dashboard.viewProductDetails') || 'View product details'"
                    tabindex="-1"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

            <div v-if="lowStockItems.length > 8" class="view-more">
                <q-btn 
                  flat 
                color="primary"
                :label="$t('dashboard.viewMore', { count: lowStockItems.length - 8 })"
                  @click="goToProducts"
                class="view-more-btn"
                :aria-label="`View ${lowStockItems.length - 8} more low stock items`"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

      <!-- Quick Actions & Stats Panel -->
      <div class="sidebar-content">
        <!-- Quick Actions Card -->
        <q-card class="card-modern actions-card" role="region" aria-labelledby="quick-actions-title">
          <q-card-section class="card-header">
            <div class="card-title-section">
              <q-icon name="bolt" color="accent" class="title-icon icon-lg" aria-hidden="true" />
              <div class="title-content">
                <h3 id="quick-actions-title" class="card-title">{{ $t('dashboard.quickActions') }}</h3>
                <p class="card-subtitle">{{ $t('dashboard.commonTasks') }}</p>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-content">
            <div class="actions-list" role="list" :aria-label="$t('dashboard.quickActionsList') || 'Quick actions list'">
                <q-item 
                  clickable 
                  v-ripple 
                  @click="goToProducts"
                  class="action-item glass-card hover-lift"
                  role="listitem"
                  :aria-label="$t('dashboard.addProduct') || 'Product toevoegen'"
                  tabindex="0"
                  @keydown.enter="goToProducts"
                  @keydown.space="goToProducts"
                >
                  <q-item-section avatar>
                    <q-icon name="add_box" color="primary" class="action-icon icon-lg" aria-hidden="true" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="action-label">{{ $t('dashboard.addProduct') || 'Product toevoegen' }}</q-item-label>
                    <q-item-label caption class="action-caption">{{ $t('dashboard.addNewProduct') || 'Voeg een nieuw product toe aan de voorraad' }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="arrow_forward" aria-hidden="true" />
                  </q-item-section>
                </q-item>

                <q-item 
                  clickable 
                  v-ripple 
                  @click="goToProducts"
                  class="action-item glass-card hover-lift"
                  role="listitem"
                  :aria-label="$t('dashboard.manageStock') || 'Voorraad beheren'"
                  tabindex="0"
                  @keydown.enter="goToProducts"
                  @keydown.space="goToProducts"
                >
                  <q-item-section avatar>
                    <q-icon name="inventory" color="secondary" class="action-icon icon-lg" aria-hidden="true" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="action-label">{{ $t('dashboard.manageStock') || 'Voorraad beheren' }}</q-item-label>
                    <q-item-label caption class="action-caption">{{ $t('dashboard.updateStockLevels') || 'Werk voorraadniveaus bij' }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="arrow_forward" aria-hidden="true" />
                  </q-item-section>
                </q-item>

                <q-item 
                  clickable 
                  v-ripple 
                  @click="$router.push({ name: 'orders' })"
                  class="action-item glass-card hover-lift"
                  role="listitem"
                  :aria-label="$t('dashboard.viewOrders') || 'Bestellingen bekijken'"
                  tabindex="0"
                  @keydown.enter="$router.push({ name: 'orders' })"
                  @keydown.space="$router.push({ name: 'orders' })"
                >
                  <q-item-section avatar>
                    <q-icon name="shopping_cart" color="warning" class="action-icon icon-lg" aria-hidden="true" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="action-label">{{ $t('dashboard.viewOrders') || 'Bestellingen bekijken' }}</q-item-label>
                    <q-item-label caption class="action-caption">{{ $t('dashboard.manageOrders') || 'Beheer bestellingen en leveringen' }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="arrow_forward" aria-hidden="true" />
                  </q-item-section>
                </q-item>
            </div>
            </q-card-section>
          </q-card>

        <!-- Recent Activity Card -->
        <q-card class="card-modern activity-card" role="region" aria-labelledby="recent-activity-title">
          <q-card-section class="card-header">
            <div class="card-title-section">
              <q-icon name="history" color="info" class="title-icon icon-lg" aria-hidden="true" />
              <div class="title-content">
                <h3 id="recent-activity-title" class="card-title">{{ $t('dashboard.recentActivity') }}</h3>
                <p class="card-subtitle">{{ $t('dashboard.latestUpdates') }}</p>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-content">
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon">
                  <q-icon name="add" color="positive" class="activity-item-icon" aria-hidden="true" />
                </div>
                <div class="activity-content">
                  <div class="activity-text">Added 50 units of Paracetamol</div>
                  <div class="activity-time">2 hours ago</div>
                </div>
              </div>
              
              <div class="activity-item">
                <div class="activity-icon">
                  <q-icon name="warning" color="warning" class="activity-item-icon" aria-hidden="true" />
                </div>
                <div class="activity-content">
                  <div class="activity-text">Low stock alert: Insulin</div>
                  <div class="activity-time">4 hours ago</div>
                </div>
              </div>
              
              <div class="activity-item">
                <div class="activity-icon">
                  <q-icon name="shopping_cart" color="info" class="activity-item-icon" aria-hidden="true" />
                </div>
                <div class="activity-content">
                  <div class="activity-text">New order created #ORD-2024-001</div>
                  <div class="activity-time">Yesterday</div>
                </div>
              </div>
        </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useClinicStore } from 'src/stores/clinic'
import { supabase } from 'src/boot/supabase'
import StockSummaryCard from 'src/components/StockSummaryCard.vue'
import PageLayout from 'src/components/PageLayout.vue'
import PageTitle from 'src/components/PageTitle.vue'

const router = useRouter()
const $q = useQuasar()
const { t: $t } = useI18n()
const authStore = useAuthStore()
const clinicStore = useClinicStore()

// State
const loading = ref(false)
const currentTime = ref(new Date().toLocaleTimeString())

// Dashboard data from Supabase
const totalProducts = ref(0)
const lowStockCount = ref(0)
const outOfStockCount = ref(0)
const reorderSuggestionsCount = ref(0)
const lowStockItems = ref<any[]>([])

// Computed properties
const userProfile = computed(() => authStore.userProfile)
const clinicName = computed(() => clinicStore.clinic?.name || 'Remka Demo Kliniek')

// Methods
const fetchDashboardData = async () => {
  const practiceId = authStore.clinicId
  
  if (!practiceId) {
    console.warn('No practice ID available')
    return
  }

  console.log('Fetching dashboard data for practice:', practiceId)
  
  try {
    // Fetch practice info to store
    await clinicStore.fetchClinic(practiceId)

    // Fetch products count
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('active', true)
    
    if (productsError) throw productsError
    totalProducts.value = products?.length || 0

    // Fetch order advice (low stock items)
    console.log('Calling get_order_advice with practice_uuid:', practiceId)
    const { data: orderAdvice, error: orderError } = await supabase
      .rpc('get_order_advice', { practice_uuid: practiceId })
    
    if (orderError) {
      console.error('Order advice error:', orderError)
      throw orderError
    }
    
    lowStockItems.value = orderAdvice || []
    lowStockCount.value = orderAdvice?.length || 0
    outOfStockCount.value = orderAdvice?.filter(item => item.current_stock === 0).length || 0

    // Fetch order suggestions count
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('order_suggestions')
      .select('id', { count: 'exact' })
      .eq('practice_id', practiceId)
    
    if (suggestionsError) throw suggestionsError
    reorderSuggestionsCount.value = suggestions?.length || 0

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load dashboard data',
      position: 'top'
    })
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await fetchDashboardData()
    $q.notify({
      type: 'positive',
      message: 'Data refreshed successfully',
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh data',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const goToProducts = () => {
  router.push({ name: 'products' })
}

// Update time every minute and fetch initial data
onMounted(async () => {
  const interval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 60000)
  
  // Fetch dashboard data when component mounts
  await fetchDashboardData()
  
  return () => clearInterval(interval)
})
</script>

<style lang="scss">
// Summary section
.summary-section {
  margin-bottom: var(--space-8);
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-6);
  }
}

// Content grid
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-8);
  align-items: start;
}

// Card styling
.content-card {
  .card-header {
    padding: var(--space-6);
    
    .card-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .card-title-section {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--space-3);
        
        .title-icon {
          flex-shrink: 0;
          // Font size handled by centralized icon system in app.scss
        }
        
        .title-content {
          flex: 1;
          min-width: 0;
        }
        
        h3.card-title {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--neutral-900);
          margin: 0;
          line-height: var(--leading-tight);
        }
        
        h2.card-title {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--neutral-900);
          margin: 0;
          line-height: var(--leading-tight);
        }
        
        .card-subtitle {
          font-size: var(--text-sm);
          color: var(--neutral-500);
          margin: 0;
          font-weight: var(--font-weight-normal);
          margin-top: var(--space-1);
        }
      }
      
      .options-btn {
        border-radius: var(--radius-lg);
        transition: all var(--transition-base);
        
        &:hover {
          background-color: var(--neutral-100);
        }
        
        &:focus {
          outline: 2px solid var(--brand-primary);
          outline-offset: 2px;
        }
      }
    }
  }
  
  .card-content {
    padding: 0;
    
    // Empty state
    .empty-state {
      text-align: center;
      padding: var(--space-16) var(--space-8);
      
      .empty-icon {
        margin-bottom: var(--space-6);
        
        .empty-state-icon {
          font-size: 64px;
          filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.1));
        }
      }
      
      .empty-title {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--brand-success);
        margin: 0 0 var(--space-2);
      }
      
      .empty-description {
        font-size: var(--text-base);
        color: var(--neutral-600);
        margin: 0 0 var(--space-6);
        max-width: 40ch;
        margin-left: auto;
        margin-right: auto;
      }
      
      .empty-actions {
        margin-top: var(--space-6);
      }
    }

    // Items list
    .items-list {
      padding: 0;
      
      .item-row {
        padding: var(--space-4) var(--space-6);
        border-bottom: 1px solid var(--neutral-100);
        transition: all var(--transition-base);
        
        &:hover {
          background-color: var(--neutral-50);
        }
        
        &.item-critical {
          background-color: rgba(239, 68, 68, 0.02);
          border-left: 4px solid var(--brand-danger);
        }
        
        .item-name {
          font-weight: var(--font-weight-medium);
          font-size: var(--text-base);
          color: var(--neutral-900);
        }
        
        .item-sku {
          font-size: var(--text-sm);
          color: var(--neutral-500);
        }
        
        .product-avatar {
          width: 40px;
          height: 40px;
          
          .product-icon {
            font-size: 20px;
          }
        }
        
        .item-stock {
          text-align: right;
          
          .stock-info {
            .stock-numbers {
              display: flex;
              align-items: center;
              gap: var(--space-1);
              margin-bottom: var(--space-1);
              
              .current-stock {
                font-weight: var(--font-weight-bold);
                font-size: var(--text-base);
              }
              
              .stock-separator {
                color: var(--neutral-400);
                margin: 0 var(--space-1);
              }
              
              .min-stock {
                font-size: var(--text-sm);
                color: var(--neutral-500);
              }
            }
            
            .stock-labels {
              .stock-label {
                font-size: var(--text-xs);
                color: var(--neutral-400);
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
            }
          }
        }
        
        .action-btn {
          opacity: 0.7;
          transition: all var(--transition-base);
          
          &:hover {
            opacity: 1;
            transform: translateX(2px);
          }
        }
      }
    }
    
    .view-more {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--neutral-100);
      text-align: center;
      
      .view-more-btn {
        font-weight: var(--font-weight-medium);
        
        &:hover {
          background-color: var(--brand-primary);
          color: white;
        }
      }
    }
  }
}

// Sidebar content
.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  
  .actions-card {
    .card-header {
      padding: var(--space-5);
    }
    
    .actions-list {
      padding: 0;
      
      .action-item {
        padding: var(--space-4) var(--space-5);
        border-bottom: 1px solid var(--neutral-100);
        transition: all var(--transition-base);
        cursor: pointer;
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-2);
        
        &:hover, &.hover-lift:hover {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        &:active {
          transform: translateY(-1px);
          transition-duration: 100ms;
        }
        
        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        // Ensure proper icon sizing in avatar section
        .q-item__section--avatar {
          min-width: 48px;
          
          .q-icon {
            font-size: 24px;
          }
        }
        
        // Ensure proper icon sizing in side section  
        .q-item__section--side {
          .q-icon {
            font-size: 16px;
            opacity: 0.7;
            transition: all var(--transition-base);
          }
        }
        
        &:hover .q-item__section--side .q-icon {
          opacity: 1;
          transform: translateX(2px);
        }
        
        .action-label {
          font-weight: var(--font-weight-medium);
          color: var(--neutral-900);
          font-size: var(--text-base);
        }
        
        .action-caption {
          font-size: var(--text-sm);
          color: var(--neutral-500);
        }
      }
    }
  }
  
  .stats-card {
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      padding: var(--space-5);
      
      .stat-item {
        text-align: center;
        padding: var(--space-4);
        border-radius: var(--radius-lg);
        background: var(--neutral-50);
        
        .stat-number {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--brand-primary);
          margin-bottom: var(--space-1);
        }
        
        .stat-label {
          font-size: var(--text-sm);
          color: var(--neutral-600);
          margin: 0;
        }
      }
    }
  }
  
  .activity-card {
    .activity-list {
      padding: var(--space-4);
      
      .activity-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) 0;
        border-bottom: 1px solid var(--neutral-100);
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--neutral-100);
          flex-shrink: 0;
          
          .activity-item-icon {
            font-size: 16px;
          }
        }
        
        .activity-content {
          flex: 1;
          
          .activity-text {
            font-size: var(--text-sm);
            font-weight: var(--font-weight-medium);
            color: var(--neutral-900);
            margin-bottom: var(--space-1);
          }
          
          .activity-time {
            font-size: var(--text-xs);
            color: var(--neutral-500);
          }
        }
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  
  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-4);
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .sidebar-content .stats-card .stats-grid {
    grid-template-columns: 1fr;
  }
}

// Dark mode adjustments
body.body--dark {
  .item-row {
    border-bottom-color: var(--neutral-300);
    
    &:hover {
      background-color: var(--neutral-200);
    }
    
    &.item-critical {
      background-color: rgba(239, 68, 68, 0.05);
    }
    
    .item-name {
      color: var(--neutral-900);
    }
    
    .item-sku {
      color: var(--neutral-600);
    }
  }
  
  .view-more {
    border-top-color: var(--neutral-300);
  }
  
  .action-item {
    border-bottom-color: var(--neutral-300);
    
    &:hover {
      background-color: var(--neutral-200);
    }
    
    .action-title {
      color: var(--neutral-900);
    }
    
    .action-description {
      color: var(--neutral-600);
    }
  }
  
  .stat-item {
    background: var(--neutral-200);
    
    .stat-label {
      color: var(--neutral-500);
    }
  }
  
  .options-btn:hover {
    background-color: var(--neutral-200);
  }
  
  h3.card-title {
    color: var(--neutral-900);
    font-size: var(--text-lg);
  }
  
  .card-subtitle {
    color: var(--neutral-600);
  }
  
  .empty-description {
    color: var(--neutral-600);
  }
  
  .empty-title {
    color: var(--brand-success);
  }
}

// Animation enhancements
.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Enhanced button styling for dashboard
:deep(.btn-modern) {
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.025em;
  transition: all var(--transition-base);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  // Primary outline button styling with enhanced colors
  &.q-btn--outline.q-btn--standard {
    border-width: 2px;
    border-color: var(--brand-primary);
    color: var(--brand-primary);
    
    &:hover {
      background: var(--brand-primary);
      color: white;
      border-color: var(--brand-primary);
      box-shadow: var(--shadow-lg);
    }
  }
}

// Screen reader only content
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

// Focus styles for interactive elements
.item-row:focus {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
  background-color: var(--neutral-50);
}

.action-item:focus {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
  background-color: var(--neutral-50);
  transform: translateY(-2px);
}

.view-more-btn:focus {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
</style> 