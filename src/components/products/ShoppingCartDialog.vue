<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <q-card class="shopping-cart-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t("productsPage.cart.title") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="cart-content">
        <!-- Cart is empty -->
        <div v-if="cartItems.length === 0" class="text-center q-pa-lg">
          <q-icon name="shopping_cart" size="4rem" color="grey-5" />
          <div class="text-h6 q-mt-md text-grey-7">
            {{ $t("productsPage.cart.empty") }}
          </div>
        </div>

        <!-- Cart items -->
        <div v-else>
          <!-- Cart summary -->
          <div class="cart-summary q-mb-lg">
            <q-card flat bordered>
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-subtitle1">
                      {{ $t("productsPage.cart.totalItems") }}: {{ totalItems }}
                    </div>
                    <div class="text-h5 text-primary">
                      {{ formatPrice(cartTotal) }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-btn
                      :label="$t('productsPage.cart.clear')"
                      icon="clear_all"
                      color="grey-7"
                      outline
                      @click="confirmClearCart"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Cart items list -->
          <q-list separator>
            <q-item
              v-for="item in cartItems"
              :key="`${item.product_id}-${item.supplier_id || 'default'}`"
              class="cart-item"
            >
              <q-item-section avatar>
                <q-avatar size="60px" rounded>
                  <q-img
                    v-if="item.product.image_url"
                    :src="item.product.image_url"
                    :alt="item.product.name"
                  />
                  <q-icon v-else name="inventory_2" size="2rem" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  item.product.name
                }}</q-item-label>
                <q-item-label caption>{{ item.product.sku }}</q-item-label>
                <q-item-label v-if="item.supplier_id" caption>
                  {{ $t("productsPage.details.supplier") }}:
                  {{ item.supplier_id }}
                </q-item-label>
                <q-item-label caption>
                  {{ $t("productsPage.cart.unitPrice") }}:
                  {{ formatPrice(item.unit_price || 0) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="column items-end q-gutter-sm">
                  <!-- Quantity controls -->
                  <div class="row items-center q-gutter-sm">
                    <q-btn
                      icon="remove"
                      size="sm"
                      round
                      flat
                      @click="decreaseQuantity(item)"
                    />
                    <q-input
                      :model-value="item.quantity"
                      type="number"
                      min="1"
                      dense
                      outlined
                      style="width: 80px"
                      @update:model-value="
                        updateQuantity(item, parseInt($event as string))
                      "
                    />
                    <q-btn
                      icon="add"
                      size="sm"
                      round
                      flat
                      @click="increaseQuantity(item)"
                    />
                  </div>

                  <!-- Total price -->
                  <div class="text-weight-medium">
                    {{ formatPrice((item.unit_price || 0) * item.quantity) }}
                  </div>

                  <!-- Remove button -->
                  <q-btn
                    icon="delete"
                    size="sm"
                    flat
                    round
                    color="negative"
                    @click="removeItem(item)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <!-- Cart actions -->
      <q-card-actions v-if="cartItems.length > 0" align="right" class="q-pa-md">
        <q-btn :label="$t('common.cancel')" flat color="grey" v-close-popup />
        <q-btn
          :label="$t('productsPage.cart.checkout')"
          icon="shopping_cart_checkout"
          color="primary"
          @click="checkout"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import type { CartItem } from 'src/types/inventory';

interface Props {
  modelValue: boolean;
  cartItems: CartItem[];
  cartTotal: number;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'updateQuantity',
    productId: string,
    quantity: number,
    supplierId?: string
  ): void;
  (e: 'removeItem', productId: string, supplierId?: string): void;
  (e: 'clearCart'): void;
  (e: 'checkout'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const $q = useQuasar();

// Computed properties
const totalItems = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.quantity, 0);
});

// Methods
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

const updateQuantity = (item: CartItem, quantity: number) => {
  if (quantity > 0) {
    emit('updateQuantity', item.product_id, quantity, item.supplier_id);
  }
};

const increaseQuantity = (item: CartItem) => {
  updateQuantity(item, item.quantity + 1);
};

const decreaseQuantity = (item: CartItem) => {
  if (item.quantity > 1) {
    updateQuantity(item, item.quantity - 1);
  }
};

const removeItem = (item: CartItem) => {
  $q.dialog({
    title: t('common.confirm'),
    message: t('productsPage.cart.remove') + ': ' + item.product.name,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit('removeItem', item.product_id, item.supplier_id);
  });
};

const confirmClearCart = () => {
  $q.dialog({
    title: t('productsPage.cart.clear'),
    message: 'Weet je zeker dat je de winkelwagen wilt legen?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit('clearCart');
  });
};

const checkout = () => {
  emit('checkout');
};
</script>

<style lang="scss" scoped>
.shopping-cart-dialog {
  width: 100%;
  max-width: 100%;
  height: 100%;

  .cart-content {
    flex: 1;
    overflow-y: auto;
  }

  .cart-item {
    min-height: 100px;
  }

  .cart-summary {
    position: sticky;
    top: 0;
    z-index: 1;
    background: white;
  }
}
</style>
