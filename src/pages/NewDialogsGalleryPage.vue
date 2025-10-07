<template>
  <PageLayout>
    <template #header>
      <PageTitle
        title="Dialog Gallery"
        subtitle="Showcase of BaseDialog and FormDialog components with tokenized styles"
        icon="view_carousel"
      />
    </template>

    <div class="dialogs-gallery">
      <!-- BaseDialog Examples -->
      <section class="gallery-section">
        <h2 class="section-title">🪟 BaseDialog Examples</h2>
        <p class="section-description">
          BaseDialog provides the foundation for all modal interactions with
          consistent styling, keyboard navigation (ESC to close), focus
          management, and tokenized design.
        </p>

        <div class="demo-buttons">
          <q-btn
            label="Small Dialog"
            icon="info"
            color="primary"
            class="demo-btn"
            @click="showSmall = true"
          />
          <q-btn
            label="Medium Dialog"
            icon="list"
            color="secondary"
            class="demo-btn"
            @click="showMedium = true"
          />
          <q-btn
            label="Large Dialog"
            icon="fullscreen"
            color="accent"
            class="demo-btn"
            @click="showLarge = true"
          />
          <q-btn
            label="Persistent Dialog"
            icon="lock"
            color="warning"
            class="demo-btn"
            @click="showPersistent = true"
          />
        </div>
      </section>

      <!-- FormDialog Examples -->
      <section class="gallery-section">
        <h2 class="section-title">📝 FormDialog Examples</h2>
        <p class="section-description">
          FormDialog extends BaseDialog with form-specific features: validation,
          loading states, confirm-before-close functionality, and standardized
          action buttons.
        </p>

        <div class="demo-buttons">
          <q-btn
            label="Simple Form"
            icon="edit"
            color="positive"
            class="demo-btn"
            @click="showSimpleForm = true"
          />
          <q-btn
            label="Complex Form"
            icon="assignment"
            color="info"
            class="demo-btn"
            @click="showComplexForm = true"
          />
          <q-btn
            label="Loading Form"
            icon="hourglass_empty"
            color="purple"
            class="demo-btn"
            @click="showLoadingForm = true"
          />
          <q-btn
            label="Validation Form"
            icon="error"
            color="negative"
            class="demo-btn"
            @click="showValidationForm = true"
          />
        </div>
      </section>

      <!-- Feature Demonstrations -->
      <section class="gallery-section">
        <h2 class="section-title">⚡ Feature Demonstrations</h2>
        <p class="section-description">
          Advanced features including focus trapping, confirm-close dialogs, and
          keyboard navigation.
        </p>

        <div class="demo-buttons">
          <q-btn
            label="Confirm Close"
            icon="warning"
            color="orange"
            class="demo-btn"
            @click="showConfirmClose = true"
          />
          <q-btn
            label="Multi-Step Wizard"
            icon="linear_scale"
            color="teal"
            class="demo-btn"
            @click="showWizard = true"
          />
          <q-btn
            label="Nested Dialogs"
            icon="layers"
            color="deep-purple"
            class="demo-btn"
            @click="showNested = true"
          />
        </div>
      </section>

      <!-- BaseDialog Instances -->
      <BaseDialog
        v-model="showSmall"
        title="Small Dialog"
        subtitle="Compact size with tokenized styling"
        icon="info"
        size="sm"
        @close="handleDialogClose('small')"
      >
        <div class="dialog-content">
          <p>This is a small dialog demonstrating:</p>
          <ul>
            <li>Tokenized colors and spacing</li>
            <li>ESC key to close</li>
            <li>Focus management</li>
            <li>Responsive design</li>
          </ul>
          <q-input
            v-model="sampleInputValue"
            outlined
            label="Sample Input"
            placeholder="Try pressing ESC to close"
            class="q-mt-md"
          />
        </div>
      </BaseDialog>

      <BaseDialog
        v-model="showMedium"
        title="Medium Dialog"
        subtitle="Standard size for most content"
        icon="list"
        size="md"
        @close="handleDialogClose('medium')"
      >
        <div class="dialog-content">
          <q-list bordered separator class="tokenized-list">
            <q-item-label header class="list-header"
              >Sample List Items</q-item-label
            >
            <q-item v-for="n in 8" :key="n" v-ripple clickable>
              <q-item-section avatar>
                <q-icon :name="getRandomIcon(n)" :color="getRandomColor(n)" />
              </q-item-section>
              <q-item-section>
                <q-item-label>List Item {{ n }}</q-item-label>
                <q-item-label caption>With tokenized styling</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </BaseDialog>

      <BaseDialog
        v-model="showLarge"
        title="Large Dialog"
        subtitle="Maximum content area"
        icon="fullscreen"
        size="lg"
        @close="handleDialogClose('large')"
      >
        <div class="dialog-content">
          <div class="large-content-grid">
            <div class="content-section">
              <h4>Features</h4>
              <p>Large dialogs are perfect for:</p>
              <ul>
                <li>Complex forms</li>
                <li>Data tables</li>
                <li>Rich content</li>
                <li>Multi-column layouts</li>
              </ul>
            </div>
            <div class="content-section">
              <h4>Design Tokens</h4>
              <div class="token-showcase">
                <div
                  class="token-item"
                  style="background: var(--brand-primary)"
                >
                  Primary
                </div>
                <div
                  class="token-item"
                  style="background: var(--brand-secondary)"
                >
                  Secondary
                </div>
                <div class="token-item" style="background: var(--brand-accent)">
                  Accent
                </div>
                <div
                  class="token-item"
                  style="background: var(--color-success)"
                >
                  Success
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseDialog>

      <BaseDialog
        v-model="showPersistent"
        title="Persistent Dialog"
        subtitle="Cannot be closed by clicking outside"
        icon="lock"
        size="md"
        persistent
        @close="handleDialogClose('persistent')"
      >
        <div class="dialog-content">
          <q-banner class="bg-warning text-dark">
            <template #avatar>
              <q-icon name="warning" />
            </template>
            This dialog is persistent - you must use the close button or ESC
            key.
          </q-banner>
          <p class="q-mt-md">
            Persistent dialogs prevent accidental closure and are useful for:
          </p>
          <ul>
            <li>Critical confirmations</li>
            <li>Unsaved form data</li>
            <li>Multi-step processes</li>
          </ul>
        </div>
        <template #actions>
          <q-btn
            label="Close Dialog"
            color="primary"
            @click="showPersistent = false"
          />
        </template>
      </BaseDialog>

      <!-- FormDialog Instances -->
      <FormDialog
        v-model="showSimpleForm"
        title="Simple Form"
        subtitle="Basic form with validation"
        icon="edit"
        size="md"
        :loading="simpleFormLoading"
        @submit="handleSimpleFormSubmit"
        @cancel="handleFormCancel('simple')"
        @close="handleDialogClose('simple-form')"
      >
        <div class="form-content">
          <q-input
            v-model="simpleForm.name"
            outlined
            label="Name *"
            :error="!!simpleFormErrors.name"
            :error-message="simpleFormErrors.name"
            class="q-mb-md"
          />
          <q-input
            v-model="simpleForm.email"
            outlined
            label="Email *"
            type="email"
            :error="!!simpleFormErrors.email"
            :error-message="simpleFormErrors.email"
            class="q-mb-md"
          />
          <q-input
            v-model="simpleForm.message"
            outlined
            type="textarea"
            label="Message"
            rows="3"
            class="q-mb-md"
          />
        </div>
      </FormDialog>

      <FormDialog
        v-model="showComplexForm"
        title="Complex Form"
        subtitle="Multi-section form with advanced controls"
        icon="assignment"
        size="lg"
        :loading="complexFormLoading"
        :confirm-before-close="true"
        confirm-close-message="You have unsaved changes. Are you sure you want to close?"
        @submit="handleComplexFormSubmit"
        @cancel="handleFormCancel('complex')"
        @close="handleDialogClose('complex-form')"
      >
        <div class="complex-form">
          <div class="form-section">
            <h4 class="form-section-title">Basic Information</h4>
            <div class="form-row">
              <q-input
                v-model="complexForm.firstName"
                outlined
                label="First Name *"
                class="col-6"
              />
              <q-input
                v-model="complexForm.lastName"
                outlined
                label="Last Name *"
                class="col-6"
              />
            </div>
            <q-input
              v-model="complexForm.email"
              outlined
              label="Email Address *"
              type="email"
              class="q-mb-md"
            />
          </div>

          <div class="form-section">
            <h4 class="form-section-title">Preferences</h4>
            <q-select
              v-model="complexForm.role"
              outlined
              label="Role"
              :options="roleOptions"
              class="q-mb-md"
            />
            <q-option-group
              v-model="complexForm.notifications"
              :options="notificationOptions"
              color="primary"
              type="checkbox"
              class="q-mb-md"
            />
          </div>

          <div class="form-section">
            <h4 class="form-section-title">Additional Settings</h4>
            <q-toggle
              v-model="complexForm.newsletter"
              label="Subscribe to newsletter"
              class="q-mb-md"
            />
            <q-slider
              v-model="complexForm.experience"
              :min="1"
              :max="10"
              :step="1"
              label
              :label-value="`Experience: ${complexForm.experience}/10`"
              class="q-mb-md"
            />
          </div>
        </div>
      </FormDialog>

      <FormDialog
        v-model="showLoadingForm"
        title="Loading Form"
        subtitle="Demonstrates loading states"
        icon="hourglass_empty"
        size="md"
        :loading="loadingFormActive"
        loading-text="Processing your request..."
        @submit="handleLoadingFormSubmit"
        @cancel="handleFormCancel('loading')"
      >
        <div class="form-content">
          <q-input
            v-model="loadingForm.data"
            outlined
            label="Some Data"
            :disable="loadingFormActive"
            class="q-mb-md"
          />
          <p class="text-caption">
            Click submit to see the loading state in action.
          </p>
        </div>
      </FormDialog>

      <FormDialog
        v-model="showValidationForm"
        title="Validation Form"
        subtitle="Form with validation errors"
        icon="error"
        size="md"
        :form-errors="validationErrors"
        :can-submit="isValidationFormValid"
        @submit="handleValidationFormSubmit"
        @cancel="handleFormCancel('validation')"
      >
        <div class="form-content">
          <q-input
            v-model="validationForm.username"
            outlined
            label="Username *"
            :error="!!validationFieldErrors.username"
            :error-message="validationFieldErrors.username"
            class="q-mb-md"
            @blur="validateField('username')"
          />
          <q-input
            v-model="validationForm.password"
            outlined
            type="password"
            label="Password *"
            :error="!!validationFieldErrors.password"
            :error-message="validationFieldErrors.password"
            class="q-mb-md"
            @blur="validateField('password')"
          />
          <q-input
            v-model="validationForm.confirmPassword"
            outlined
            type="password"
            label="Confirm Password *"
            :error="!!validationFieldErrors.confirmPassword"
            :error-message="validationFieldErrors.confirmPassword"
            class="q-mb-md"
            @blur="validateField('confirmPassword')"
          />
        </div>
      </FormDialog>

      <!-- Feature Demonstration Dialogs -->
      <FormDialog
        v-model="showConfirmClose"
        title="Confirm Close Demo"
        subtitle="Try to close without saving"
        icon="warning"
        size="md"
        :confirm-before-close="hasUnsavedChanges"
        confirm-close-message="You have unsaved changes. Are you sure you want to close?"
        @submit="handleConfirmCloseSubmit"
        @cancel="handleFormCancel('confirm-close')"
      >
        <div class="form-content">
          <q-input
            v-model="confirmCloseForm.data"
            outlined
            label="Type something to enable confirm-close"
            class="q-mb-md"
            @input="hasUnsavedChanges = true"
          />
          <q-banner class="bg-info text-white">
            <template #avatar>
              <q-icon name="info" />
            </template>
            Start typing to activate the confirm-close feature. Then try to
            close the dialog.
          </q-banner>
        </div>
      </FormDialog>

      <BaseDialog
        v-model="showNested"
        title="Nested Dialog Demo"
        subtitle="Dialog that opens another dialog"
        icon="layers"
        size="md"
      >
        <div class="dialog-content">
          <p>
            This demonstrates nested dialogs with proper z-index management.
          </p>
          <q-btn
            label="Open Nested Dialog"
            color="primary"
            class="q-mt-md"
            @click="showNestedChild = true"
          />
        </div>
      </BaseDialog>

      <BaseDialog
        v-model="showNestedChild"
        title="Nested Child Dialog"
        subtitle="This dialog is nested inside another"
        icon="child_care"
        size="sm"
      >
        <div class="dialog-content">
          <p>
            This is a nested dialog. Notice how it appears above the parent
            dialog.
          </p>
          <q-banner class="bg-positive text-white">
            <template #avatar>
              <q-icon name="check_circle" />
            </template>
            Nested dialogs work perfectly with proper z-index management!
          </q-banner>
        </div>
      </BaseDialog>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useQuasar } from 'quasar';
  import BaseDialog from 'src/components/base/BaseDialog.vue';
  import FormDialog from 'src/components/base/FormDialog.vue';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';

  const $q = useQuasar();

  // BaseDialog states
  const showSmall = ref(false);
  const showMedium = ref(false);
  const showLarge = ref(false);
  const showPersistent = ref(false);
  const sampleInputValue = ref('');

  // FormDialog states
  const showSimpleForm = ref(false);
  const showComplexForm = ref(false);
  const showLoadingForm = ref(false);
  const showValidationForm = ref(false);

  // Feature demo states
  const showConfirmClose = ref(false);
  const showWizard = ref(false);
  const showNested = ref(false);
  const showNestedChild = ref(false);

  // Form data and states
  const simpleFormLoading = ref(false);
  const complexFormLoading = ref(false);
  const loadingFormActive = ref(false);
  const hasUnsavedChanges = ref(false);

  // Simple form
  const simpleForm = ref({
    name: '',
    email: '',
    message: '',
  });

  const simpleFormErrors = ref<Record<string, string>>({});

  // Complex form
  const complexForm = ref({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    notifications: [],
    newsletter: false,
    experience: 5,
  });

  // Loading form
  const loadingForm = ref({
    data: '',
  });

  // Validation form
  const validationForm = ref({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const validationFieldErrors = ref<Record<string, string>>({});

  // Confirm close form
  const confirmCloseForm = ref({
    data: '',
  });

  // Form options
  const roleOptions = ['Administrator', 'Manager', 'User', 'Guest'];

  const notificationOptions = [
    { label: 'Email notifications', value: 'email' },
    { label: 'SMS notifications', value: 'sms' },
    { label: 'Push notifications', value: 'push' },
  ];

  // Computed properties
  const validationErrors = computed(() => {
    const errors: string[] = [];
    if (validationFieldErrors.value.username)
      errors.push(validationFieldErrors.value.username);
    if (validationFieldErrors.value.password)
      errors.push(validationFieldErrors.value.password);
    if (validationFieldErrors.value.confirmPassword)
      errors.push(validationFieldErrors.value.confirmPassword);
    return errors;
  });

  const isValidationFormValid = computed(() => {
    return (
      validationForm.value.username.length >= 3 &&
      validationForm.value.password.length >= 6 &&
      validationForm.value.password === validationForm.value.confirmPassword
    );
  });

  // Methods
  const handleDialogClose = (dialogName: string) => {
    console.log(`Dialog closed: ${dialogName}`);
    $q.notify({
      message: `${dialogName} dialog closed`,
      type: 'info',
      position: 'top-right',
      timeout: 2000,
    });
  };

  const handleFormCancel = (formName: string) => {
    console.log(`Form cancelled: ${formName}`);
    $q.notify({
      message: `${formName} form cancelled`,
      type: 'warning',
      position: 'top-right',
      timeout: 2000,
    });
  };

  const handleSimpleFormSubmit = async () => {
    // Reset errors
    simpleFormErrors.value = {};

    // Validate
    if (!simpleForm.value.name.trim()) {
      simpleFormErrors.value.name = 'Name is required';
    }
    if (!simpleForm.value.email.trim()) {
      simpleFormErrors.value.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(simpleForm.value.email)) {
      simpleFormErrors.value.email = 'Email is invalid';
    }

    if (Object.keys(simpleFormErrors.value).length > 0) {
      return;
    }

    simpleFormLoading.value = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    simpleFormLoading.value = false;
    showSimpleForm.value = false;

    $q.notify({
      message: 'Simple form submitted successfully!',
      type: 'positive',
      position: 'top-right',
    });

    // Reset form
    simpleForm.value = { name: '', email: '', message: '' };
  };

  const handleComplexFormSubmit = async () => {
    complexFormLoading.value = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));

    complexFormLoading.value = false;
    showComplexForm.value = false;

    $q.notify({
      message: 'Complex form submitted successfully!',
      type: 'positive',
      position: 'top-right',
    });
  };

  const handleLoadingFormSubmit = async () => {
    loadingFormActive.value = true;

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 4000));

    loadingFormActive.value = false;
    showLoadingForm.value = false;

    $q.notify({
      message: 'Loading form processed successfully!',
      type: 'positive',
      position: 'top-right',
    });
  };

  const handleValidationFormSubmit = () => {
    if (isValidationFormValid.value) {
      showValidationForm.value = false;
      $q.notify({
        message: 'Validation form submitted successfully!',
        type: 'positive',
        position: 'top-right',
      });
    }
  };

  const handleConfirmCloseSubmit = () => {
    hasUnsavedChanges.value = false;
    showConfirmClose.value = false;
    $q.notify({
      message: 'Confirm close form saved!',
      type: 'positive',
      position: 'top-right',
    });
  };

  const validateField = (fieldName: string) => {
    validationFieldErrors.value = { ...validationFieldErrors.value };

    switch (fieldName) {
      case 'username':
        if (validationForm.value.username.length < 3) {
          validationFieldErrors.value.username =
            'Username must be at least 3 characters';
        } else {
          delete validationFieldErrors.value.username;
        }
        break;
      case 'password':
        if (validationForm.value.password.length < 6) {
          validationFieldErrors.value.password =
            'Password must be at least 6 characters';
        } else {
          delete validationFieldErrors.value.password;
        }
        break;
      case 'confirmPassword':
        if (
          validationForm.value.confirmPassword !== validationForm.value.password
        ) {
          validationFieldErrors.value.confirmPassword =
            'Passwords do not match';
        } else {
          delete validationFieldErrors.value.confirmPassword;
        }
        break;
    }
  };

  // Helper functions for demo content
  const getRandomIcon = (index: number) => {
    const icons = [
      'star',
      'favorite',
      'home',
      'work',
      'settings',
      'account_circle',
      'shopping_cart',
      'notifications',
    ];
    return icons[index % icons.length];
  };

  const getRandomColor = (index: number) => {
    const colors = [
      'primary',
      'secondary',
      'accent',
      'positive',
      'negative',
      'info',
      'warning',
    ];
    return colors[index % colors.length];
  };
