<template>
  <PageLayout>
    <template #header>
      <PageTitle
        title="Design System Style Guide"
        subtitle="Single source of truth for Remcura UI system"
        icon="palette"
      />
    </template>

    <div class="style-guide">
      <!-- Token Inspector -->
      <div class="style-section">
        <h2 class="section-title">🎛️ Live Token Inspector</h2>
        <p class="section-description">
          Experiment with design tokens in real-time. Changes reflect instantly
          across all components.
        </p>
        <TokenInspector />
      </div>

      <!-- Colors Section -->
      <div class="style-section">
        <h2 class="section-title">🎨 Color System</h2>
        <p class="section-description">
          Our color system is built on CSS custom properties that automatically
          adapt to light and dark modes.
        </p>

        <div class="color-showcase">
          <!-- Brand Colors -->
          <div class="color-group">
            <h4>Brand Colors</h4>
            <div class="color-row">
              <div class="color-card" style="background: var(--brand-primary)">
                <div class="color-value">Primary</div>
                <div class="color-var">--brand-primary</div>
              </div>
              <div
                class="color-card"
                style="background: var(--brand-secondary)"
              >
                <div class="color-value">Secondary</div>
                <div class="color-var">--brand-secondary</div>
              </div>
              <div class="color-card" style="background: var(--brand-accent)">
                <div class="color-value">Accent</div>
                <div class="color-var">--brand-accent</div>
              </div>
            </div>
          </div>

          <!-- Semantic Colors -->
          <div class="color-group">
            <h4>Semantic Colors</h4>
            <div class="color-row">
              <div class="color-card" style="background: var(--brand-success)">
                <div class="color-value">Success</div>
                <div class="color-var">--brand-success</div>
              </div>
              <div class="color-card" style="background: var(--brand-danger)">
                <div class="color-value">Danger</div>
                <div class="color-var">--brand-danger</div>
              </div>
              <div class="color-card" style="background: var(--brand-warning)">
                <div class="color-value">Warning</div>
                <div class="color-var">--brand-warning</div>
              </div>
              <div class="color-card" style="background: var(--brand-info)">
                <div class="color-value">Info</div>
                <div class="color-var">--brand-info</div>
              </div>
            </div>
          </div>

          <!-- Neutral Palette -->
          <div class="color-group">
            <h4>Neutral Palette</h4>
            <div class="color-row">
              <div
                class="color-card"
                style="background: var(--neutral-50); color: var(--neutral-900)"
              >
                <div class="color-value">Neutral 50</div>
                <div class="color-var">--neutral-50</div>
              </div>
              <div
                class="color-card"
                style="
                  background: var(--neutral-200);
                  color: var(--neutral-900);
                "
              >
                <div class="color-value">Neutral 200</div>
                <div class="color-var">--neutral-200</div>
              </div>
              <div class="color-card" style="background: var(--neutral-500)">
                <div class="color-value">Neutral 500</div>
                <div class="color-var">--neutral-500</div>
              </div>
              <div class="color-card" style="background: var(--neutral-800)">
                <div class="color-value">Neutral 800</div>
                <div class="color-var">--neutral-800</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Typography Section -->
      <div class="style-section">
        <h2 class="section-title">📝 Typography System</h2>
        <p class="section-description">
          Typography scale using CSS custom properties with consistent font
          weights and line heights.
        </p>

        <div class="typography-showcase">
          <div class="text-example">
            <h1 class="text-h1">Heading 1 - Page Title</h1>
            <div class="text-meta">
              var(--text-4xl), var(--font-weight-black), var(--leading-tight)
            </div>
          </div>

          <div class="text-example">
            <h2 class="text-h2">Heading 2 - Section Title</h2>
            <div class="text-meta">
              var(--text-3xl), var(--font-weight-extrabold),
              var(--leading-tight)
            </div>
          </div>

          <div class="text-example">
            <h3 class="text-h3">Heading 3 - Subsection</h3>
            <div class="text-meta">
              var(--text-2xl), var(--font-weight-bold), var(--leading-tight)
            </div>
          </div>

          <div class="text-example">
            <h4 class="text-h4">Heading 4 - Card Title</h4>
            <div class="text-meta">
              var(--text-xl), var(--font-weight-bold), var(--leading-normal)
            </div>
          </div>

          <div class="text-example">
            <h5 class="text-h5">Heading 5 - Small Header</h5>
            <div class="text-meta">
              var(--text-lg), var(--font-weight-semibold), var(--leading-normal)
            </div>
          </div>

          <div class="text-example">
            <h6 class="text-h6">Heading 6 - Label</h6>
            <div class="text-meta">
              var(--text-base), var(--font-weight-semibold),
              var(--leading-normal)
            </div>
          </div>

          <div class="text-example">
            <p class="text-body">
              Body text - Primary content text with good readability
            </p>
            <div class="text-meta">
              var(--text-base), var(--font-weight-normal), var(--leading-normal)
            </div>
          </div>

          <div class="text-example">
            <p class="text-sm">
              Small text - Secondary descriptions and metadata
            </p>
            <div class="text-meta">
              var(--text-sm), var(--font-weight-normal), var(--leading-normal)
            </div>
          </div>

          <div class="text-example">
            <p class="text-xs">Extra small - Captions and fine print</p>
            <div class="text-meta">
              var(--text-xs), var(--font-weight-normal), var(--leading-relaxed)
            </div>
          </div>
        </div>
      </div>

      <!-- Button System -->
      <div class="style-section">
        <h2 class="section-title">🔘 Button System</h2>
        <p class="section-description">
          Consistent button styling using the useButtons composable with proper
          states and accessibility.
        </p>

        <div class="button-showcase">
          <div class="button-group">
            <h4>Primary Buttons</h4>
            <div class="button-row">
              <q-btn color="primary" label="Primary" />
              <q-btn color="primary" icon="add" label="With Icon" />
              <q-btn color="primary" icon="download" round />
              <q-btn color="primary" label="Loading" loading />
              <q-btn color="primary" label="Disabled" disable />
            </div>
          </div>

          <div class="button-group">
            <h4>Button Variants</h4>
            <div class="button-row">
              <q-btn unelevated color="primary" label="Unelevated" />
              <q-btn outline color="primary" label="Outline" />
              <q-btn flat color="primary" label="Flat" />
              <q-btn push color="primary" label="Push" />
            </div>
          </div>

          <div class="button-group">
            <h4>Semantic Colors</h4>
            <div class="button-row">
              <q-btn color="positive" label="Success" icon="check" />
              <q-btn color="negative" label="Danger" icon="warning" />
              <q-btn color="warning" label="Warning" icon="info" />
              <q-btn color="info" label="Info" icon="help" />
            </div>
          </div>

          <div class="button-group">
            <h4>Button Sizes</h4>
            <div class="button-row items-end">
              <q-btn size="xs" color="primary" label="XS" />
              <q-btn size="sm" color="primary" label="Small" />
              <q-btn size="md" color="primary" label="Medium" />
              <q-btn size="lg" color="primary" label="Large" />
            </div>
          </div>

          <div class="button-group">
            <h4>Interactive States</h4>
            <div class="button-row">
              <q-btn color="primary" label="Normal" />
              <q-btn color="primary" label="Hover" class="hover-demo" />
              <q-btn color="primary" label="Focus" class="focus-demo" />
              <q-btn color="primary" label="Active" class="active-demo" />
            </div>
          </div>
        </div>
      </div>

      <!-- Form Controls -->
      <div class="style-section">
        <h2 class="section-title">📝 Form Controls</h2>
        <p class="section-description">
          Unified form styling with consistent heights, focus states, and
          validation.
        </p>

        <div class="form-showcase">
          <div class="form-group">
            <h4>Input Fields</h4>
            <div class="form-row">
              <q-input
                outlined
                v-model="sampleText"
                label="Standard Input"
                placeholder="Enter text..."
                style="flex: 1"
              />
              <q-input
                outlined
                v-model="sampleEmail"
                type="email"
                label="Email Input"
                placeholder="user@example.com"
                style="flex: 1"
              />
            </div>
          </div>

          <div class="form-group">
            <h4>Select Fields</h4>
            <div class="form-row">
              <q-select
                outlined
                v-model="sampleSelect"
                :options="selectOptions"
                label="Single Select"
                style="flex: 1"
              />
              <q-select
                outlined
                v-model="sampleMultiple"
                :options="selectOptions"
                multiple
                label="Multiple Select"
                style="flex: 1"
              />
            </div>
          </div>

          <div class="form-group">
            <h4>Form States</h4>
            <div class="form-row">
              <q-input
                outlined
                v-model="sampleError"
                label="Error State"
                error
                error-message="This field is required"
                style="flex: 1"
              />
              <q-input
                outlined
                v-model="sampleDisabled"
                label="Disabled State"
                disable
                style="flex: 1"
              />
            </div>
          </div>

          <div class="form-group">
            <h4>Other Controls</h4>
            <div class="form-controls">
              <q-checkbox v-model="sampleCheck" label="Checkbox option" />
              <q-radio
                v-model="sampleRadio"
                val="option1"
                label="Radio option 1"
              />
              <q-radio
                v-model="sampleRadio"
                val="option2"
                label="Radio option 2"
              />
              <q-toggle v-model="sampleToggle" label="Toggle switch" />
            </div>
          </div>
        </div>
      </div>

      <!-- Dialog System -->
      <div class="style-section">
        <h2 class="section-title">💬 Dialog System</h2>
        <p class="section-description">
          BaseDialog and FormDialog components with proper focus management and
          accessibility.
        </p>

        <div class="dialog-showcase">
          <div class="dialog-group">
            <h4>Dialog Types</h4>
            <div class="button-row">
              <q-btn
                color="primary"
                label="Info Dialog"
                @click="showInfoDialog = true"
              />
              <q-btn
                color="warning"
                label="Confirm Dialog"
                @click="showConfirmDialog = true"
              />
              <q-btn
                color="positive"
                label="Form Dialog"
                @click="showFormDialog = true"
              />
              <q-btn
                color="negative"
                label="Destructive Dialog"
                @click="showDestructiveDialog = true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Table System -->
      <div class="style-section">
        <h2 class="section-title">📊 Table System</h2>
        <p class="section-description">
          Unified table styling with loading states, empty states, and
          responsive design.
        </p>

        <div class="table-showcase">
          <div class="table-demo">
            <q-table
              :rows="sampleTableData"
              :columns="sampleTableColumns"
              row-key="id"
              :loading="tableLoading"
              :pagination="{ rowsPerPage: 5 }"
              class="medical-table"
            >
              <template v-slot:top>
                <div class="table-header">
                  <h4>Sample Data Table</h4>
                  <div class="table-actions">
                    <q-btn
                      flat
                      icon="refresh"
                      @click="refreshTable"
                      :loading="tableLoading"
                    />
                    <q-btn color="primary" icon="add" label="Add Item" />
                  </div>
                </div>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.value)"
                    text-color="white"
                    :label="props.value"
                    size="sm"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat icon="edit" size="sm" />
                  <q-btn flat icon="delete" size="sm" color="negative" />
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </div>

      <!-- Alert System -->
      <div class="style-section">
        <h2 class="section-title">🚨 Alert & Toast System</h2>
        <p class="section-description">
          Notification system with proper ARIA live regions and semantic colors.
        </p>

        <div class="alert-showcase">
          <div class="alert-group">
            <h4>Alert Types</h4>
            <div class="alert-examples">
              <q-banner class="alert-info" rounded>
                <template v-slot:avatar>
                  <q-icon name="info" />
                </template>
                <strong>Information:</strong> This is an informational message
                with important details.
                <template v-slot:action>
                  <q-btn flat label="Dismiss" />
                </template>
              </q-banner>

              <q-banner class="alert-success" rounded>
                <template v-slot:avatar>
                  <q-icon name="check_circle" />
                </template>
                <strong>Success:</strong> Operation completed successfully!
                <template v-slot:action>
                  <q-btn flat label="View Details" />
                </template>
              </q-banner>

              <q-banner class="alert-warning" rounded>
                <template v-slot:avatar>
                  <q-icon name="warning" />
                </template>
                <strong>Warning:</strong> Please review the following items
                before proceeding.
                <template v-slot:action>
                  <q-btn flat label="Review" />
                </template>
              </q-banner>

              <q-banner class="alert-error" rounded>
                <template v-slot:avatar>
                  <q-icon name="error" />
                </template>
                <strong>Error:</strong> An error occurred while processing your
                request.
                <template v-slot:action>
                  <q-btn flat label="Retry" />
                </template>
              </q-banner>
            </div>
          </div>

          <div class="toast-group">
            <h4>Toast Notifications</h4>
            <div class="button-row">
              <q-btn
                color="info"
                label="Show Info Toast"
                @click="showToast('info')"
              />
              <q-btn
                color="positive"
                label="Show Success Toast"
                @click="showToast('positive')"
              />
              <q-btn
                color="warning"
                label="Show Warning Toast"
                @click="showToast('warning')"
              />
              <q-btn
                color="negative"
                label="Show Error Toast"
                @click="showToast('negative')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading & Empty States -->
      <div class="style-section">
        <h2 class="section-title">⏳ Loading & Empty States</h2>
        <p class="section-description">
          Consistent loading indicators and empty state patterns.
        </p>

        <div class="states-showcase">
          <div class="state-group">
            <h4>Loading States</h4>
            <div class="state-examples">
              <div class="state-card">
                <h5>Skeleton Loading</h5>
                <div class="skeleton-demo">
                  <q-skeleton type="text" width="60%" />
                  <q-skeleton type="text" width="80%" />
                  <q-skeleton type="text" width="40%" />
                </div>
              </div>

              <div class="state-card">
                <h5>Spinner Loading</h5>
                <div class="spinner-demo">
                  <q-spinner-dots size="40px" color="primary" />
                  <p>Loading data...</p>
                </div>
              </div>
            </div>
          </div>

          <div class="state-group">
            <h4>Empty States</h4>
            <div class="state-examples">
              <div class="state-card empty-state">
                <q-icon name="inbox" size="48px" color="grey-5" />
                <h5>No items found</h5>
                <p>There are no items to display at this time.</p>
                <q-btn color="primary" label="Add Item" />
              </div>

              <div class="state-card empty-state">
                <q-icon name="search_off" size="48px" color="grey-5" />
                <h5>No search results</h5>
                <p>Try adjusting your search criteria.</p>
                <q-btn flat color="primary" label="Clear Filters" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Design System -->
      <CardStyleGuide />

      <!-- Shadows System -->
      <div class="style-section">
        <h2 class="section-title">🌟 Shadow System</h2>
        <p class="section-description">
          Elevation system using CSS custom properties that adapt to light and
          dark modes.
        </p>

        <div class="shadow-showcase">
          <div class="shadow-card" style="box-shadow: var(--shadow-xs)">
            <div class="shadow-label">Extra Small</div>
            <div class="shadow-value">var(--shadow-xs)</div>
          </div>

          <div class="shadow-card" style="box-shadow: var(--shadow-sm)">
            <div class="shadow-label">Small</div>
            <div class="shadow-value">var(--shadow-sm)</div>
          </div>

          <div class="shadow-card" style="box-shadow: var(--shadow-base)">
            <div class="shadow-label">Base</div>
            <div class="shadow-value">var(--shadow-base)</div>
          </div>

          <div class="shadow-card" style="box-shadow: var(--shadow-md)">
            <div class="shadow-label">Medium</div>
            <div class="shadow-value">var(--shadow-md)</div>
          </div>

          <div class="shadow-card" style="box-shadow: var(--shadow-lg)">
            <div class="shadow-label">Large</div>
            <div class="shadow-value">var(--shadow-lg)</div>
          </div>

          <div class="shadow-card" style="box-shadow: var(--shadow-xl)">
            <div class="shadow-label">Extra Large</div>
            <div class="shadow-value">var(--shadow-xl)</div>
          </div>
        </div>
      </div>

      <!-- Icon System -->
      <div class="style-section">
        <h2 class="section-title">🎯 {{ $t('settings.iconsSection') }}</h2>

        <div class="icon-showcase">
          <!-- Medical Icons -->
          <div class="icon-group">
            <h4>Medical Icons</h4>
            <div class="icon-row">
              <div class="icon-item">
                <q-icon
                  name="medical_services"
                  class="icon-size-xl"
                  color="primary"
                />
                <div class="icon-label">Medical Services</div>
              </div>
              <div class="icon-item">
                <q-icon
                  name="inventory"
                  class="icon-size-xl"
                  color="secondary"
                />
                <div class="icon-label">Inventory</div>
              </div>
              <div class="icon-item">
                <q-icon
                  name="health_and_safety"
                  class="icon-size-xl"
                  color="positive"
                />
                <div class="icon-label">Health & Safety</div>
              </div>
            </div>
          </div>

          <!-- Status Icons -->
          <div class="icon-group">
            <h4>Status Icons</h4>
            <div class="icon-row">
              <div class="icon-item">
                <q-icon
                  name="check_circle"
                  class="icon-size-xl"
                  color="positive"
                />
                <div class="icon-label">Success</div>
              </div>
              <div class="icon-item">
                <q-icon name="warning" class="icon-size-xl" color="warning" />
                <div class="icon-label">Warning</div>
              </div>
              <div class="icon-item">
                <q-icon name="error" class="icon-size-xl" color="negative" />
                <div class="icon-label">Error</div>
              </div>
              <div class="icon-item">
                <q-icon name="info" class="icon-size-xl" color="info" />
                <div class="icon-label">Info</div>
              </div>
            </div>
          </div>

          <!-- Interface Icons -->
          <div class="icon-group">
            <h4>Interface Icons</h4>
            <div class="icon-row">
              <div class="icon-item">
                <q-icon name="settings" class="icon-size-xl" color="grey-7" />
                <div class="icon-label">Settings</div>
              </div>
              <div class="icon-item">
                <q-icon name="analytics" class="icon-size-xl" color="blue-7" />
                <div class="icon-label">Analytics</div>
              </div>
              <div class="icon-item">
                <q-icon
                  name="notifications"
                  class="icon-size-xl"
                  color="orange"
                />
                <div class="icon-label">Notifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Border Radius System -->
      <div class="style-section">
        <h2 class="section-title">📐 Border Radius System</h2>
        <p class="section-description">
          Consistent border radius scale using CSS custom properties.
        </p>

        <div class="radius-showcase">
          <div class="radius-item">
            <div
              class="radius-demo"
              style="border-radius: var(--radius-sm)"
            ></div>
            <div class="radius-label">Small</div>
            <div class="radius-value">var(--radius-sm)</div>
          </div>

          <div class="radius-item">
            <div
              class="radius-demo"
              style="border-radius: var(--radius-base)"
            ></div>
            <div class="radius-label">Base</div>
            <div class="radius-value">var(--radius-base)</div>
          </div>

          <div class="radius-item">
            <div
              class="radius-demo"
              style="border-radius: var(--radius-md)"
            ></div>
            <div class="radius-label">Medium</div>
            <div class="radius-value">var(--radius-md)</div>
          </div>

          <div class="radius-item">
            <div
              class="radius-demo"
              style="border-radius: var(--radius-lg)"
            ></div>
            <div class="radius-label">Large (Cards)</div>
            <div class="radius-value">var(--radius-lg)</div>
          </div>

          <div class="radius-item">
            <div
              class="radius-demo"
              style="border-radius: var(--radius-xl)"
            ></div>
            <div class="radius-label">Extra Large</div>
            <div class="radius-value">var(--radius-xl)</div>
          </div>

          <div class="radius-item">
            <div
              class="radius-demo"
              style="border-radius: var(--radius-full)"
            ></div>
            <div class="radius-label">Full</div>
            <div class="radius-value">var(--radius-full)</div>
          </div>
        </div>
      </div>

      <!-- Spacing System -->
      <div class="style-section">
        <h2 class="section-title">📏 Spacing System</h2>
        <p class="section-description">
          8-point grid system using CSS custom properties for consistent
          spacing.
        </p>

        <div class="spacing-showcase">
          <div class="spacing-item">
            <div class="spacing-demo" style="width: var(--space-1)"></div>
            <div class="spacing-label">Space 1</div>
            <div class="spacing-value">var(--space-1)</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: var(--space-2)"></div>
            <div class="spacing-label">Space 2</div>
            <div class="spacing-value">var(--space-2)</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: var(--space-3)"></div>
            <div class="spacing-label">Space 3</div>
            <div class="spacing-value">var(--space-3)</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: var(--space-4)"></div>
            <div class="spacing-label">Space 4</div>
            <div class="spacing-value">var(--space-4)</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: var(--space-5)"></div>
            <div class="spacing-label">Space 5</div>
            <div class="spacing-value">var(--space-5)</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: var(--space-6)"></div>
            <div class="spacing-label">Space 6</div>
            <div class="spacing-value">var(--space-6)</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: var(--space-8)"></div>
            <div class="spacing-label">Space 8</div>
            <div class="spacing-value">var(--space-8)</div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useQuasar } from 'quasar';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import CardStyleGuide from 'src/components/cards/CardStyleGuide.vue';
  import TokenInspector from 'src/components/TokenInspector.vue';

  const $q = useQuasar();

  // Form demo data
  const sampleText = ref('Sample text');
  const sampleEmail = ref('user@example.com');
  const sampleSelect = ref(null);
  const sampleMultiple = ref([]);
  const sampleError = ref('');
  const sampleDisabled = ref('Disabled value');
  const sampleCheck = ref(true);
  const sampleRadio = ref('option1');
  const sampleToggle = ref(false);

  const selectOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

  // Dialog states
  const showInfoDialog = ref(false);
  const showConfirmDialog = ref(false);
  const showFormDialog = ref(false);
  const showDestructiveDialog = ref(false);

  // Table demo data
  const tableLoading = ref(false);
  const sampleTableData = ref([
    { id: 1, name: 'Product A', status: 'Active', quantity: 150, price: 29.99 },
    { id: 2, name: 'Product B', status: 'Inactive', quantity: 0, price: 19.99 },
    { id: 3, name: 'Product C', status: 'Active', quantity: 75, price: 39.99 },
    {
      id: 4,
      name: 'Product D',
      status: 'Pending',
      quantity: 200,
      price: 49.99,
    },
    { id: 5, name: 'Product E', status: 'Active', quantity: 50, price: 24.99 },
  ]);

  const sampleTableColumns = [
    {
      name: 'name',
      label: 'Product Name',
      field: 'name',
      align: 'left' as const,
      sortable: true,
    },
    {
      name: 'status',
      label: 'Status',
      field: 'status',
      align: 'center' as const,
      sortable: true,
    },
    {
      name: 'quantity',
      label: 'Quantity',
      field: 'quantity',
      align: 'right' as const,
      sortable: true,
    },
    {
      name: 'price',
      label: 'Price',
      field: 'price',
      align: 'right' as const,
      sortable: true,
      format: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      name: 'actions',
      label: 'Actions',
      field: 'actions',
      align: 'center' as const,
    },
  ];

  // Helper functions
  function getStatusColor(status: string) {
    switch (status) {
      case 'Active':
        return 'positive';
      case 'Inactive':
        return 'negative';
      case 'Pending':
        return 'warning';
      default:
        return 'grey';
    }
  }

  function refreshTable() {
    tableLoading.value = true;
    setTimeout(() => {
      tableLoading.value = false;
    }, 1000);
  }

  function showToast(type: string) {
    const messages = {
      info: 'This is an informational message',
      positive: 'Operation completed successfully!',
      warning: 'Please review your input',
      negative: 'An error occurred',
    };

    $q.notify({
      type,
      message: messages[type as keyof typeof messages],
      position: 'top-right',
      timeout: 3000,
      actions: [{ icon: 'close', color: 'white' }],
    });
  }
