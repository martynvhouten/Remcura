<template>
  <div class="card-style-guide">
    <div class="style-guide-header">
      <h1>Card Design System</h1>
      <p class="guide-description">
        Our streamlined card system consists of 3 main categories, each designed
        for specific use cases. This system provides consistency while
        maintaining clarity of purpose.
      </p>
    </div>

    <!-- Base Card Section -->
    <section class="card-section">
      <div class="section-header">
        <h2>1. Base Card</h2>
        <p class="section-description">
          For static content display. No hover effects or interactive states.
          Used for information display, content containers, and non-clickable
          elements.
        </p>
      </div>

      <div class="card-examples">
        <div class="example-group">
          <h4>Basic Example</h4>
          <BaseCard
            :title="$t('cards.examples.userProfile.title')"
            :subtitle="$t('cards.examples.userProfile.subtitle')"
            icon="person"
            icon-color="primary"
          >
            <div class="example-content">
              <p><strong>Name:</strong> John Doe</p>
              <p><strong>Email:</strong> john@example.com</p>
              <p><strong>Role:</strong> Administrator</p>
            </div>
          </BaseCard>
        </div>

        <div class="example-group">
          <h4>With Actions</h4>
          <BaseCard
            :title="$t('cards.examples.systemStatus.title')"
            :subtitle="$t('cards.examples.systemStatus.subtitle')"
            icon="health_and_safety"
            icon-color="positive"
          >
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">98%</div>
                <div class="stat-label">Uptime</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">245</div>
                <div class="stat-label">Users</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">12ms</div>
                <div class="stat-label">Response</div>
              </div>
            </div>

            <template #actions>
              <q-btn flat color="primary">Refresh</q-btn>
              <q-btn color="primary">View Details</q-btn>
            </template>
          </BaseCard>
        </div>
      </div>

      <div class="usage-guidelines">
        <h4>Usage Guidelines</h4>
        <ul>
          <li>Use for displaying static information</li>
          <li>Perfect for dashboards and data presentation</li>
          <li>No hover effects - keeps focus on content</li>
          <li>Can include actions but card itself is not clickable</li>
        </ul>
      </div>
    </section>

    <!-- Interactive Card Section -->
    <section class="card-section">
      <div class="section-header">
        <h2>2. Interactive Card</h2>
        <p class="section-description">
          For clickable elements that navigate or trigger actions. Features
          subtle hover effects with lift and enhanced shadow. Includes
          accessibility features and loading states.
        </p>
      </div>

      <div class="card-examples">
        <div class="example-group">
          <h4>Navigation Card</h4>
          <InteractiveCard
            :title="$t('cards.examples.inventoryManagement.title')"
            :subtitle="$t('cards.examples.inventoryManagement.subtitle')"
            icon="inventory"
            icon-color="primary"
            show-click-indicator
            @click="handleCardClick('inventory')"
          >
            <div class="example-content">
              <p>Click to access the inventory management system</p>
            </div>
          </InteractiveCard>
        </div>

        <div class="example-group">
          <h4>Action Card</h4>
          <InteractiveCard
            :title="$t('cards.examples.quickScan.title')"
            :subtitle="$t('cards.examples.quickScan.subtitle')"
            icon="qr_code_scanner"
            icon-color="positive"
            :loading="isScanning"
            @click="handleScanClick"
          >
            <div class="example-content">
              <p>Start scanning products for quick inventory updates</p>
            </div>

            <template #actions>
              <q-btn flat @click.stop="handleQuickAction">Settings</q-btn>
            </template>
          </InteractiveCard>
        </div>

        <div class="example-group">
          <h4>Disabled State</h4>
          <InteractiveCard
            :title="$t('cards.examples.premiumFeature.title')"
            :subtitle="$t('cards.examples.premiumFeature.subtitle')"
            icon="star"
            icon-color="warning"
            disabled
            @click="handleCardClick('premium')"
          >
            <div class="example-content">
              <p>This feature requires a premium subscription</p>
            </div>
          </InteractiveCard>
        </div>
      </div>

      <div class="usage-guidelines">
        <h4>Usage Guidelines</h4>
        <ul>
          <li>Use for any clickable card elements</li>
          <li>Hover effect: subtle lift (-3px) with enhanced shadow</li>
          <li>Include proper focus states for accessibility</li>
          <li>Support keyboard navigation (Enter/Space)</li>
          <li>Can have loading and disabled states</li>
          <li>Optional click indicator for clarity</li>
        </ul>
      </div>
    </section>

    <!-- Alert Card Section -->
    <section class="card-section">
      <div class="section-header">
        <h2>3. Alert/Status Card</h2>
        <p class="section-description">
          For status messages, notifications, and alerts. Features colored
          indicators and appropriate icons. Supports different severity levels
          and dismissible options.
        </p>
      </div>

      <div class="card-examples">
        <div class="example-group">
          <h4>Info Alert</h4>
          <AlertCard
            severity="info"
            :title="$t('cards.examples.newFeatureAvailable.title')"
            :subtitle="$t('cards.examples.newFeatureAvailable.subtitle')"
          >
            <div class="example-content">
              <p>
                We've added advanced filtering and batch operations to help you
                manage inventory more efficiently.
              </p>
            </div>

            <template #actions>
              <q-btn flat color="primary">Learn More</q-btn>
            </template>
          </AlertCard>
        </div>

        <div class="example-group">
          <h4>Success Alert</h4>
          <AlertCard
            severity="success"
            :title="$t('cards.examples.dataSyncComplete.title')"
            :subtitle="$t('cards.examples.dataSyncComplete.subtitle')"
            dismissible
            @dismiss="handleDismiss('success')"
          >
            <div class="example-content">
              <p>
                Successfully synchronized 245 products and updated stock levels.
              </p>
            </div>
          </AlertCard>
        </div>

        <div class="example-group">
          <h4>Warning Alert</h4>
          <AlertCard
            severity="warning"
            :title="$t('cards.examples.lowStockWarning.title')"
            subtitle="12 products are below minimum levels"
          >
            <div class="example-content">
              <p>The following products need to be restocked soon:</p>
              <ul class="alert-list">
                <li>Surgical Masks (5 remaining)</li>
                <li>Disposable Gloves (12 remaining)</li>
                <li>Antiseptic Solution (2 bottles)</li>
              </ul>
            </div>

            <template #actions>
              <q-btn flat color="warning">View All</q-btn>
              <q-btn color="warning">Create Order</q-btn>
            </template>
          </AlertCard>
        </div>

        <div class="example-group">
          <h4>Error Alert</h4>
          <AlertCard
            severity="error"
            :title="$t('cards.examples.syncFailed.title')"
            :subtitle="$t('cards.examples.syncFailed.subtitle')"
            dismissible
            @dismiss="handleDismiss('error')"
          >
            <div class="example-content">
              <p>
                Connection timeout occurred. Please check your internet
                connection and try again.
              </p>
            </div>

            <template #actions>
              <q-btn flat color="negative">Retry</q-btn>
            </template>
          </AlertCard>
        </div>
      </div>

      <div class="usage-guidelines">
        <h4>Usage Guidelines</h4>
        <ul>
          <li>Use for status messages and notifications</li>
          <li>Four severity levels: info, success, warning, error</li>
          <li>Colored top border indicates severity</li>
          <li>Automatic status icons or custom icons</li>
          <li>Optional dismiss functionality</li>
          <li>Subtle background tint matches severity color</li>
        </ul>
      </div>
    </section>

    <!-- Field Styling Section -->
    <section class="card-section">
      <div class="section-header">
        <h2>Form Field Styling</h2>
        <p class="section-description">
          Consistent input field styling across all forms and components.
        </p>
      </div>

      <div class="field-examples">
        <div class="example-group">
          <h4>Input Fields</h4>
          <div class="field-demo">
            <q-input
              v-model="demoText"
              :label="$t('cards.inputs.standardInput')"
              outlined
              :placeholder="$t('cards.inputs.placeholder')"
              style="margin-bottom: 16px"
            />
            <q-select
              v-model="demoSelect"
              :options="['Option 1', 'Option 2', 'Option 3']"
              label="Select Field"
              outlined
              style="margin-bottom: 16px"
            />
            <q-input
              v-model="demoError"
              label="Error State"
              outlined
              error
              error-message="This field has an error"
            />
          </div>
        </div>
      </div>

      <div class="usage-guidelines">
        <h4>Field Styling Guidelines</h4>
        <ul>
          <li>All fields use consistent border-radius (12px)</li>
          <li>Single border - no double borders on focus</li>
          <li>Subtle focus ring with primary color</li>
          <li>Clean error states with red border and shadow</li>
          <li>Consistent padding and typography</li>
          <li>No !important rules - clean CSS override system</li>
        </ul>
      </div>
    </section>

    <!-- Design Tokens Section -->
    <section class="card-section">
      <div class="section-header">
        <h2>Design Tokens</h2>
        <p class="section-description">
          Consistent design values used across all card types and form fields.
        </p>
      </div>

      <div class="tokens-grid">
        <div class="token-group">
          <h4>Spacing</h4>
          <div class="token-item">
            <span class="token-name">Border Radius:</span>
            <span class="token-value">12px</span>
          </div>
          <div class="token-item">
            <span class="token-name">Padding (Small):</span>
            <span class="token-value">12px 16px</span>
          </div>
          <div class="token-item">
            <span class="token-name">Padding (Medium):</span>
            <span class="token-value">16px 20px</span>
          </div>
          <div class="token-item">
            <span class="token-name">Padding (Large):</span>
            <span class="token-value">20px 24px</span>
          </div>
        </div>

        <div class="token-group">
          <h4>Shadows</h4>
          <div class="token-item">
            <span class="token-name">Base Shadow:</span>
            <span class="token-value">Subtle depth</span>
            <div class="shadow-demo shadow-demo--base"></div>
          </div>
          <div class="token-item">
            <span class="token-name">Interactive Shadow:</span>
            <span class="token-value">Slightly elevated</span>
            <div class="shadow-demo shadow-demo--interactive"></div>
          </div>
          <div class="token-item">
            <span class="token-name">Hover Shadow:</span>
            <span class="token-value">Enhanced depth</span>
            <div class="shadow-demo shadow-demo--hover"></div>
          </div>
        </div>

        <div class="token-group">
          <h4>Typography</h4>
          <div class="token-item">
            <span class="token-name">Title Size:</span>
            <span class="token-value">16px</span>
          </div>
          <div class="token-item">
            <span class="token-name">Title Weight:</span>
            <span class="token-value">600</span>
          </div>
          <div class="token-item">
            <span class="token-name">Subtitle Size:</span>
            <span class="token-value">14px</span>
          </div>
        </div>

        <div class="token-group">
          <h4>Field Styling</h4>
          <div class="token-item">
            <span class="token-name">Border Radius:</span>
            <span class="token-value">12px</span>
          </div>
          <div class="token-item">
            <span class="token-name">Focus Ring:</span>
            <span class="token-value">3px rgba primary</span>
          </div>
          <div class="token-item">
            <span class="token-name">Min Height:</span>
            <span class="token-value">56px</span>
          </div>
          <div class="token-item">
            <span class="token-name">Padding:</span>
            <span class="token-value">16px 12px</span>
          </div>
        </div>

        <div class="token-group">
          <h4>Animation</h4>
          <div class="token-item">
            <span class="token-name">Transition:</span>
            <span class="token-value">0.2s cubic-bezier</span>
          </div>
          <div class="token-item">
            <span class="token-name">Hover Transform:</span>
            <span class="token-value">translateY(-3px)</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BaseCard, InteractiveCard, AlertCard } from './index';

  const isScanning = ref(false);
  const demoText = ref('');
  const demoSelect = ref(null);
  const demoError = ref('');

  const handleCardClick = (type: string) => {
    console.log(`Card clicked: ${type}`);
  };

  const handleScanClick = () => {
    isScanning.value = true;
    setTimeout(() => {
      isScanning.value = false;
    }, 2000);
  };

  const handleQuickAction = () => {
    console.log('Quick action triggered');
  };

  const handleDismiss = (type: string) => {
    console.log(`Alert dismissed: ${type}`);
  };
