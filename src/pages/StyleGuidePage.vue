<template>
  <PageLayout>
    <PageTitle 
      :title="$t('settings.styleGuideTitle')" 
      :subtitle="$t('settings.styleGuideSubtitle')"
      icon="palette"
    />

    <!-- Color System -->
    <div class="style-section">
      <h2 class="section-title">🎨 {{ $t('settings.colorsSection') }}</h2>
      
      <!-- Brand Colors -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.primaryColors') }}</h3>
        <div class="color-grid">
          <div class="color-card">
            <div class="color-swatch" style="background: var(--brand-primary)"></div>
            <div class="color-info">
              <div class="color-name">Primary</div>
              <div class="color-value">#1e3a8a</div>
              <div class="color-usage">Main brand color, buttons, links</div>
            </div>
          </div>
          <div class="color-card">
            <div class="color-swatch" style="background: var(--brand-primary-light)"></div>
            <div class="color-info">
              <div class="color-name">Primary Light</div>
              <div class="color-value">#3b82f6</div>
              <div class="color-usage">Hover states, accents</div>
            </div>
          </div>
          <div class="color-card">
            <div class="color-swatch" style="background: var(--brand-secondary)"></div>
            <div class="color-info">
              <div class="color-name">Secondary</div>
              <div class="color-value">#0f766e</div>
              <div class="color-usage">Secondary actions, teal theme</div>
            </div>
          </div>
          <div class="color-card">
            <div class="color-swatch" style="background: var(--brand-accent)"></div>
            <div class="color-info">
              <div class="color-name">Accent</div>
              <div class="color-value">#0d9488</div>
              <div class="color-usage">Highlights, medical teal</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Semantic Colors -->
      <div class="subsection">
        <h3 class="subsection-title">Semantic Colors</h3>
        <div class="color-grid">
          <div class="color-card">
            <div class="color-swatch" style="background: var(--brand-success)"></div>
            <div class="color-info">
              <div class="color-name">Success</div>
              <div class="color-value">#065f46</div>
              <div class="color-usage">Success states, positive actions</div>
            </div>
          </div>
          <div class="color-card">
            <div class="color-swatch" style="background: var(--brand-warning)"></div>
            <div class="color-info">
              <div class="color-name">Warning</div>
              <div class="color-value">#d97706</div>
              <div class="color-usage">Warning messages, alerts</div>
            </div>
          </div>
          <div class="color-card">
            <div class="color-swatch" style="background: var(--brand-danger)"></div>
            <div class="color-info">
              <div class="color-name">Danger</div>
              <div class="color-value">#b91c1c</div>
              <div class="color-usage">Error states, destructive actions</div>
            </div>
          </div>
          <div class="color-card">
            <div class="color-swatch" style="background: var(--brand-info)"></div>
            <div class="color-info">
              <div class="color-name">Info</div>
              <div class="color-value">#1e40af</div>
              <div class="color-usage">Informational messages</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Neutral Palette -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.neutralColors') }}</h3>
        <div class="neutral-grid">
          <div v-for="(color, index) in neutralColors" :key="index" class="neutral-card">
            <div class="neutral-swatch" :style="`background: var(--neutral-${color.value})`"></div>
            <div class="neutral-info">
              <div class="neutral-name">{{ color.name }}</div>
              <div class="neutral-value">--neutral-{{ color.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Typography System -->
    <div class="style-section">
      <h2 class="section-title">📝 {{ $t('settings.typographySection') }}</h2>
      
      <div class="subsection">
        <h3 class="subsection-title">Text Sizes</h3>
        <div class="typography-showcase">
          <div class="text-h1">Heading 1 - 2.25rem (36px)</div>
          <div class="text-h2">Heading 2 - 1.875rem (30px)</div>
          <div class="text-h3">Heading 3 - 1.5rem (24px)</div>
          <div class="text-h4">Heading 4 - 1.25rem (20px)</div>
          <div class="text-h5">Heading 5 - 1.125rem (18px)</div>
          <div class="text-h6">Heading 6 - 1rem (16px)</div>
          <div style="font-size: var(--text-base)">Body Text - 1rem (16px)</div>
          <div style="font-size: var(--text-sm)">Small Text - 0.875rem (14px)</div>
          <div style="font-size: var(--text-xs)">Extra Small - 0.75rem (12px)</div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Font Weights</h3>
        <div class="typography-showcase">
          <div style="font-weight: var(--font-weight-normal)">Normal Weight (400)</div>
          <div style="font-weight: var(--font-weight-medium)">Medium Weight (500)</div>
          <div style="font-weight: var(--font-weight-semibold)">Semibold Weight (600)</div>
          <div style="font-weight: var(--font-weight-bold)">Bold Weight (700)</div>
        </div>
      </div>
    </div>

    <!-- Button System -->
    <div class="style-section">
      <h2 class="section-title">🔘 {{ $t('settings.buttonsSection') }}</h2>
      
      <!-- Standard Buttons -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.solidButtons') }}</h3>
        <div class="button-showcase">
          <q-btn label="Primary" color="primary" class="btn-modern" />
          <q-btn label="Secondary" color="secondary" class="btn-modern" />
          <q-btn label="Success" color="positive" class="btn-modern" />
          <q-btn label="Warning" color="warning" class="btn-modern" />
          <q-btn label="Danger" color="negative" class="btn-modern" />
          <q-btn label="Info" color="info" class="btn-modern" />
        </div>
      </div>

      <!-- Outline Buttons -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.outlinedButtons') }}</h3>
        <div class="button-showcase">
          <q-btn label="Primary" outline color="primary" class="btn-modern" />
          <q-btn label="Secondary" outline color="secondary" class="btn-modern" />
          <q-btn label="Success" outline color="positive" class="btn-modern" />
          <q-btn label="Warning" outline color="warning" class="btn-modern" />
          <q-btn label="Danger" outline color="negative" class="btn-modern" />
          <q-btn label="Info" outline color="info" class="btn-modern" />
        </div>
      </div>

      <!-- Flat Buttons -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.flatButtons') }}</h3>
        <div class="button-showcase">
          <q-btn label="Primary" flat color="primary" class="btn-modern" />
          <q-btn label="Secondary" flat color="secondary" class="btn-modern" />
          <q-btn label="Success" flat color="positive" class="btn-modern" />
          <q-btn label="Warning" flat color="warning" class="btn-modern" />
          <q-btn label="Danger" flat color="negative" class="btn-modern" />
          <q-btn label="Info" flat color="info" class="btn-modern" />
        </div>
      </div>

      <!-- Button with Icons -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.iconButtons') }}</h3>
        <div class="button-showcase">
          <q-btn label="Add Product" icon="add" color="primary" class="btn-modern" />
          <q-btn label="Edit" icon="edit" color="secondary" class="btn-modern" />
          <q-btn label="Delete" icon="delete" color="negative" class="btn-modern" />
          <q-btn label="Save" icon="save" color="positive" class="btn-modern" />
          <q-btn label="Download" icon="download" color="info" class="btn-modern" />
        </div>
      </div>
    </div>

    <!-- Card Variants -->
    <div class="style-section">
      <h2 class="section-title">🃏 {{ $t('settings.cardsSection') }}</h2>
      
      <div class="card-showcase">
        <!-- Default Card -->
        <BaseCard 
          variant="default" 
          title="Default Card" 
          subtitle="Standard card for general content"
          icon="article"
        >
          <p>This is a default card with standard styling and layout.</p>
        </BaseCard>

        <!-- Elevated Card -->
        <BaseCard 
          variant="elevated" 
          title="Elevated Card" 
          subtitle="Card with enhanced shadow for emphasis"
          icon="star"
          header-color="primary"
        >
          <p>This card has elevated styling with enhanced shadows.</p>
        </BaseCard>

        <!-- Outlined Card -->
        <BaseCard 
          variant="outlined" 
          title="Outlined Card" 
          subtitle="Card with border emphasis"
          icon="border_style"
          header-color="secondary"
          size="sm"
        >
          <p>This card uses borders instead of shadows for definition.</p>
        </BaseCard>
      </div>
    </div>

    <!-- Page-Specific Components -->
    <div class="style-section">
      <h2 class="section-title">📋 Page-Specific Components</h2>
      
      <!-- Inventory Management Components -->
      <div class="subsection">
        <h3 class="subsection-title">📦 Inventory Management (ProductsPage)</h3>
        <p class="component-description">
          Components optimized for <strong>monitoring and configuration</strong> - designed for scanning information quickly and making settings adjustments.
        </p>
        
        <div class="component-showcase">
          <!-- Stock Settings Row Demo -->
          <div class="component-demo">
            <h4 class="demo-title">StockSettingsRow</h4>
            <p class="demo-description">Compact row for viewing and editing stock settings with inline controls</p>
            
            <div class="demo-table">
              <table class="inventory-demo-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Huidige</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Status</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="demo-row stock-ok">
                    <td>
                      <div class="product-info">
                        <div class="product-name">Handschoenen Latex</div>
                        <div class="product-description">Steriele onderzoekshandschoenen</div>
                      </div>
                    </td>
                    <td class="sku-text">LAT-001</td>
                    <td class="stock-display">45</td>
                    <td class="stock-display">10</td>
                    <td class="stock-display">100</td>
                    <td>
                      <q-chip color="positive" text-color="white" size="sm" icon="check_circle">
                        OK
                      </q-chip>
                    </td>
                    <td>
                      <q-btn flat dense round icon="edit" color="primary" size="sm" />
                    </td>
                  </tr>
                  <tr class="demo-row stock-warning">
                    <td>
                      <div class="product-info">
                        <div class="product-name">Wegwerp Mondkapjes</div>
                      </div>
                    </td>
                    <td class="sku-text">MK-050</td>
                    <td class="stock-display warning">8</td>
                    <td class="stock-display">10</td>
                    <td class="stock-display">200</td>
                    <td>
                      <q-chip color="warning" text-color="white" size="sm" icon="warning">
                        Laag
                      </q-chip>
                    </td>
                    <td>
                      <q-btn flat dense round icon="edit" color="primary" size="sm" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="feature-list">
              <h5>Features:</h5>
              <ul>
                <li>✅ Compact, scan-optimized design</li>
                <li>✅ Inline editing for min/max stock</li>
                <li>✅ Color-coded status indicators</li>
                <li>✅ No ordering functionality</li>
                <li>✅ Focus on monitoring and configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Preparation Components -->
      <div class="subsection">
        <h3 class="subsection-title">🛒 Order Preparation (BestellijstenPage)</h3>
        <p class="component-description">
          Components optimized for <strong>action and ordering</strong> - designed for product selection, quantity input, and order management.
        </p>
        
        <div class="component-showcase">
          <!-- Product Selection Row Demo -->
          <div class="component-demo">
            <h4 class="demo-title">ProductSelectionRow</h4>
            <p class="demo-description">Interactive row for selecting products and setting order quantities</p>
            
            <div class="demo-table">
              <table class="order-demo-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Product</th>
                    <th>Huidige</th>
                    <th>Min</th>
                    <th>Voorstel</th>
                    <th>Bestel Aantal</th>
                    <th>Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="demo-row row-selected">
                    <td>
                      <q-checkbox v-model="demoSelected1" color="orange" />
                    </td>
                    <td>
                      <div class="product-info">
                        <div class="product-name">Handschoenen Latex</div>
                        <div class="supplier-info">
                          <q-icon name="store" size="xs" />
                          <span>MedSupply B.V.</span>
                        </div>
                      </div>
                    </td>
                    <td class="stock-number">8</td>
                    <td class="stock-number">10</td>
                    <td>
                      <q-chip color="orange" text-color="white" size="sm" icon="lightbulb">
                        92
                      </q-chip>
                    </td>
                    <td>
                      <div class="quantity-input-demo">
                        <q-input v-model="demoQuantity1" type="number" dense outlined style="width: 60px;" />
                      </div>
                    </td>
                    <td class="total-amount">€184.00</td>
                  </tr>
                  <tr class="demo-row row-suggested">
                    <td>
                      <q-checkbox v-model="demoSelected2" color="orange" />
                    </td>
                    <td>
                      <div class="product-info">
                        <div class="product-name">Wegwerp Mondkapjes</div>
                      </div>
                    </td>
                    <td class="stock-number warning">5</td>
                    <td class="stock-number">10</td>
                    <td>
                      <q-chip color="orange" text-color="white" size="sm" icon="lightbulb">
                        195
                      </q-chip>
                    </td>
                    <td>
                      <div class="quantity-input-demo">
                        <q-input v-model="demoQuantity2" type="number" dense outlined style="width: 60px;" />
                      </div>
                    </td>
                    <td class="total-none">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="feature-list">
              <h5>Features:</h5>
              <ul>
                <li>🛒 Product selection checkboxes</li>
                <li>🛒 Quantity input with increment/decrement</li>
                <li>🛒 Suggested quantities based on stock levels</li>
                <li>🛒 Price and total calculations</li>
                <li>🛒 Orange accent color for ordering context</li>
                <li>🛒 Mobile-optimized input controls</li>
              </ul>
            </div>
          </div>

          <!-- Order Quantity Input Demo -->
          <div class="component-demo">
            <h4 class="demo-title">OrderQuantityInput</h4>
            <p class="demo-description">Specialized input for order quantities with suggestions and quick-add buttons</p>
            
            <div class="demo-container">
              <div class="quantity-input-showcase">
                <OrderQuantityInput
                  v-model="demoOrderQuantity"
                  :suggested="50"
                  :max-stock="200"
                />
              </div>
            </div>

            <div class="feature-list">
              <h5>Features:</h5>
              <ul>
                <li>➕➖ Increment/decrement buttons</li>
                <li>💡 Suggested quantity quick-fill</li>
                <li>🔢 Number input validation</li>
                <li>🎯 Orange color theme for ordering</li>
                <li>📱 Mobile-optimized touch targets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Layout Distinction -->
      <div class="subsection">
        <h3 class="subsection-title">🎨 Visual & Functional Distinction</h3>
        
        <div class="distinction-showcase">
          <div class="distinction-card inventory-theme">
            <h4>📦 ProductsPage (Inventory)</h4>
            <div class="theme-colors">
              <div class="color-sample primary">Primary Blue</div>
              <div class="color-sample neutral">Neutral Grays</div>
            </div>
            <div class="theme-purpose">
              <strong>Purpose:</strong> Monitor & Configure<br>
              <strong>Actions:</strong> View, Edit Settings<br>
              <strong>Focus:</strong> Information scanning
            </div>
          </div>

          <div class="distinction-card ordering-theme">
            <h4>🛒 BestellijstenPage (Ordering)</h4>
            <div class="theme-colors">
              <div class="color-sample orange">Orange Accents</div>
              <div class="color-sample interactive">Interactive Elements</div>
            </div>
            <div class="theme-purpose">
              <strong>Purpose:</strong> Select & Order<br>
              <strong>Actions:</strong> Choose, Quantity, Submit<br>
              <strong>Focus:</strong> Decision making & action
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Component Usage Guidelines -->
    <div class="style-section">
      <h2 class="section-title">📖 Component Usage Guidelines</h2>
      
      <div class="guidelines-grid">
        <div class="guideline-card">
          <h4>✅ Do Use StockSettingsRow When:</h4>
          <ul>
            <li>Displaying inventory overview</li>
            <li>Allowing inline stock configuration</li>
            <li>Monitoring stock status</li>
            <li>Scanning information quickly</li>
          </ul>
        </div>

        <div class="guideline-card">
          <h4>✅ Do Use ProductSelectionRow When:</h4>
          <ul>
            <li>Building order lists</li>
            <li>Selecting products for purchase</li>
            <li>Setting order quantities</li>
            <li>Preparing orders for submission</li>
          </ul>
        </div>

        <div class="guideline-card avoid">
          <h4>❌ Avoid:</h4>
          <ul>
            <li>Using ordering components on inventory pages</li>
            <li>Mixing blue and orange themes</li>
            <li>Adding selection checkboxes to monitoring views</li>
            <li>Using compact displays for order preparation</li>
          </ul>
        </div>

        <div class="guideline-card best-practice">
          <h4>🎯 Best Practices:</h4>
          <ul>
            <li>Keep ProductsPage compact and scan-friendly</li>
            <li>Make BestellijstenPage action-oriented</li>
            <li>Use consistent color coding (blue = info, orange = action)</li>
            <li>Optimize for mobile on ordering interfaces</li>
          </ul>
        </div>
      </div>  
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from 'src/components/PageLayout.vue'
import PageTitle from 'src/components/PageTitle.vue'
import BaseCard from 'src/components/base/BaseCard.vue'
import StockStatusChip from 'src/components/StockStatusChip.vue'
import OrderQuantityInput from 'src/components/OrderQuantityInput.vue'

// Neutral colors data
const neutralColors = [
  { name: 'Neutral 50', value: '50' },
  { name: 'Neutral 100', value: '100' },
  { name: 'Neutral 200', value: '200' },
  { name: 'Neutral 300', value: '300' },
  { name: 'Neutral 400', value: '400' },
  { name: 'Neutral 500', value: '500' },
  { name: 'Neutral 600', value: '600' },
  { name: 'Neutral 700', value: '700' },
  { name: 'Neutral 800', value: '800' },
  { name: 'Neutral 900', value: '900' },
]

// Demo component data
const demoSelected1 = ref(true)
const demoSelected2 = ref(false)
const demoQuantity1 = ref(92)
const demoQuantity2 = ref(0)
const demoOrderQuantity = ref(15)
</script>

<style scoped lang="scss">
.style-section {
  margin-bottom: var(--space-12);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--brand-primary);
  margin-bottom: var(--space-8);
  border-bottom: 2px solid var(--brand-primary);
  padding-bottom: var(--space-3);
}

.subsection {
  margin-bottom: var(--space-8);
}

.subsection-title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-700);
  margin-bottom: var(--space-4);
}

