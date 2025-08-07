<template>
  <PageLayout>
    <template #header>
      <PageTitle
        title="New Card Design System"
        subtitle="Streamlined 3-category card system"
        icon="style"
      />
    </template>

    <div class="style-guide-page">
      <!-- Import our new CardStyleGuide component -->
      <CardStyleGuide />

      <!-- Migration Notice -->
      <div class="migration-notice">
        <AlertCard
          severity="info"
          title="Design System Migration"
          subtitle="Updated card system now available"
          dismissible
        >
          <p>
            We've simplified our card system from 12+ variants to 3 clear
            categories. This improves consistency, maintainability, and user
            experience.
          </p>

          <div class="migration-benefits">
            <h4>Benefits:</h4>
            <ul>
              <li>✅ Clearer purpose for each card type</li>
              <li>✅ Consistent hover effects and interactions</li>
              <li>✅ Better accessibility and keyboard navigation</li>
              <li>✅ Subtler, more professional shadows</li>
              <li>✅ Easier to maintain and extend</li>
            </ul>
          </div>

          <template #actions>
            <q-btn flat color="primary" @click="showOldGuide = !showOldGuide">
              {{ showOldGuide ? 'Hide' : 'View' }} Old System
            </q-btn>
            <q-btn color="primary" @click="navigateToImplementation">
              View Implementation
            </q-btn>
          </template>
        </AlertCard>
      </div>

      <!-- Old System (for comparison) -->
      <div v-if="showOldGuide" class="old-system-section">
        <h2>Previous System (Deprecated)</h2>
        <p class="deprecated-notice">
          The following variants have been deprecated in favor of our new
          3-category system:
        </p>

        <div class="deprecated-cards-grid">
          <div class="deprecated-card">
            <BaseCard
              title="Glass Modern (Deprecated)"
              subtitle="Too complex hover effects"
              icon="blur_on"
              icon-color="primary"
            >
              <p>
                This variant had overly complex hover effects with heavy
                transforms and animations.
              </p>
              <div class="replacement-note">
                <strong>Replace with:</strong> BaseCard or InteractiveCard
                (depending on clickability)
              </div>
            </BaseCard>
          </div>

          <div class="deprecated-card">
            <BaseCard
              title="Neumorph (Deprecated)"
              subtitle="Limited browser support"
              icon="texture"
              icon-color="secondary"
            >
              <p>
                Neumorphism effects don't work well across all browsers and
                themes.
              </p>
              <div class="replacement-note">
                <strong>Replace with:</strong> BaseCard with subtle shadows
              </div>
            </BaseCard>
          </div>

          <div class="deprecated-card">
            <BaseCard
              title="Gradient (Deprecated)"
              subtitle="Distracting animations"
              icon="gradient"
              icon-color="warning"
            >
              <p>
                Animated gradient borders were too distracting from content.
              </p>
              <div class="replacement-note">
                <strong>Replace with:</strong> BaseCard or AlertCard for status
              </div>
            </BaseCard>
          </div>

          <div class="deprecated-card">
            <BaseCard
              title="Premium (Deprecated)"
              subtitle="Unnecessary complexity"
              icon="diamond"
              icon-color="info"
            >
              <p>Premium styling was too complex for most use cases.</p>
              <div class="replacement-note">
                <strong>Replace with:</strong> BaseCard with clean styling
              </div>
            </BaseCard>
          </div>
        </div>
      </div>

      <!-- Implementation Examples -->
      <div class="implementation-section">
        <h2>Migration Examples</h2>
        <p>See how to migrate from old patterns to new ones:</p>

        <div class="migration-examples">
          <div class="migration-example">
            <h3>Before (Old System)</h3>
            <pre><code>&lt;BaseCard
  variant="glass-modern"
  title="Analytics"
  icon="analytics"
  @click="navigate"
&gt;
  Content...
&lt;/BaseCard&gt;</code></pre>

            <h3>After (New System)</h3>
            <pre><code>&lt;InteractiveCard
  title="Analytics"
  icon="analytics"
  icon-color="primary"
  @click="navigate"
&gt;
  Content...
&lt;/InteractiveCard&gt;</code></pre>
          </div>

          <div class="migration-example">
            <h3>Before (Stats Card)</h3>
            <pre><code>&lt;BaseCard
  variant="stats"
  :value="245"
  label="Total Users"
  icon="people"
  :trend="12"
  trend-direction="up"
&gt;</code></pre>

            <h3>After (Base Card with Custom Content)</h3>
            <pre><code>&lt;BaseCard
  title="Total Users"
  icon="people"
  icon-color="primary"
&gt;
  &lt;div class="stat-display"&gt;
    &lt;div class="stat-value"&gt;245&lt;/div&gt;
    &lt;div class="stat-trend positive"&gt;
      +12 this month
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/BaseCard&gt;</code></pre>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import { BaseCard, InteractiveCard, AlertCard } from 'src/components/cards';
  import CardStyleGuide from 'src/components/cards/CardStyleGuide.vue';

  const router = useRouter();
  const showOldGuide = ref(false);

  const navigateToImplementation = () => {
    // Could navigate to component docs or implementation details
    console.log('Navigate to implementation details');
  };
</script>

<style scoped lang="scss">
  .style-guide-page {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .migration-notice {
    .migration-benefits {
      margin-top: 16px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }

      ul {
        margin: 0;
        padding: 0 0 0 20px;

        li {
          margin-bottom: 6px;
          color: var(--text-secondary);
          line-height: 1.4;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .old-system-section {
    padding: 24px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.1);
    border-radius: 12px;

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: var(--text-primary);
    }

    .deprecated-notice {
      font-size: 16px;
      color: var(--text-secondary);
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .body--dark & {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
    }
  }

  .deprecated-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;

    .deprecated-card {
      position: relative;

      &::before {
        content: 'DEPRECATED';
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ef4444;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.5px;
        z-index: 10;
      }

      .replacement-note {
        margin-top: 12px;
        padding: 12px;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.2);
        border-radius: 8px;
        font-size: 14px;

        strong {
          color: var(--text-primary);
        }

        .body--dark & {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
        }
      }
    }
  }

  .implementation-section {
    h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: var(--text-primary);
    }

    > p {
      font-size: 16px;
      color: var(--text-secondary);
      margin: 0 0 24px 0;
      line-height: 1.5;
    }
  }

  .migration-examples {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;

    .migration-example {
      background: var(--card-background, #ffffff);
      border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
      border-radius: 12px;
      padding: 20px;

      h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: var(--text-primary);

        &:not(:first-child) {
          margin-top: 20px;
        }
      }

      pre {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 16px;
        margin: 0;
        overflow-x: auto;
        font-size: 14px;
        line-height: 1.4;

        .body--dark & {
          background: #2a2a2a;
          border-color: #444;
          color: #e9ecef;
        }

        code {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono',
            Consolas, 'Courier New', monospace;
          color: inherit;
        }
      }

      .body--dark & {
        background: #1e1e1e;
        border-color: rgba(255, 255, 255, 0.1);
      }
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .deprecated-cards-grid {
      grid-template-columns: 1fr;
    }

    .migration-examples {
      grid-template-columns: 1fr;
    }
  }
</style>