</script>

<style scoped lang="scss">
  .card-style-guide {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;

    .style-guide-header {
      margin-bottom: 48px;
      text-align: center;

      h1 {
        font-size: 36px;
        font-weight: 700;
        margin: 0 0 16px 0;
        color: var(--text-primary);
      }

      .guide-description {
        font-size: 18px;
        color: var(--text-secondary);
        line-height: 1.6;
        max-width: 600px;
        margin: 0 auto;
      }
    }
  }

  .card-section {
    margin-bottom: 64px;

    .section-header {
      margin-bottom: 32px;

      h2 {
        font-size: 28px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: var(--text-primary);
      }

      .section-description {
        font-size: 16px;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }
    }

    .card-examples {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 32px;

      .example-group {
        h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: var(--text-primary);
        }
      }
    }

    .usage-guidelines {
      background: rgba(59, 130, 246, 0.05);
      border: 1px solid rgba(59, 130, 246, 0.1);
      border-radius: 12px;
      padding: 24px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: var(--text-primary);
      }

      ul {
        margin: 0;
        padding: 0 0 0 20px;

        li {
          margin-bottom: 8px;
          color: var(--text-secondary);
          line-height: 1.5;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .body--dark & {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.2);
      }
    }
  }

  // Example content styles
  .example-content {
    p {
      margin: 0 0 12px 0;
      color: var(--text-secondary);
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }

    strong {
      color: var(--text-primary);
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  .alert-list {
    margin: 12px 0 0 0;
    padding: 0 0 0 20px;

    li {
      margin-bottom: 4px;
      color: var(--text-secondary);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // Design tokens section
  .tokens-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;

    .token-group {
      background: var(--surface);
      border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
      border-radius: 12px;
      padding: 20px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: var(--text-primary);
      }

      .body--dark & {
        background: #1e1e1e;
        border-color: rgba(255, 255, 255, 0.1);
      }
    }

    .token-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .token-name {
        font-size: 14px;
        color: var(--text-secondary);
      }

      .token-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
      }
    }
  }

  // Shadow demo
  .shadow-demo {
    width: 40px;
    height: 20px;
    background: #3b82f6;
    border-radius: 4px;
    margin-top: 8px;

    &--base {
      box-shadow: var(--shadow-sm);
    }

    &--interactive {
      box-shadow: var(--shadow-md);
    }

    &--hover {
      box-shadow: var(--shadow-lg);
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .card-style-guide {
      padding: 24px 16px;

      .style-guide-header {
        margin-bottom: 32px;

        h1 {
          font-size: 28px;
        }

        .guide-description {
          font-size: 16px;
        }
      }
    }

    .card-section {
      margin-bottom: 48px;

      .section-header {
        h2 {
          font-size: 24px;
        }
      }

      .card-examples {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .tokens-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
</style>