// Color System Styles
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.color-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-base);
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.color-info {
  flex: 1;
}

.color-name {
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-900);
  margin-bottom: var(--space-1);
}

.color-value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: var(--text-sm);
  color: var(--neutral-600);
  margin-bottom: var(--space-1);
}

.color-usage {
  font-size: var(--text-xs);
  color: var(--neutral-500);
}

// Neutral Colors
.neutral-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
}

.neutral-card {
  text-align: center;
  padding: var(--space-3);
  background: var(--neutral-50);
  border-radius: var(--radius-base);
  border: 1px solid var(--neutral-200);
}

.neutral-swatch {
  width: 100%;
  height: 60px;
  border-radius: var(--radius-base);
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: var(--space-2);
}

.neutral-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--neutral-900);
}

.neutral-value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: var(--text-xs);
  color: var(--neutral-600);
}

// Typography
.typography-showcase {
  padding: var(--space-6);
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);

  > * {
    margin-bottom: var(--space-3);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Buttons
.button-showcase {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
}

// Cards
.card-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

// Shadows
.shadow-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-6);
}

.shadow-card {
  padding: var(--space-6);
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  text-align: center;
  border: 1px solid var(--neutral-200);
}

.shadow-label {
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-900);
  margin-bottom: var(--space-1);
}

