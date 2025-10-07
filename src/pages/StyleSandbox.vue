<template>
  <PageLayout>
    <template #header>
      <PageTitle
        title="Style Sandbox"
        subtitle="Interactive testing ground for UI components and patterns"
        icon="science"
      />
    </template>

    <div class="sandbox-container">
      <!-- Token Inspector -->
      <div class="sandbox-section">
        <h2 class="section-title">🎛️ Live Token Editor</h2>
        <p class="section-description">
          Modify design tokens and see changes reflected instantly across all
          components below.
        </p>
        <TokenInspector />
      </div>

      <!-- Component Testing Grid -->
      <div class="sandbox-section">
        <h2 class="section-title">🧪 Component Testing</h2>
        <p class="section-description">
          Test components with different states, sizes, and configurations.
        </p>

        <div class="testing-grid">
          <!-- Button Testing -->
          <div class="test-card">
            <h3>Button Testing</h3>
            <div class="test-controls">
              <div class="control-row">
                <label>Size:</label>
                <q-btn-toggle
                  v-model="buttonSize"
                  :options="[
                    { label: 'XS', value: 'xs' },
                    { label: 'SM', value: 'sm' },
                    { label: 'MD', value: 'md' },
                    { label: 'LG', value: 'lg' },
                  ]"
                />
              </div>
              <div class="control-row">
                <label>Variant:</label>
                <q-btn-toggle
                  v-model="buttonVariant"
                  :options="[
                    { label: 'Filled', value: 'unelevated' },
                    { label: 'Outline', value: 'outline' },
                    { label: 'Flat', value: 'flat' },
                  ]"
                />
              </div>
              <div class="control-row">
                <q-checkbox v-model="buttonLoading" label="Loading" />
                <q-checkbox v-model="buttonDisabled" label="Disabled" />
                <q-checkbox v-model="buttonIcon" label="With Icon" />
              </div>
            </div>
            <div class="test-preview">
              <q-btn
                :size="buttonSize"
                :unelevated="buttonVariant === 'unelevated'"
                :outline="buttonVariant === 'outline'"
                :flat="buttonVariant === 'flat'"
                :loading="buttonLoading"
                :disable="buttonDisabled"
                :icon="buttonIcon ? 'star' : undefined"
                color="primary"
                label="Test Button"
              />
            </div>
          </div>

          <!-- Form Field Testing -->
          <div class="test-card">
            <h3>Form Field Testing</h3>
            <div class="test-controls">
              <div class="control-row">
                <label>Field Type:</label>
                <q-select
                  v-model="fieldType"
                  :options="['input', 'select', 'textarea']"
                  outlined
                  dense
                />
              </div>
              <div class="control-row">
                <q-checkbox v-model="fieldError" label="Error State" />
                <q-checkbox v-model="fieldDisabled" label="Disabled" />
                <q-checkbox v-model="fieldRequired" label="Required" />
              </div>
            </div>
            <div class="test-preview">
              <q-input
                v-if="fieldType === 'input'"
                v-model="testValue"
                outlined
                :label="fieldRequired ? 'Required Field *' : 'Test Field'"
                :error="fieldError"
                :error-message="fieldError ? 'This field has an error' : ''"
                :disable="fieldDisabled"
                placeholder="Enter text..."
              />
              <q-select
                v-else-if="fieldType === 'select'"
                v-model="testSelect"
                :options="['Option 1', 'Option 2', 'Option 3']"
                outlined
                :label="fieldRequired ? 'Required Select *' : 'Test Select'"
                :error="fieldError"
                :error-message="fieldError ? 'Please select an option' : ''"
                :disable="fieldDisabled"
              />
              <q-input
                v-else-if="fieldType === 'textarea'"
                v-model="testTextarea"
                type="textarea"
                outlined
                :label="fieldRequired ? 'Required Textarea *' : 'Test Textarea'"
                :error="fieldError"
                :error-message="fieldError ? 'This field is required' : ''"
                :disable="fieldDisabled"
                placeholder="Enter multiple lines..."
                rows="3"
              />
            </div>
          </div>

          <!-- Card Testing -->
          <div class="test-card">
            <h3>Card Testing</h3>
            <div class="test-controls">
              <div class="control-row">
                <q-checkbox v-model="cardElevated" label="Elevated" />
                <q-checkbox v-model="cardBordered" label="Bordered" />
                <q-checkbox v-model="cardFlat" label="Flat" />
              </div>
            </div>
            <div class="test-preview">
              <q-card
                :class="{
                  'card-elevated': cardElevated,
                  'card-bordered': cardBordered,
                  'card-flat': cardFlat,
                }"
                style="max-width: 300px"
              >
                <q-card-section>
                  <div class="text-h6">Sample Card</div>
                  <div class="text-subtitle2">Card subtitle</div>
                </q-card-section>
                <q-card-section>
                  This is the card content area. It can contain any type of
                  content.
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat>Cancel</q-btn>
                  <q-btn color="primary">Action</q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </div>

          <!-- Alert Testing -->
          <div class="test-card">
            <h3>Alert Testing</h3>
            <div class="test-controls">
              <div class="control-row">
                <label>Type:</label>
                <q-btn-toggle
                  v-model="alertType"
                  :options="[
                    { label: 'Info', value: 'info' },
                    { label: 'Success', value: 'positive' },
                    { label: 'Warning', value: 'warning' },
                    { label: 'Error', value: 'negative' },
                  ]"
                />
              </div>
              <div class="control-row">
                <q-checkbox v-model="alertDismissible" label="Dismissible" />
                <q-checkbox v-model="alertIcon" label="With Icon" />
              </div>
            </div>
            <div class="test-preview">
              <q-banner :class="`alert-${alertType}`" rounded>
                <template v-if="alertIcon" #avatar>
                  <q-icon :name="getAlertIcon(alertType)" />
                </template>
                <strong>{{ getAlertTitle(alertType) }}:</strong> This is a
                sample alert message for testing purposes.
                <template v-if="alertDismissible" #action>
                  <q-btn flat label="Dismiss" />
                </template>
              </q-banner>
            </div>
          </div>
        </div>
      </div>

      <!-- Native vs Quasar Comparison -->
      <div class="sandbox-section">
        <h2 class="section-title">🔄 Native vs Quasar Comparison</h2>
        <p class="section-description">
          Compare native HTML controls with Quasar components to ensure
          consistent styling.
        </p>

        <div class="comparison-grid">
          <div class="comparison-column">
            <h3>Native HTML</h3>
            <div class="native-controls">
              <input
                class="form-control control-sm"
                placeholder="Small input"
              />
              <input
                class="form-control control-md"
                placeholder="Medium input"
              />
              <input
                class="form-control control-lg"
                placeholder="Large input"
              />
              <select class="form-control control-md">
                <option>Native Select</option>
                <option>Option B</option>
              </select>
              <textarea
                class="form-control control-md"
                rows="3"
                placeholder="Native textarea"
              ></textarea>
            </div>
          </div>

          <div class="comparison-column">
            <h3>Quasar Components</h3>
            <div class="quasar-controls">
              <q-input
                v-model="qInputSmall"
                outlined
                label="Small QInput"
                class="control-sm"
                dense
              />
              <q-input
                v-model="qInputMedium"
                outlined
                label="Medium QInput"
                class="control-md"
              />
              <q-input
                v-model="qInputLarge"
                outlined
                label="Large QInput"
                class="control-lg"
              />
              <q-select
                v-model="qSelectValue"
                outlined
                label="Quasar QSelect"
                class="control-md"
                :options="['Quasar Select', 'Option B']"
              />
              <q-input
                v-model="qTextareaValue"
                outlined
                type="textarea"
                label="Quasar Textarea"
                class="control-md"
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Playground -->
      <div class="sandbox-section">
        <h2 class="section-title">🎮 Interactive Playground</h2>
        <p class="section-description">
          Test complex interactions and component combinations.
        </p>

        <div class="playground-area">
          <div class="playground-controls">
            <q-btn color="primary" @click="showSampleDialog = true">
              Test Dialog
            </q-btn>
            <q-btn color="secondary" @click="showSampleMenu = true">
              Test Menu
            </q-btn>
            <q-btn color="positive" @click="showToast('positive')">
              Success Toast
            </q-btn>
            <q-btn color="warning" @click="showToast('warning')">
              Warning Toast
            </q-btn>
            <q-btn color="negative" @click="showToast('negative')">
              Error Toast
            </q-btn>
          </div>

          <div class="playground-preview">
            <div class="preview-section">
              <h4>Sample Form</h4>
              <q-form class="sample-form">
                <q-input
                  v-model="playgroundForm.name"
                  outlined
                  label="Full Name"
                  :rules="[val => !!val || 'Name is required']"
                />
                <q-input
                  v-model="playgroundForm.email"
                  outlined
                  type="email"
                  label="Email Address"
                  :rules="[val => !!val || 'Email is required']"
                />
                <q-select
                  v-model="playgroundForm.role"
                  outlined
                  label="Role"
                  :options="['Admin', 'User', 'Manager']"
                  :rules="[val => !!val || 'Role is required']"
                />
                <div class="form-actions">
                  <q-btn flat label="Cancel" />
                  <q-btn color="primary" label="Submit" type="submit" />
                </div>
              </q-form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sample Dialog -->
    <q-dialog v-model="showSampleDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Sample Dialog</div>
        </q-card-section>
        <q-card-section>
          This is a sample dialog for testing the dialog system.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cancel" />
          <q-btn v-close-popup color="primary" label="OK" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Sample Menu -->
    <q-menu v-model="showSampleMenu">
      <q-list style="min-width: 200px">
        <q-item v-close-popup clickable>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
        <q-item v-close-popup clickable>
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>Help</q-item-section>
        </q-item>
        <q-separator />
        <q-item v-close-popup clickable>
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useQuasar } from 'quasar';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import TokenInspector from 'src/components/TokenInspector.vue';

  const $q = useQuasar();

  // Button testing controls
  const buttonSize = ref('md');
  const buttonVariant = ref('unelevated');
  const buttonLoading = ref(false);
  const buttonDisabled = ref(false);
  const buttonIcon = ref(false);

  // Form field testing controls
  const fieldType = ref('input');
  const fieldError = ref(false);
  const fieldDisabled = ref(false);
  const fieldRequired = ref(false);
  const testValue = ref('');
  const testSelect = ref(null);
  const testTextarea = ref('');

  // Comparison section values
  const qInputSmall = ref('');
  const qInputMedium = ref('');
  const qInputLarge = ref('');
  const qSelectValue = ref(null);
  const qTextareaValue = ref('');

  // Card testing controls
  const cardElevated = ref(false);
  const cardBordered = ref(true);
  const cardFlat = ref(false);

  // Alert testing controls
  const alertType = ref('info');
  const alertDismissible = ref(true);
  const alertIcon = ref(true);

  // Dialog and menu states
  const showSampleDialog = ref(false);
  const showSampleMenu = ref(false);

  // Playground form
  const playgroundForm = ref({
    name: '',
    email: '',
    role: null,
  });

  // Helper functions
  function getAlertIcon(type: string) {
    switch (type) {
      case 'info':
        return 'info';
      case 'positive':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'negative':
        return 'error';
      default:
        return 'info';
    }
  }

  function getAlertTitle(type: string) {
    switch (type) {
      case 'info':
        return 'Information';
      case 'positive':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'negative':
        return 'Error';
      default:
        return 'Notice';
    }
  }

  function showToast(type: string) {
    const messages = {
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
  .sandbox-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--space-4);
  }

  .sandbox-section {
    .section-title {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--space-3) 0;
      color: var(--text-primary);
    }

    .section-description {
      font-size: var(--text-base);
      color: var(--text-secondary);
      margin-bottom: var(--space-6);
      line-height: var(--leading-relaxed);
    }
  }

  // Testing Grid
  .testing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-6);
  }

  .test-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow-sm);

    h3 {
      margin: 0 0 var(--space-4) 0;
      font-size: var(--text-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
    }

    .test-controls {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding: var(--space-4);
      background: var(--bg-tertiary);
      border-radius: var(--radius-base);

      .control-row {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex-wrap: wrap;

        label {
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          min-width: 60px;
        }
      }
    }

    .test-preview {
      padding: var(--space-4);
      border: 2px dashed var(--border-secondary);
      border-radius: var(--radius-base);
      background: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
    }
  }

  // Comparison Grid
  .comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
  }

  .comparison-column {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-6);

    h3 {
      margin: 0 0 var(--space-4) 0;
      font-size: var(--text-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      text-align: center;
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--border-primary);
    }

    .native-controls,
    .quasar-controls {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
  }

  // Playground
  .playground-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .playground-controls {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    padding: var(--space-4);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-primary);
  }

  .playground-preview {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-6);

    .preview-section {
      h4 {
        margin: 0 0 var(--space-4) 0;
        font-size: var(--text-base);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
      }

      .sample-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        max-width: 400px;

        .form-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: flex-end;
          margin-top: var(--space-4);
        }
      }
    }
  }

  // Alert styles
  .alert-info {
    background: rgba(30, 64, 175, 0.1);
    border-left: 4px solid var(--brand-info);
    color: var(--brand-info);
  }

  .alert-positive {
    background: rgba(5, 150, 105, 0.1);
    border-left: 4px solid var(--brand-success);
    color: var(--brand-success);
  }

  .alert-warning {
    background: rgba(217, 119, 6, 0.1);
    border-left: 4px solid var(--brand-warning);
    color: var(--brand-warning);
  }

  .alert-negative {
    background: rgba(185, 28, 28, 0.1);
    border-left: 4px solid var(--brand-danger);
    color: var(--brand-danger);
  }

  // Card variants
  .card-elevated {
    box-shadow: var(--shadow-lg);
  }

  .card-bordered {
    border: 2px solid var(--border-primary);
  }

  .card-flat {
    box-shadow: none;
    border: none;
  }

  // Native form controls styling
  .form-control {
    width: 100%;
    padding: var(--control-pad-y) var(--control-pad-x);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    font-size: var(--control-font-md);
    font-family: var(--font-family);
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all var(--transition-base);

    &:focus {
      outline: none;
      border-color: var(--brand-primary);
      box-shadow: var(--focus-ring);
    }

    &.control-sm {
      height: var(--control-height-sm);
      font-size: var(--control-font-sm);
    }

    &.control-md {
      height: var(--control-height-md);
      font-size: var(--control-font-md);
    }

    &.control-lg {
      height: var(--control-height-lg);
      font-size: var(--control-font-lg);
    }

    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .sandbox-container {
      padding: 0 var(--space-3);
    }

    .testing-grid {
      grid-template-columns: 1fr;
    }

    .comparison-grid {
      grid-template-columns: 1fr;
    }

    .playground-controls {
      justify-content: center;
    }
  }
</style>
