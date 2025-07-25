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
            <div
              class="color-swatch"
              style="background: var(--brand-primary)"
            ></div>
            <div class="color-info">
              <div class="color-name">Primary</div>
              <div class="color-value">#1e3a8a</div>
              <div class="color-usage">Main brand color, buttons, links</div>
            </div>
          </div>
          <div class="color-card">
            <div
              class="color-swatch"
              style="background: var(--brand-primary-light)"
            ></div>
            <div class="color-info">
              <div class="color-name">Primary Light</div>
              <div class="color-value">#3b82f6</div>
              <div class="color-usage">Hover states, accents</div>
            </div>
          </div>
          <div class="color-card">
            <div
              class="color-swatch"
              style="background: var(--brand-secondary)"
            ></div>
            <div class="color-info">
              <div class="color-name">Secondary</div>
              <div class="color-value">#0f766e</div>
              <div class="color-usage">Secondary actions, teal theme</div>
            </div>
          </div>
          <div class="color-card">
            <div
              class="color-swatch"
              style="background: var(--brand-accent)"
            ></div>
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
            <div
              class="color-swatch"
              style="background: var(--brand-success)"
            ></div>
            <div class="color-info">
              <div class="color-name">Success</div>
              <div class="color-value">#065f46</div>
              <div class="color-usage">Success states, positive actions</div>
            </div>
          </div>
          <div class="color-card">
            <div
              class="color-swatch"
              style="background: var(--brand-warning)"
            ></div>
            <div class="color-info">
              <div class="color-name">Warning</div>
              <div class="color-value">#d97706</div>
              <div class="color-usage">Warning messages, alerts</div>
            </div>
          </div>
          <div class="color-card">
            <div
              class="color-swatch"
              style="background: var(--brand-danger)"
            ></div>
            <div class="color-info">
              <div class="color-name">Danger</div>
              <div class="color-value">#b91c1c</div>
              <div class="color-usage">Error states, destructive actions</div>
            </div>
          </div>
          <div class="color-card">
            <div
              class="color-swatch"
              style="background: var(--brand-info)"
            ></div>
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
          <div
            v-for="(color, index) in neutralColors"
            :key="index"
            class="neutral-card"
          >
            <div
              class="neutral-swatch"
              :style="`background: var(--neutral-${color.value})`"
            ></div>
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
          <div style="font-size: var(--text-sm)">
            Small Text - 0.875rem (14px)
          </div>
          <div style="font-size: var(--text-xs)">
            Extra Small - 0.75rem (12px)
          </div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">Font Weights</h3>
        <div class="typography-showcase">
          <div style="font-weight: var(--font-weight-normal)">
            Normal Weight (400)
          </div>
          <div style="font-weight: var(--font-weight-medium)">
            Medium Weight (500)
          </div>
          <div style="font-weight: var(--font-weight-semibold)">
            Semibold Weight (600)
          </div>
          <div style="font-weight: var(--font-weight-bold)">
            Bold Weight (700)
          </div>
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
          <q-btn :label="$t('settings.primaryButton')" color="primary" class="btn-modern" />
          <q-btn :label="$t('settings.secondaryButton')" color="secondary" class="btn-modern" />
          <q-btn :label="$t('settings.successButton')" color="positive" class="btn-modern" />
          <q-btn :label="$t('settings.warningButton')" color="warning" class="btn-modern" />
          <q-btn :label="$t('settings.dangerButton')" color="negative" class="btn-modern" />
          <q-btn :label="$t('settings.infoButton')" color="info" class="btn-modern" />
        </div>
      </div>

      <!-- Outline Buttons -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.outlinedButtons') }}</h3>
        <div class="button-showcase">
          <q-btn :label="$t('settings.primaryButton')" outline color="primary" class="btn-modern" />
          <q-btn
            :label="$t('settings.secondaryButton')"
            outline
            color="secondary"
            class="btn-modern"
          />
          <q-btn :label="$t('settings.successButton')" outline color="positive" class="btn-modern" />
          <q-btn :label="$t('settings.warningButton')" outline color="warning" class="btn-modern" />
          <q-btn :label="$t('settings.dangerButton')" outline color="negative" class="btn-modern" />
          <q-btn :label="$t('settings.infoButton')" outline color="info" class="btn-modern" />
        </div>
      </div>

      <!-- Flat Buttons -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.flatButtons') }}</h3>
        <div class="button-showcase">
          <q-btn :label="$t('settings.primaryButton')" flat color="primary" class="btn-modern" />
          <q-btn :label="$t('settings.secondaryButton')" flat color="secondary" class="btn-modern" />
          <q-btn :label="$t('settings.successButton')" flat color="positive" class="btn-modern" />
          <q-btn :label="$t('settings.warningButton')" flat color="warning" class="btn-modern" />
          <q-btn :label="$t('settings.dangerButton')" flat color="negative" class="btn-modern" />
          <q-btn :label="$t('settings.infoButton')" flat color="info" class="btn-modern" />
        </div>
      </div>

      <!-- Button with Icons -->
      <div class="subsection">
        <h3 class="subsection-title">{{ $t('settings.iconButtons') }}</h3>
        <div class="button-showcase">
          <q-btn
            :label="$t('settings.addProductButton')"
            icon="add"
            color="primary"
            class="btn-modern"
          />
          <q-btn
            :label="$t('settings.editButton')"
            icon="edit"
            color="secondary"
            class="btn-modern"
          />
          <q-btn
            :label="$t('settings.deleteButton')"
            icon="delete"
            color="negative"
            class="btn-modern"
          />
          <q-btn :label="$t('settings.saveButton')" icon="save" color="positive" class="btn-modern" />
          <q-btn
            :label="$t('settings.downloadButton')"
            icon="download"
            color="info"
            class="btn-modern"
          />
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
          :title="$t('settings.cards.defaultCard.title')"
          :subtitle="$t('settings.cards.defaultCard.subtitle')"
          icon="article"
        >
          <p>
            {{ $t('settings.cards.defaultCard.description') }}
          </p>
          <template #actions>
            <q-btn outline color="primary" :label="$t('settings.cards.defaultCard.action')" />
          </template>
        </BaseCard>

        <!-- Modern Card -->
        <BaseCard
          variant="modern"
          :title="$t('settings.cards.modernCard.title')"
          :subtitle="$t('settings.cards.modernCard.subtitle')"
          icon="auto_awesome"
          header-color="primary"
        >
          <p>
            {{ $t('settings.cards.modernCard.description') }}
          </p>
          <template #actions>
            <q-btn color="primary" :label="$t('settings.cards.modernCard.action')" />
          </template>
        </BaseCard>

        <!-- Elevated Card -->
        <BaseCard
          variant="elevated"
          :title="$t('settings.cards.elevatedCard.title')"
          :subtitle="$t('settings.cards.elevatedCard.subtitle')"
          icon="star"
          header-color="secondary"
        >
          <p>
            {{ $t('settings.cards.elevatedCard.description') }}
          </p>
          <template #actions>
            <q-btn color="secondary" :label="$t('settings.cards.elevatedCard.action')" />
          </template>
        </BaseCard>

        <!-- Glass Card -->
        <BaseCard
          variant="glass"
          :title="$t('settings.cards.glassCard.title')"
          :subtitle="$t('settings.cards.glassCard.subtitle')"
          icon="blur_on"
          header-color="info"
        >
          <p>
            {{ $t('settings.cards.glassCard.description') }}
          </p>
          <template #actions>
            <q-btn outline color="info" :label="$t('settings.cards.glassCard.action')" />
          </template>
        </BaseCard>

        <!-- Outlined Card -->
        <BaseCard
          variant="outlined"
          :title="$t('settings.cards.outlinedCard.title')"
          :subtitle="$t('settings.cards.outlinedCard.subtitle')"
          icon="border_style"
          header-color="positive"
          size="sm"
        >
          <p>
            {{ $t('settings.cards.outlinedCard.description') }}
          </p>
          <template #actions>
            <q-btn flat color="positive" :label="$t('settings.cards.outlinedCard.action')" />
          </template>
        </BaseCard>

        <!-- Warning Card Example -->
        <BaseCard
          variant="modern"
          :title="$t('settings.cards.warningCard.title')"
          :subtitle="$t('settings.cards.warningCard.subtitle')"
          icon="warning"
          header-color="warning"
        >
          <p>
            {{ $t('settings.cards.warningCard.description') }}
          </p>
          <template #actions>
            <q-btn color="warning" :label="$t('settings.cards.warningCard.action')" />
          </template>
        </BaseCard>
      </div>

      <div class="design-notes">
        <h4>🎨 Card Design Guidelines</h4>
        <ul>
          <li><strong>Default:</strong> Use for standard content containers</li>
          <li>
            <strong>Modern:</strong> Enhanced styling with borders for
            contemporary designs
          </li>
          <li>
            <strong>Elevated:</strong> Use for important content that needs
            emphasis
          </li>
          <li>
            <strong>Glass:</strong> Use for overlay content or modern aesthetic
          </li>
          <li>
            <strong>Outlined:</strong> Use in minimal designs or when shadows
            aren't appropriate
          </li>
          <li>
            <strong>Header Colors:</strong> Use to categorize different types of
            content
          </li>
        </ul>
      </div>
    </div>

    <!-- Shadows System -->
    <div class="style-section">
      <h2 class="section-title">🌟 {{ $t('settings.shadowsSection') }}</h2>

      <div class="shadow-showcase">
        <div class="shadow-card" style="box-shadow: var(--shadow-xs)">
          <div class="shadow-label">Extra Small</div>
          <div class="shadow-value">--shadow-xs</div>
        </div>

        <div class="shadow-card" style="box-shadow: var(--shadow-sm)">
          <div class="shadow-label">Small</div>
          <div class="shadow-value">--shadow-sm</div>
        </div>

        <div class="shadow-card" style="box-shadow: var(--shadow-base)">
          <div class="shadow-label">Base</div>
          <div class="shadow-value">--shadow-base</div>
        </div>

        <div class="shadow-card" style="box-shadow: var(--shadow-md)">
          <div class="shadow-label">Medium</div>
          <div class="shadow-value">--shadow-md</div>
        </div>

        <div class="shadow-card" style="box-shadow: var(--shadow-lg)">
          <div class="shadow-label">Large</div>
          <div class="shadow-value">--shadow-lg</div>
        </div>

        <div class="shadow-card" style="box-shadow: var(--shadow-xl)">
          <div class="shadow-label">Extra Large</div>
          <div class="shadow-value">--shadow-xl</div>
        </div>
      </div>
    </div>

    <!-- Modern Card Showcase -->
    <div class="style-section">
      <h2 class="section-title">🎨 Modern Card System</h2>
      <p class="section-description">
        Ultra-moderne card variants met de nieuwste design trends: glassmorphism, neumorphism, gradient effecten en micro-interactions.
      </p>

      <!-- Demo Notice -->
      <div class="demo-notice">
        <div class="demo-notice-header">
          <q-icon name="info" size="20px" color="primary" />
          <span>Live Demo Effects</span>
        </div>
        <ul class="demo-effects-list">
          <li><strong>Glassmorphism:</strong> Backdrop blur met transparantie - hover voor extra effecten</li>
          <li><strong>Neumorphism:</strong> 3D ingebouwde schaduwen - klik om inset effect te zien</li>
          <li><strong>Gradient:</strong> Animerende regenboog borders - continu roterende kleuren</li>
          <li><strong>Quick Actions:</strong> Micro-interactions met progress bars en badges</li>
        </ul>
        <div class="demo-note">
          💡 <em>Als effecten niet zichtbaar zijn, check of je browser backdrop-filter ondersteunt (Chrome/Safari/Firefox 103+)</em>
        </div>
      </div>

      <div class="cards-showcase">
        <div class="card-row">
          <!-- Glass Modern Card -->
          <div class="card-demo">
            <BaseCard 
              variant="glass-modern" 
              title="Glass Modern" 
              subtitle="Enhanced glassmorphism with depth"
              icon="auto_awesome"
              icon-color="primary"
            >
              <p>Ultra-moderne glassmorphism met backdrop blur, gradients en perfect hover effecten.</p>
            </BaseCard>
            <div class="card-label">variant="glass-modern"</div>
          </div>

          <!-- Neumorphism Card -->
          <div class="card-demo">
            <BaseCard 
              variant="neumorph" 
              title="Neumorphism" 
              subtitle="Soft 3D embossed effect"
              icon="3d_rotation"
              icon-color="secondary"
            >
              <p>Zachte 3D effecten die elementen laten lijken alsof ze uit het oppervlak komen.</p>
            </BaseCard>
            <div class="card-label">variant="neumorph"</div>
          </div>

          <!-- Gradient Card -->
          <div class="card-demo">
            <BaseCard 
              variant="gradient" 
              title="Gradient Border" 
              subtitle="Animated gradient borders"
              icon="gradient"
              icon-color="accent"
            >
              <p>Prachtige animerende gradient borders die de focus trekken.</p>
            </BaseCard>
            <div class="card-label">variant="gradient"</div>
          </div>
        </div>

        <div class="card-row">
          <!-- Premium Card -->
          <div class="card-demo">
            <BaseCard 
              variant="premium" 
              title="Premium Luxury" 
              subtitle="High-end feel with subtle effects"
              icon="diamond"
              icon-color="warning"
            >
              <p>Luxe gevoel met subtiele schaduwen en premium materiaal effecten.</p>
            </BaseCard>
            <div class="card-label">variant="premium"</div>
          </div>

          <!-- Quick Action Card - Blue -->
          <div class="card-demo">
            <BaseCard 
              variant="quick-action" 
              title="Scan Batch"
              action-description="Scan barcode om batch te vinden"
              action-icon="qr_code_scanner"
              gradient-direction="blue"
              :action-progress="75"
            />
            <div class="card-label">variant="quick-action"</div>
          </div>

          <!-- Quick Action Card - Orange -->
          <div class="card-demo">
            <BaseCard 
              variant="quick-action" 
              title="View Expiring"
              action-description="5 batches verlopen binnenkort"
              action-icon="warning"
              gradient-direction="orange"
              :action-badge="5"
              :action-progress="60"
            />
            <div class="card-label">gradient-direction="orange"</div>
          </div>
        </div>

        <div class="card-row">
          <!-- Stats Cards -->
          <div class="card-demo">
            <BaseCard 
              variant="stats"
              :value="1234"
              label="Total Products"
              icon="inventory"
              icon-color="primary"
              trend="+12%"
              trend-direction="up"
            />
            <div class="card-label">variant="stats"</div>
          </div>

          <!-- Modern Elevated -->
          <div class="card-demo">
            <BaseCard 
              variant="elevated" 
              title="Modern Elevated" 
              subtitle="Classic with modern touches"
              icon="trending_up"
              icon-color="positive"
            >
              <p>Klassieke elevated style met moderne hover effecten en betere schaduwen.</p>
            </BaseCard>
            <div class="card-label">variant="elevated"</div>
          </div>

          <!-- Traditional Glass -->
          <div class="card-demo">
            <BaseCard 
              variant="glass" 
              title="Traditional Glass" 
              subtitle="Basic glassmorphism"
              icon="blur_on"
              icon-color="info"
            >
              <p>Basis glassmorphism effect voor subtiele transparantie.</p>
            </BaseCard>
            <div class="card-label">variant="glass"</div>
          </div>
        </div>
      </div>

      <!-- Quick Action Variants -->
      <div class="style-subsection">
        <h3>Quick Action Color Variants</h3>
        <div class="quick-actions-demo">
          <BaseCard 
            variant="quick-action" 
            title="Blue Action"
            action-description="Primary actions"
            action-icon="star"
            gradient-direction="blue"
            size="sm"
          />
          <BaseCard 
            variant="quick-action" 
            title="Green Action"
            action-description="Success actions"
            action-icon="check_circle"
            gradient-direction="green"
            size="sm"
          />
          <BaseCard 
            variant="quick-action" 
            title="Purple Action"
            action-description="Creative actions"
            action-icon="palette"
            gradient-direction="purple"
            size="sm"
          />
          <BaseCard 
            variant="quick-action" 
            title="Red Action"
            action-description="Important actions"
            action-icon="priority_high"
            gradient-direction="red"
            size="sm"
          />
        </div>
      </div>
    </div>

    <!-- Icon System -->
    <div class="style-section">
      <h2 class="section-title">🎯 {{ $t('settings.iconsSection') }}</h2>

      <div class="icon-showcase">
        <!-- Medical Icons -->
        <div class="icon-group">
          <q-icon
            name="medical_services"
            size="var(--icon-lg)"
            color="primary"
          />
          <div class="icon-label">Medical Services</div>
          <div class="icon-class">medical_services</div>
        </div>

        <div class="icon-group">
          <q-icon name="inventory" size="var(--icon-lg)" color="secondary" />
          <div class="icon-label">Inventory</div>
          <div class="icon-class">inventory</div>
        </div>

        <div class="icon-group">
          <q-icon name="shopping_cart" size="var(--icon-lg)" color="orange" />
          <div class="icon-label">Orders</div>
          <div class="icon-class">shopping_cart</div>
        </div>

        <!-- Status Icons -->
        <div class="icon-group">
          <q-icon name="check_circle" size="var(--icon-lg)" color="positive" />
          <div class="icon-label">Success</div>
          <div class="icon-class">check_circle</div>
        </div>

        <div class="icon-group">
          <q-icon name="warning" size="var(--icon-lg)" color="warning" />
          <div class="icon-label">Warning</div>
          <div class="icon-class">warning</div>
        </div>

        <div class="icon-group">
          <q-icon name="error" size="var(--icon-lg)" color="negative" />
          <div class="icon-label">Error</div>
          <div class="icon-class">error</div>
        </div>

        <!-- Interface Icons -->
        <div class="icon-group">
          <q-icon name="settings" size="var(--icon-lg)" color="grey-7" />
          <div class="icon-label">Settings</div>
          <div class="icon-class">settings</div>
        </div>

        <div class="icon-group">
          <q-icon name="analytics" size="var(--icon-lg)" color="blue-7" />
          <div class="icon-label">Analytics</div>
          <div class="icon-class">analytics</div>
        </div>
      </div>
    </div>

    <!-- Border Radius System -->
    <div class="style-section">
      <h2 class="section-title">📐 Border Radius System</h2>

      <div class="radius-showcase">
        <div class="radius-item">
          <div
            class="radius-demo"
            style="border-radius: var(--radius-sm)"
          ></div>
          <div class="radius-label">Small</div>
          <div class="radius-class">--radius-sm</div>
        </div>

        <div class="radius-item">
          <div
            class="radius-demo"
            style="border-radius: var(--radius-base)"
          ></div>
          <div class="radius-label">Base</div>
          <div class="radius-class">--radius-base</div>
        </div>

        <div class="radius-item">
          <div
            class="radius-demo"
            style="border-radius: var(--radius-lg)"
          ></div>
          <div class="radius-label">Large</div>
          <div class="radius-class">--radius-lg</div>
        </div>

        <div class="radius-item">
          <div
            class="radius-demo"
            style="border-radius: var(--radius-xl)"
          ></div>
          <div class="radius-label">Extra Large</div>
          <div class="radius-class">--radius-xl</div>
        </div>

        <div class="radius-item">
          <div
            class="radius-demo"
            style="border-radius: var(--radius-2xl)"
          ></div>
          <div class="radius-label">2X Large</div>
          <div class="radius-class">--radius-2xl</div>
        </div>

        <div class="radius-item">
          <div
            class="radius-demo"
            style="border-radius: var(--radius-full)"
          ></div>
          <div class="radius-label">Full</div>
          <div class="radius-class">--radius-full</div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import BaseCard from 'src/components/base/BaseCard.vue';

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
  ];

  // Demo data for design system components
  // (Clean focus on design system only)
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
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
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
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);

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
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
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
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-lg);
    text-align: center;
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
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
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
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

  // Modern Card Showcase Styling
  .cards-showcase {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .card-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .card-demo {
    position: relative;
  }

  .card-label {
    margin-top: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--neutral-100);
    border-radius: var(--radius-sm);
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    font-size: var(--text-xs);
    color: var(--neutral-700);
    text-align: center;
    border: 1px solid var(--neutral-200);

    .body--dark & {
      background: var(--neutral-800);
      color: var(--neutral-300);
      border-color: var(--neutral-700);
    }
  }

  .style-subsection {
    margin-top: var(--space-8);
    
    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-2);

      &::before {
        content: '';
        width: 4px;
        height: 20px;
        background: var(--brand-primary);
        border-radius: var(--radius-full);
      }
    }
  }

  .quick-actions-demo {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);

    .base-card {
      min-height: 120px;
    }
  }

  .section-description {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: var(--space-6);
    line-height: var(--leading-relaxed);
    max-width: 600px;
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .card-showcase {
      grid-template-columns: 1fr;
    }

    .card-row {
      grid-template-columns: 1fr;
    }

    .quick-actions-demo {
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

  // Design system specific styling
  .design-notes {
    margin-top: var(--space-6);
    padding: var(--space-4);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--brand-primary);
    box-shadow: var(--glass-shadow);

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

          body.body--dark & {
            color: var(--neutral-200);
          }
        }
      }
    }
  }

  // Demo Notice Styles
  .demo-notice {
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--neutral-50);
    border-radius: var(--radius-base);
    border: 1px solid var(--neutral-200);
    box-shadow: var(--shadow-xs);

    .demo-notice-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
      color: var(--brand-primary);
      font-weight: var(--font-weight-semibold);
      font-size: var(--text-base);
    }

    .demo-effects-list {
      list-style: none;
      padding: 0;
      margin-bottom: var(--space-2);

      li {
        margin-bottom: var(--space-1);
        font-size: var(--text-sm);
        color: var(--neutral-700);
        line-height: var(--leading-relaxed);

        strong {
          color: var(--neutral-900);
        }
      }
    }

         .demo-note {
       font-size: var(--text-xs);
       color: var(--neutral-600);
       font-style: italic;
     }

     // Dark mode support
     .body--dark & {
       background: var(--neutral-800);
       border-color: var(--neutral-700);

       .demo-notice-header {
         color: var(--brand-primary-light);
       }

       .demo-effects-list li {
         color: var(--neutral-300);

         strong {
           color: var(--neutral-100);
         }
       }

       .demo-note {
         color: var(--neutral-400);
       }
     }
   }
</style>