.shadow-value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: var(--text-sm);
  color: var(--neutral-600);
}

// Glass Effects
.glass-showcase {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  min-height: 300px;
}

.glass-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
  
  h4 {
    color: white;
    margin-bottom: var(--space-3);
  }
  
  p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }
}

// Gradients
.gradient-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.gradient-card {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.gradient-label {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
  font-size: var(--text-lg);
}

.gradient-class {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: var(--text-sm);
  opacity: 0.9;
}

// Icons
.icon-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
}

.icon-group {
  text-align: center;
  padding: var(--space-4);
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
}

.icon-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--neutral-900);
  margin-top: var(--space-2);
}

.icon-class {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: var(--text-xs);
  color: var(--neutral-600);
}

// Spacing
.spacing-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
}

.spacing-item {
  text-align: center;
}

.spacing-demo {
  background: var(--brand-primary);
  border-radius: var(--radius-base);
  margin-bottom: var(--space-2);
}

.spacing-content {
  background: var(--neutral-50);
  border-radius: var(--radius-sm);
  width: 100%;
  height: 40px;
}

.spacing-label {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: var(--text-xs);
  color: var(--neutral-600);
}

// Border Radius
.radius-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
}

.radius-item {
  text-align: center;
}

.radius-demo {
  width: 80px;
  height: 80px;
  background: var(--brand-primary);
  margin: 0 auto var(--space-2);
}

