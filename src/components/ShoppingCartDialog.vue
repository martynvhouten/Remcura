<template>
  <BaseDialog
    v-model="dialogOpen"
    :title="$t('bestellijsten.shoppingCart')"
    :subtitle="cart?.name || $t('bestellijsten.newOrder')"
    icon="shopping_cart"
    maximized
    transition-show="slide-left"
    transition-hide="slide-right"
    variant="modern"
    size="xl"
    content-class="cart-content"
    actions-class="cart-actions-content"
    @close="handleClose"
  >
        <!-- Empty State -->
        <div v-if="!cart?.shopping_cart_items?.length" class="empty-cart">
          <q-icon name="shopping_cart" size="4em" color="grey-4" class="q-mb-md" />
          <h6 class="text-h6 text-grey-6 q-ma-none q-mb-md">{{ $t('bestellijsten.cartEmpty') }}</h6>
          <p class="text-body2 text-grey-6">
            {{ $t('bestellijsten.addItemsToCart') || 'Add items from your order list to get started' }}
          </p>
        </div>

        <!-- Cart Items -->
        <div v-else>
          <div class="cart-summary q-mb-lg">
            <q-card flat class="summary-card">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6">{{ cartItemCount }} {{ $t('bestellijsten.cartItems') }}</div>
                    <div class="text-body2 text-grey-6">{{ $t('bestellijsten.readyToOrder') || 'Ready to order' }}</div>
                  </div>
                  <div class="col-auto">
                    <q-btn
                      color="negative"
                      flat
                      icon="clear_all"
                      :label="$t('bestellijsten.clearCart')"
                      @click="confirmClearCart"
                      no-caps
                      class="btn-modern"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <q-list class="cart-items-list">
            <q-item
              v-for="item in cart.shopping_cart_items"
              :key="item.id"
              class="cart-item"
            >
              <q-item-section avatar>
                <q-avatar size="48px" color="grey-3" text-color="grey-7">
                  <q-icon name="inventory_2" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ item.products?.name || $t('common.unknownProduct') }}
                </q-item-label>
                <q-item-label caption>
                  {{ item.products?.sku }} • {{ item.products?.unit }}
                </q-item-label>
                <q-item-label caption v-if="item.notes" class="text-italic">
                  {{ item.notes }}
                </q-item-label>
              </q-item-section>

              <q-item-section side class="quantity-section">
                <div class="quantity-controls">
                  <q-btn
                    flat
                    round
                    dense
                    icon="remove"
                    @click="decreaseQuantity(item)"
                    :disable="item.quantity <= 1"
                  />
                  <q-input
                    v-model.number="item.quantity"
                    type="number"
                    dense
                    outlined
                    @blur="updateQuantity(item)"
                    @keyup.enter="updateQuantity(item)"
                    class="quantity-input"
                    min="1"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="add"
                    @click="increaseQuantity(item)"
                  />
                </div>
                
                <div class="text-caption text-center q-mt-xs">
                  <q-chip
                    size="sm"
                    :color="getSuggestionColor(item)"
                    text-color="white"
                    v-if="item.suggested_by !== 'manual'"
                  >
                    {{ getSuggestionLabel(item.suggested_by) }}
                  </q-chip>
                </div>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="confirmRemoveItem(item)"
                >
                  <q-tooltip>{{ $t('bestellijsten.removeFromCart') }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

    <!-- Dialog Actions -->
    <template #actions>
      <div class="cart-actions-grid">
        <div class="left-actions">
          <q-btn
            flat
            :label="$t('common.cancel')"
            @click="handleClose"
            no-caps
            class="btn-modern"
          />
          <q-btn
            flat
            icon="save"
            :label="$t('bestellijsten.saveCart')"
            @click="saveCart"
            :loading="saving"
            color="secondary"
            no-caps
            class="btn-modern"
          />
        </div>
        
        <q-btn
          color="primary"
          icon="send"
          :label="$t('bestellijsten.submitOrder')"
          @click="submitOrder"
          :disable="!cart?.shopping_cart_items?.length"
          :loading="submitting"
          unelevated
          no-caps
          class="btn-modern"
        />
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useButtons } from 'src/composables/useButtons'
import { useBestellijstenStore } from 'src/stores/bestellijsten'
import BaseDialog from './base/BaseDialog.vue'
import type { ShoppingCartWithItems, ShoppingCartItem } from 'src/types/supabase'

