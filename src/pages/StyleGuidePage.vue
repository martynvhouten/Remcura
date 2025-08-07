<template>
  <PageLayout>
    <template #header>
      <PageTitle
        title="Design System Style Guide"
        subtitle="Complete design system for the Remcura application"
        icon="style"
      />
    </template>

    <div class="style-guide">
      <!-- Colors Section -->
      <div class="style-section">
        <h2 class="section-title">🎨 {{ $t('settings.colorsSection') }}</h2>

        <div class="color-showcase">
          <!-- Primary Colors -->
          <div class="color-group">
            <h4>Primary Colors</h4>
            <div class="color-row">
              <div class="color-card" style="background: var(--q-primary)">
                <div class="color-value">Primary</div>
                <div class="color-hex">#3B82F6</div>
              </div>
              <div class="color-card" style="background: var(--q-secondary)">
                <div class="color-value">Secondary</div>
                <div class="color-hex">#64748B</div>
              </div>
              <div class="color-card" style="background: var(--q-accent)">
                <div class="color-value">Accent</div>
                <div class="color-hex">#8B5CF6</div>
              </div>
            </div>
          </div>

          <!-- Status Colors -->
          <div class="color-group">
            <h4>Status Colors</h4>
            <div class="color-row">
              <div class="color-card" style="background: var(--q-positive)">
                <div class="color-value">Positive</div>
                <div class="color-hex">#22C55E</div>
              </div>
              <div class="color-card" style="background: var(--q-negative)">
                <div class="color-value">Negative</div>
                <div class="color-hex">#EF4444</div>
              </div>
              <div class="color-card" style="background: var(--q-warning)">
                <div class="color-value">Warning</div>
                <div class="color-hex">#F59E0B</div>
              </div>
              <div class="color-card" style="background: var(--q-info)">
                <div class="color-value">Info</div>
                <div class="color-hex">#0EA5E9</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Typography Section -->
      <div class="style-section">
        <h2 class="section-title">📝 {{ $t('settings.typographySection') }}</h2>

        <div class="typography-showcase">
          <div class="text-example">
            <h1 class="text-h1">Heading 1 - Display Large</h1>
            <div class="text-meta">36px, Bold, Line Height 1.2</div>
          </div>

          <div class="text-example">
            <h2 class="text-h2">Heading 2 - Display Medium</h2>
            <div class="text-meta">28px, Semibold, Line Height 1.25</div>
          </div>

          <div class="text-example">
            <h3 class="text-h3">Heading 3 - Display Small</h3>
            <div class="text-meta">24px, Semibold, Line Height 1.3</div>
          </div>

          <div class="text-example">
            <h4 class="text-h4">Heading 4 - Title Large</h4>
            <div class="text-meta">20px, Semibold, Line Height 1.4</div>
          </div>

          <div class="text-example">
            <h5 class="text-h5">Heading 5 - Title Medium</h5>
            <div class="text-meta">18px, Medium, Line Height 1.4</div>
          </div>

          <div class="text-example">
            <h6 class="text-h6">Heading 6 - Title Small</h6>
            <div class="text-meta">16px, Medium, Line Height 1.5</div>
          </div>

          <div class="text-example">
            <p class="text-body1">Body 1 - Primary text for most content</p>
            <div class="text-meta">16px, Regular, Line Height 1.6</div>
          </div>

          <div class="text-example">
            <p class="text-body2">Body 2 - Secondary text for descriptions</p>
            <div class="text-meta">14px, Regular, Line Height 1.5</div>
          </div>

          <div class="text-example">
            <p class="text-caption">
              Caption - Small text for labels and metadata
            </p>
            <div class="text-meta">12px, Regular, Line Height 1.4</div>
          </div>
        </div>
      </div>

      <!-- Button System -->
      <div class="style-section">
        <h2 class="section-title">🔘 {{ $t('settings.buttonsSection') }}</h2>

        <div class="button-showcase">
          <div class="button-group">
            <h4>Primary Buttons</h4>
            <div class="button-row">
              <q-btn color="primary" label="Primary" />
              <q-btn color="primary" icon="add" label="With Icon" />
              <q-btn color="primary" icon="download" />
              <q-btn color="primary" label="Loading" loading />
            </div>
          </div>

          <div class="button-group">
            <h4>Secondary Buttons</h4>
            <div class="button-row">
              <q-btn outline color="primary" label="Outline" />
              <q-btn flat color="primary" label="Flat" />
              <q-btn
                unelevated
                color="grey-3"
                text-color="grey-8"
                label="Neutral"
              />
            </div>
          </div>

          <div class="button-group">
            <h4>Status Buttons</h4>
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
              <q-btn size="xs" color="primary" label="Extra Small" />
              <q-btn size="sm" color="primary" label="Small" />
              <q-btn size="md" color="primary" label="Medium" />
              <q-btn size="lg" color="primary" label="Large" />
            </div>
          </div>
        </div>
      </div>

      <!-- NEW Card Design System -->
      <CardStyleGuide />

      <!-- Shadows System -->
      <div class="style-section">
        <h2 class="section-title">🌟 {{ $t('settings.shadowsSection') }}</h2>

        <div class="shadow-showcase">
          <div
            class="shadow-card"
            style="
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08),
                0 1px 2px rgba(0, 0, 0, 0.06);
            "
          >
            <div class="shadow-label">Base Shadow</div>
            <div class="shadow-value">New card system default</div>
          </div>

          <div
            class="shadow-card"
            style="
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12),
                0 4px 10px rgba(0, 0, 0, 0.08);
            "
          >
            <div class="shadow-label">Hover Shadow</div>
            <div class="shadow-value">Interactive card hover</div>
          </div>

          <div
            class="shadow-card"
            style="
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06),
                0 1px 2px rgba(0, 0, 0, 0.04);
            "
          >
            <div class="shadow-label">Interactive Shadow</div>
            <div class="shadow-value">Interactive card default</div>
          </div>

          <div
            class="shadow-card"
            style="
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
                0 1px 3px rgba(0, 0, 0, 0.08);
            "
          >
            <div class="shadow-label">Medium Shadow</div>
            <div class="shadow-value">Elevated elements</div>
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
                <q-icon name="medical_services" size="32px" color="primary" />
                <div class="icon-label">Medical Services</div>
              </div>
              <div class="icon-item">
                <q-icon name="inventory" size="32px" color="secondary" />
                <div class="icon-label">Inventory</div>
              </div>
              <div class="icon-item">
                <q-icon name="health_and_safety" size="32px" color="positive" />
                <div class="icon-label">Health & Safety</div>
              </div>
            </div>
          </div>

          <!-- Status Icons -->
          <div class="icon-group">
            <h4>Status Icons</h4>
            <div class="icon-row">
              <div class="icon-item">
                <q-icon name="check_circle" size="32px" color="positive" />
                <div class="icon-label">Success</div>
              </div>
              <div class="icon-item">
                <q-icon name="warning" size="32px" color="warning" />
                <div class="icon-label">Warning</div>
              </div>
              <div class="icon-item">
                <q-icon name="error" size="32px" color="negative" />
                <div class="icon-label">Error</div>
              </div>
              <div class="icon-item">
                <q-icon name="info" size="32px" color="info" />
                <div class="icon-label">Info</div>
              </div>
            </div>
          </div>

          <!-- Interface Icons -->
          <div class="icon-group">
            <h4>Interface Icons</h4>
            <div class="icon-row">
              <div class="icon-item">
                <q-icon name="settings" size="32px" color="grey-7" />
                <div class="icon-label">Settings</div>
              </div>
              <div class="icon-item">
                <q-icon name="analytics" size="32px" color="blue-7" />
                <div class="icon-label">Analytics</div>
              </div>
              <div class="icon-item">
                <q-icon name="notifications" size="32px" color="orange" />
                <div class="icon-label">Notifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Border Radius System -->
      <div class="style-section">
        <h2 class="section-title">📐 Border Radius System</h2>

        <div class="radius-showcase">
          <div class="radius-item">
            <div class="radius-demo" style="border-radius: 4px"></div>
            <div class="radius-label">Small</div>
            <div class="radius-value">4px</div>
          </div>

          <div class="radius-item">
            <div class="radius-demo" style="border-radius: 8px"></div>
            <div class="radius-label">Medium</div>
            <div class="radius-value">8px</div>
          </div>

          <div class="radius-item">
            <div class="radius-demo" style="border-radius: 12px"></div>
            <div class="radius-label">Large (Cards)</div>
            <div class="radius-value">12px</div>
          </div>

          <div class="radius-item">
            <div class="radius-demo" style="border-radius: 16px"></div>
            <div class="radius-label">Extra Large</div>
            <div class="radius-value">16px</div>
          </div>

          <div class="radius-item">
            <div class="radius-demo" style="border-radius: 50%"></div>
            <div class="radius-label">Round</div>
            <div class="radius-value">50%</div>
          </div>
        </div>
      </div>

      <!-- Spacing System -->
      <div class="style-section">
        <h2 class="section-title">📏 Spacing System</h2>

        <div class="spacing-showcase">
          <div class="spacing-item">
            <div class="spacing-demo" style="width: 4px"></div>
            <div class="spacing-label">XS</div>
            <div class="spacing-value">4px</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: 8px"></div>
            <div class="spacing-label">SM</div>
            <div class="spacing-value">8px</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: 12px"></div>
            <div class="spacing-label">MD</div>
            <div class="spacing-value">12px</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: 16px"></div>
            <div class="spacing-label">LG</div>
            <div class="spacing-value">16px</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: 20px"></div>
            <div class="spacing-label">XL</div>
            <div class="spacing-value">20px</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: 24px"></div>
            <div class="spacing-label">2XL</div>
            <div class="spacing-value">24px</div>
          </div>

          <div class="spacing-item">
            <div class="spacing-demo" style="width: 32px"></div>
            <div class="spacing-label">3XL</div>
            <div class="spacing-value">32px</div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import CardStyleGuide from 'src/components/cards/CardStyleGuide.vue';
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .color-value {
        font-weight: 600;
        font-size: 14px;
      }

      .color-hex {
        font-size: 11px;
        opacity: 0.9;
        font-family: monospace;
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
        font-size: 12px;
        color: var(--text-secondary);
        margin-top: 8px;
        font-family: monospace;
      }
    }
  }

  // Button showcase
  .button-showcase {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .button-group {
      h4 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: var(--text-primary);
      }

      .button-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
      }
    }
  }

  // Shadow showcase
  .shadow-showcase {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;

    .shadow-card {
      background: var(--card-background, #ffffff);
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
        font-size: 12px;
        color: var(--text-secondary);
        font-family: monospace;
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
        font-size: 12px;
        color: var(--text-secondary);
        font-family: monospace;
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