</script>

<style scoped lang="scss">
  .style-guide {
    display: flex;
    flex-direction: column;
    gap: 48px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .style-section {
    .section-title {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: var(--text-primary);
    }

    .section-description {
      font-size: 18px;
      color: var(--text-secondary);
      margin-bottom: 32px;
      line-height: 1.6;
    }
  }

  // Color showcase
  .color-showcase {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .color-group {
      h4 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: var(--text-primary);
      }

      .color-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
    }

    .color-card {
      width: 120px;
      height: 80px;
      border-radius: 12px;
      padding: 12px;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-md);

      .color-value {
        font-weight: 600;
        font-size: 14px;
      }

      .color-var {
        font-size: 11px;
        opacity: 0.9;
        font-family: var(--font-family-mono);
      }
    }
  }

  // Typography showcase
  .typography-showcase {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .text-example {
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .text-meta {
        font-size: var(--text-xs);
        color: var(--text-tertiary);
        margin-top: var(--space-2);
        font-family: var(--font-family-mono);
      }
    }
  }

  // Button showcase
  .button-showcase {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);

    .button-group {
      h4 {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--space-4) 0;
        color: var(--text-primary);
      }

      .button-row {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
        align-items: center;
      }
    }

    // Interactive state demos
    .hover-demo:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .focus-demo {
      outline: 2px solid var(--focus-ring-color);
      outline-offset: var(--focus-ring-offset);
    }

    .active-demo {
      transform: translateY(1px);
      box-shadow: var(--shadow-sm);
    }
  }

  // Form showcase
  .form-showcase {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);

    .form-group {
      h4 {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--space-4) 0;
        color: var(--text-primary);
      }

      .form-row {
        display: flex;
        gap: var(--space-4);
        flex-wrap: wrap;
      }

      .form-controls {
        display: flex;
        gap: var(--space-6);
        flex-wrap: wrap;
        align-items: center;
      }
    }
  }

  // Dialog showcase
  .dialog-showcase {
    .dialog-group {
      h4 {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--space-4) 0;
        color: var(--text-primary);
      }
    }
  }

  // Table showcase
  .table-showcase {
    .table-demo {
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4);

        h4 {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
        }

        .table-actions {
          display: flex;
          gap: var(--space-2);
        }
      }
    }
  }

  // Alert showcase
  .alert-showcase {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);

    .alert-group {
      h4 {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--space-4) 0;
        color: var(--text-primary);
      }

      .alert-examples {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);

        .alert-info {
          background: rgba(30, 64, 175, 0.1);
          border-left: 4px solid var(--brand-info);
          color: var(--brand-info);
        }

        .alert-success {
          background: rgba(5, 150, 105, 0.1);
          border-left: 4px solid var(--brand-success);
          color: var(--brand-success);
        }

        .alert-warning {
          background: rgba(217, 119, 6, 0.1);
          border-left: 4px solid var(--brand-warning);
          color: var(--brand-warning);
        }

        .alert-error {
          background: rgba(185, 28, 28, 0.1);
          border-left: 4px solid var(--brand-danger);
          color: var(--brand-danger);
        }
      }
    }

    .toast-group {
      h4 {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--space-4) 0;
        color: var(--text-primary);
      }
    }
  }

  // States showcase
  .states-showcase {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);

    .state-group {
      h4 {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--space-4) 0;
        color: var(--text-primary);
      }

      .state-examples {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-4);
      }
    }

    .state-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: center;

      h5 {
        margin: 0 0 var(--space-3) 0;
        font-size: var(--text-base);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
      }

      &.empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-3);

        p {
          margin: 0;
          color: var(--text-secondary);
        }
      }
    }

    .skeleton-demo {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .spinner-demo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);

      p {
        margin: 0;
        color: var(--text-secondary);
      }
    }
  }

  // Shadow showcase
  .shadow-showcase {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;

    .shadow-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 24px;
      text-align: center;

      .shadow-label {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-primary);
      }

      .shadow-value {
        font-size: 14px;
        color: var(--text-secondary);
      }

      .body--dark & {
        background: #1e1e1e;
      }
    }
  }

  // Icon showcase
  .icon-showcase {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .icon-group {
      h4 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: var(--text-primary);
      }

      .icon-row {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      }
    }

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;

      .icon-label {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }

  // Radius showcase
  .radius-showcase {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    align-items: end;

    .radius-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .radius-demo {
        width: 60px;
        height: 60px;
        background: var(--q-primary);
      }

      .radius-label {
        font-weight: 600;
        color: var(--text-primary);
      }

      .radius-value {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        font-family: var(--font-family-mono);
      }
    }
  }

  // Spacing showcase
  .spacing-showcase {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    align-items: end;

    .spacing-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .spacing-demo {
        height: 40px;
        background: var(--q-primary);
        border-radius: 4px;
      }

      .spacing-label {
        font-weight: 600;
        color: var(--text-primary);
      }

      .spacing-value {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        font-family: var(--font-family-mono);
      }
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .style-guide {
      gap: 32px;
      padding: 0 16px;
    }

    .style-section {
      .section-title {
        font-size: 24px;
      }

      .section-description {
        font-size: 16px;
      }
    }

    .color-row {
      justify-content: center;
    }

    .button-row {
      justify-content: center;
    }

    .icon-row {
      justify-content: center;
    }

    .radius-showcase,
    .spacing-showcase {
      justify-content: center;
    }
  }
</style>