interface Props {
  modelValue: boolean
  cart?: ShoppingCartWithItems | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'order-submitted', cart: ShoppingCartWithItems): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const $q = useQuasar()
const { quickActions, buttonGroups } = useButtons()

// Button configurations
const clearBtn = computed(() => quickActions.clearAll())
const addToCartBtn = computed(() => quickActions.save())
const dialogButtons = computed(() => buttonGroups.dialogActions('Sluiten'))
const bestellijstenStore = useBestellijstenStore()

// State
const saving = ref(false)
const submitting = ref(false)

// Computed
const cartItemCount = computed(() => {
  return props.cart?.shopping_cart_items?.reduce((total, item) => total + item.quantity, 0) || 0
})

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const handleClose = () => {
  emit('update:modelValue', false)
}

const updateQuantity = async (item: ShoppingCartItem) => {
  if (item.quantity < 1) {
    item.quantity = 1
    return
  }

  const result = await bestellijstenStore.updateCartItemQuantity(item.id, item.quantity)
  
  if (!result.success) {
    $q.notify({
      type: 'negative',
      message: result.error || t('bestellijsten.errorUpdatingCart')
    })
  }
}

const increaseQuantity = async (item: ShoppingCartItem) => {
  item.quantity += 1
  await updateQuantity(item)
}

const decreaseQuantity = async (item: ShoppingCartItem) => {
  if (item.quantity > 1) {
    item.quantity -= 1
    await updateQuantity(item)
  }
}

const confirmRemoveItem = (item: ShoppingCartItem) => {
  $q.dialog({
    title: t('bestellijsten.removeFromCart'),
    message: t('bestellijsten.confirmRemoveFromCart') || 'Are you sure you want to remove this item from your cart?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await bestellijstenStore.removeFromShoppingCart(item.id)
    
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: t('bestellijsten.itemRemoved') || 'Item removed from cart'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: result.error
      })
    }
  })
}

const confirmClearCart = () => {
  $q.dialog({
          title: t('bestellijsten.clearCart'),
    message: t('bestellijsten.confirmClearCart') || 'Are you sure you want to remove all items from your cart?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    if (!props.cart?.shopping_cart_items) return

    for (const item of props.cart.shopping_cart_items) {
      await bestellijstenStore.removeFromShoppingCart(item.id)
    }

    $q.notify({
      type: 'positive',
              message: t('bestellijsten.cartCleared')
    })
  })
}

const getSuggestionColor = (item: ShoppingCartItem): string => {
  switch (item.suggested_by) {
    case 'automatic': return 'info'
    case 'scan': return 'secondary'
    default: return 'grey'
  }
}

const getSuggestionLabel = (suggestedBy: string): string => {
  switch (suggestedBy) {
    case 'automatic': return t('bestellijsten.autoSuggested') || 'Auto'
    case 'scan': return t('bestellijsten.scanned') || 'Scanned'
    default: return t('bestellijsten.manual') || 'Manual'
  }
}

const saveCart = async () => {
  if (!props.cart) return

  saving.value = true
  try {
    // TODO: Implement save cart functionality
    $q.notify({
      type: 'positive',
              message: t('bestellijsten.cartSaved')
    })
  } finally {
    saving.value = false
  }
}

const submitOrder = async () => {
  if (!props.cart) return

  submitting.value = true
  try {
    // TODO: Implement submit order functionality
    // For now, just show success message and emit event
    
    $q.notify({
      type: 'positive',
      message: t('bestellijsten.orderSubmitted')
    })
    
    emit('order-submitted', props.cart)
    emit('update:modelValue', false)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('bestellijsten.errorSubmittingOrder') || 'Error submitting order'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cart-content {
  flex: 1;
  overflow-y: auto;
}

.cart-actions-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: var(--space-4);
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: var(--space-3);
  }
}

.left-actions {
  display: flex;
  gap: var(--space-3);
  
  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
}

.summary-card {
  background: rgba(var(--q-primary-rgb), 0.05);
  border-radius: 12px;
}

.cart-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.cart-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quantity-section {
  min-width: 120px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input {
  width: 60px;
}

.quantity-input :deep(.q-field__control) {
  text-align: center;
}

.cart-actions {
  background: rgba(0, 0, 0, 0.02);
  padding: 1rem 1.5rem;
}
</style> 