</script>

<style scoped lang="scss">
  /* =================================================================== */
  /* DIALOG GALLERY - TOKENIZED STYLES */
  /* Demonstrates the design token system in action */
  /* =================================================================== */

  .dialogs-gallery {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-lg);
  }

  .gallery-section {
    margin-bottom: var(--space-2xl);
    padding: var(--space-lg);
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .section-title {
    font-size: var(--text-h3);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .section-description {
    color: var(--text-secondary);
    font-size: var(--text-body);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--space-lg);
  }

  .demo-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .demo-btn {
    min-width: 140px;
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast) var(--easing-standard);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }

  /* Dialog Content Styles */
  .dialog-content {
    padding: var(--space-md);

    p {
      color: var(--text-secondary);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--space-md);
    }

    ul {
      color: var(--text-secondary);
      padding-left: var(--space-lg);

      li {
        margin-bottom: var(--space-xs);
      }
    }

    h4 {
      color: var(--text-primary);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--space-sm);
    }
  }

  .tokenized-list {
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-primary);

    .list-header {
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-weight: var(--font-weight-semibold);
      padding: var(--space-sm) var(--space-md);
    }
  }

  .large-content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .content-section {
    h4 {
      color: var(--brand-primary);
      font-size: var(--text-h5);
      margin-bottom: var(--space-md);
    }
  }

  .token-showcase {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }

  .token-item {
    padding: var(--space-sm);
    border-radius: var(--radius-sm);
    color: white;
    font-weight: var(--font-weight-medium);
    text-align: center;
    font-size: var(--text-sm);
  }

  /* Form Styles */
  .form-content {
    padding: var(--space-md);
  }

  .complex-form {
    padding: var(--space-md);
  }

  .form-section {
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--border-secondary);

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
  }

  .form-section-title {
    color: var(--brand-primary);
    font-size: var(--text-h6);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-xs);

    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--brand-primary);
      border-radius: var(--radius-xs);
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    margin-bottom: var(--space-md);

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .dialogs-gallery {
      padding: var(--space-md);
    }

    .gallery-section {
      padding: var(--space-md);
    }

    .demo-buttons {
      justify-content: center;
    }

    .demo-btn {
      flex: 1;
      min-width: 120px;
    }
  }

  /* Dark Mode Enhancements */
  body.body--dark {
    .gallery-section {
      background: var(--bg-secondary);
      border-color: var(--border-primary);
    }

    .token-item {
      box-shadow: var(--shadow-sm);
    }
  }

  /* Focus and Accessibility */
  .demo-btn:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }

  /* Animation for demo buttons */
  .demo-btn {
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      transition: left var(--transition-standard) var(--easing-standard);
    }

    &:hover::before {
      left: 100%;
    }
  }
</style>