.radius-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--neutral-900);
  margin-bottom: var(--space-1);
}

.radius-class {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: var(--text-xs);
  color: var(--neutral-600);
}

// Code Examples
.code-examples {
  h4 {
    color: var(--brand-primary);
    margin-bottom: var(--space-2);
    margin-top: var(--space-4);
    
    &:first-child {
      margin-top: 0;
    }
  }

  pre {
    background: var(--neutral-100);
    border-radius: var(--radius-base);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    overflow-x: auto;
    
    code {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
      font-size: var(--text-sm);
      color: var(--neutral-800);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .card-showcase {
    grid-template-columns: 1fr;
  }
  
  .color-grid {
    grid-template-columns: 1fr;
  }
  
  .button-showcase {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .shadow-showcase {
    grid-template-columns: repeat(2, 1fr);
  }
}

// Medical-specific component styling
.component-showcase {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin: var(--space-4) 0;
  
  .component-demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    border: 1px solid var(--neutral-200);
    border-radius: var(--radius-md);
    background: var(--neutral-50);
    
    .demo-label {
      font-size: var(--text-sm);
      color: var(--neutral-600);
      text-align: center;
    }
  }
}

.typography-showcase {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  background: var(--neutral-50);
}

.status-showcase {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  
  > div {
    padding: var(--space-3);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: var(--font-weight-medium);
  }
}

  .demo-table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: var(--space-2) var(--space-3);
      text-align: left;
      border-bottom: 1px solid var(--neutral-200);
    }
    
    th {
      background: var(--neutral-100);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-800);
    }
    
    .col-numeric {
      text-align: center;
      width: 120px;
    }
    
    .col-status {
      text-align: center;
      width: 60px;
    }
    
    .product-name {
      font-weight: var(--font-weight-medium);
      color: var(--neutral-900);
    }
    
    // Compact stock styling in demo
    .stock-compact {
      display: flex;
      justify-content: center;
      
      .stock-ratio {
        font-family: var(--font-mono);
        font-size: var(--text-base);
        font-weight: var(--font-weight-medium);
        letter-spacing: 0.5px;
        font-variant-numeric: tabular-nums;
        
        &.text-critical {
          color: var(--medical-critical);
          font-weight: var(--font-weight-semibold);
        }
        
        &.text-warning {
          color: var(--medical-urgent);
          font-weight: var(--font-weight-semibold);
        }
        
        &.text-data-primary {
          color: var(--neutral-700);
        }
      }
    }
    
    .status-minimal {
      display: flex;
      justify-content: center;
      align-items: center;
      
      .status-ok {
        opacity: 0.6;
      }
    }
  }
  
  .design-notes {
    margin-top: var(--space-6);
    padding: var(--space-4);
    background: var(--neutral-50);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--brand-primary);
    
    h4 {
      color: var(--brand-primary);
      margin-bottom: var(--space-3);
      font-size: var(--text-lg);
    }
    
    ul {
      margin: 0;
      padding-left: var(--space-5);
      
      li {
        margin-bottom: var(--space-2);
        line-height: var(--leading-relaxed);
        
        strong {
          color: var(--neutral-800);
        }
      }
    }
  }
  
  .comparison-note {
    margin-top: var(--space-4);
    padding: var(--space-3);
    background: var(--success-50);
    border: 1px solid var(--success-200);
    border-radius: var(--radius-md);
    
    p {
      margin: 0;
      color: var(--success-800);
      font-size: var(--text-sm);
      
      strong {
        font-weight: var(--font-weight-semibold);
      }
    }
  }
</style> 