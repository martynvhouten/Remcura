<template>
  <div class="dialog-examples">
    <h1>BaseDialog Examples</h1>

    <div class="examples-grid">
      <!-- Form Dialog Example -->
      <div class="example-card">
        <h2>Form Dialog</h2>
        <p>Complete form with validation, loading states, and dirty checking</p>
        <q-btn @click="showFormDialog = true" class="app-btn-primary">
          Open Form Dialog
        </q-btn>
      </div>

      <!-- Confirmation Dialog Example -->
      <div class="example-card">
        <h2>Confirmation Dialog</h2>
        <p>Simple confirmation with primary/secondary actions</p>
        <q-btn @click="showConfirmDialog = true" class="app-btn-danger">
          Open Confirm Dialog
        </q-btn>
      </div>

      <!-- Wizard Dialog Example -->
      <div class="example-card">
        <h2>Wizard Dialog</h2>
        <p>Multi-step process with step indicator</p>
        <q-btn @click="showWizardDialog = true" class="app-btn-secondary">
          Open Wizard Dialog
        </q-btn>
      </div>
    </div>

    <!-- Form Dialog -->
    <BaseDialog
      v-model="showFormDialog"
      title="Create New Product"
      subtitle="Fill in the product details below"
      icon="add_box"
      size="lg"
      variant="elegant"
      header-variant="solid"
      status-color="primary"
      :loading="formLoading"
      loading-text="Saving product..."
      :primary-action="formPrimaryAction"
      :secondary-action="formSecondaryAction"
      :primary-action-loading="formSubmitting"
      :is-dirty="formIsDirty"
      confirm-close-message="You have unsaved changes. Are you sure you want to close?"
      @primary-action="submitForm"
      @secondary-action="cancelForm"
    >
      <q-form @submit.prevent="submitForm" class="form-content">
        <div class="form-row">
          <q-input
            v-model="formData.name"
            label="Product Name *"
            outlined
            :rules="[val => !!val || 'Name is required']"
            @input="formIsDirty = true"
          />
        </div>

        <div class="form-row">
          <q-input
            v-model="formData.sku"
            label="SKU"
            outlined
            @input="formIsDirty = true"
          />
          <q-input
            v-model.number="formData.price"
            label="Price"
            type="number"
            outlined
            prefix="€"
            @input="formIsDirty = true"
          />
        </div>

        <div class="form-row">
          <q-select
            v-model="formData.category"
            :options="categoryOptions"
            label="Category"
            outlined
            @input="formIsDirty = true"
          />
        </div>

        <div class="form-row">
          <q-input
            v-model="formData.description"
            label="Description"
            type="textarea"
            outlined
            rows="3"
            @input="formIsDirty = true"
          />
        </div>

        <div class="form-row">
          <q-checkbox
            v-model="formData.active"
            label="Active product"
            @input="formIsDirty = true"
          />
        </div>
      </q-form>
    </BaseDialog>

    <!-- Confirmation Dialog -->
    <BaseDialog
      v-model="showConfirmDialog"
      title="Delete Product"
      subtitle="This action cannot be undone"
      icon="warning"
      size="sm"
      variant="modern"
      header-variant="solid"
      status-color="danger"
      :primary-action="confirmPrimaryAction"
      :secondary-action="confirmSecondaryAction"
      :primary-action-loading="confirmLoading"
      @primary-action="confirmDelete"
      @secondary-action="cancelDelete"
    >
      <div class="confirm-content">
        <p>
          Are you sure you want to delete <strong>{{ productToDelete }}</strong
          >?
        </p>
        <p class="text-danger">
          This will permanently remove the product and all associated data.
        </p>
      </div>
    </BaseDialog>

    <!-- Wizard Dialog -->
    <BaseDialog
      v-model="showWizardDialog"
      title="Product Import Wizard"
      subtitle="Import products from CSV file"
      icon="upload_file"
      size="xl"
      variant="glass"
      header-variant="gradient"
      status-color="info"
      :steps="wizardSteps"
      :current-step="currentWizardStep"
      show-steps
      :primary-action="wizardPrimaryAction"
      :secondary-action="wizardSecondaryAction"
      @primary-action="nextWizardStep"
      @secondary-action="previousWizardStep"
    >
      <!-- Step 1: File Upload -->
      <div v-if="currentWizardStep === 0" class="wizard-step">
        <h3>Upload CSV File</h3>
        <p>Select a CSV file containing your product data.</p>

        <div class="upload-area">
          <q-icon name="cloud_upload" class="icon-size-2xl" color="primary" />
          <p>Drag and drop your CSV file here, or click to browse</p>
          <q-btn outline color="primary">Choose File</q-btn>
        </div>
      </div>

      <!-- Step 2: Column Mapping -->
      <div v-if="currentWizardStep === 1" class="wizard-step">
        <h3>Map Columns</h3>
        <p>Map your CSV columns to product fields.</p>

        <div class="mapping-grid">
          <div class="mapping-item">
            <label>Product Name</label>
            <q-select outlined :options="csvColumns" />
          </div>
          <div class="mapping-item">
            <label>SKU</label>
            <q-select outlined :options="csvColumns" />
          </div>
          <div class="mapping-item">
            <label>Price</label>
            <q-select outlined :options="csvColumns" />
          </div>
        </div>
      </div>

      <!-- Step 3: Preview & Import -->
      <div v-if="currentWizardStep === 2" class="wizard-step">
        <h3>Preview & Import</h3>
        <p>Review the imported data before finalizing.</p>

        <div class="preview-table">
          <q-table
            :rows="previewData"
            :columns="previewColumns"
            row-key="id"
            flat
            bordered
          />
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import BaseDialog from '../components/base/BaseDialog.vue';

  // Form Dialog State
  const showFormDialog = ref(false);
  const formLoading = ref(false);
  const formSubmitting = ref(false);
  const formIsDirty = ref(false);

  const formData = ref({
    name: '',
    sku: '',
    price: null,
    category: null,
    description: '',
    active: true,
  });

  const categoryOptions = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];

  const formPrimaryAction = computed(() => ({
    label: 'Save Product',
    icon: 'save',
    class: 'app-btn-primary',
    disabled: !formData.value.name,
  }));

  const formSecondaryAction = computed(() => ({
    label: 'Cancel',
    class: 'app-btn-secondary',
  }));

  // Confirmation Dialog State
  const showConfirmDialog = ref(false);
  const confirmLoading = ref(false);
  const productToDelete = ref('Sample Product');

  const confirmPrimaryAction = computed(() => ({
    label: 'Delete',
    icon: 'delete',
    class: 'app-btn-danger',
  }));

  const confirmSecondaryAction = computed(() => ({
    label: 'Cancel',
    class: 'app-btn-secondary',
  }));

  // Wizard Dialog State
  const showWizardDialog = ref(false);
  const currentWizardStep = ref(0);

  const wizardSteps = [
    { label: 'Upload File' },
    { label: 'Map Columns' },
    { label: 'Preview & Import' },
  ];

  const csvColumns = ['Column A', 'Column B', 'Column C'];
  const previewData = [
    { id: 1, name: 'Product 1', sku: 'SKU001', price: 19.99 },
    { id: 2, name: 'Product 2', sku: 'SKU002', price: 29.99 },
  ];

  const previewColumns = [
    { name: 'name', label: 'Name', field: 'name', align: 'left' },
    { name: 'sku', label: 'SKU', field: 'sku', align: 'left' },
    { name: 'price', label: 'Price', field: 'price', align: 'right' },
  ];

  const wizardPrimaryAction = computed(() => {
    if (currentWizardStep.value === wizardSteps.length - 1) {
      return {
        label: 'Import Products',
        icon: 'upload',
        class: 'app-btn-success',
      };
    }
    return {
      label: 'Next',
      icon: 'arrow_forward',
      class: 'app-btn-primary',
    };
  });

  const wizardSecondaryAction = computed(() => {
    if (currentWizardStep.value === 0) {
      return {
        label: 'Cancel',
        class: 'app-btn-secondary',
      };
    }
    return {
      label: 'Previous',
      icon: 'arrow_back',
      class: 'app-btn-secondary',
    };
  });

  // Methods
  const submitForm = async () => {
    formSubmitting.value = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    formSubmitting.value = false;
    formIsDirty.value = false;
    showFormDialog.value = false;

    // Reset form
    formData.value = {
      name: '',
      sku: '',
      price: null,
      category: null,
      description: '',
      active: true,
    };
  };

  const cancelForm = () => {
    showFormDialog.value = false;
    formIsDirty.value = false;
  };

  const confirmDelete = async () => {
    confirmLoading.value = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    confirmLoading.value = false;
    showConfirmDialog.value = false;
  };

  const cancelDelete = () => {
    showConfirmDialog.value = false;
  };

  const nextWizardStep = () => {
    if (currentWizardStep.value < wizardSteps.length - 1) {
      currentWizardStep.value++;
    } else {
      // Final step - import
      showWizardDialog.value = false;
      currentWizardStep.value = 0;
    }
  };

  const previousWizardStep = () => {
    if (currentWizardStep.value > 0) {
      currentWizardStep.value--;
    } else {
      showWizardDialog.value = false;
    }
  };
</script>

<style lang="scss" scoped>
  .dialog-examples {
    padding: var(--space-8);
    max-width: 1200px;
    margin: 0 auto;

    h1 {
      font-size: var(--text-4xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      margin-bottom: var(--space-8);
      text-align: center;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-6);
      margin-bottom: var(--space-12);

      .example-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        text-align: center;

        h2 {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-3);
        }

        p {
          color: var(--text-secondary);
          margin-bottom: var(--space-6);
          line-height: var(--leading-relaxed);
        }
      }
    }

    .form-content {
      .form-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-4);
        margin-bottom: var(--space-6);

        &:has(> :nth-child(2)) {
          grid-template-columns: 1fr 1fr;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .confirm-content {
      text-align: center;

      p {
        margin-bottom: var(--space-4);
        line-height: var(--leading-relaxed);

        &:last-child {
          margin-bottom: 0;
        }

        &.text-danger {
          color: var(--brand-danger);
          font-weight: var(--font-weight-medium);
        }
      }

      strong {
        color: var(--text-primary);
        font-weight: var(--font-weight-semibold);
      }
    }

    .wizard-step {
      h3 {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        margin-bottom: var(--space-3);
      }

      p {
        color: var(--text-secondary);
        margin-bottom: var(--space-6);
        line-height: var(--leading-relaxed);
      }

      .upload-area {
        border: 2px dashed var(--border-primary);
        border-radius: var(--radius-xl);
        padding: var(--space-12);
        text-align: center;
        background: var(--bg-secondary);
        transition: var(--transition-base);

        &:hover {
          border-color: var(--brand-primary);
          background: var(--bg-tertiary);
        }

        p {
          margin: var(--space-4) 0 var(--space-6) 0;
          color: var(--text-secondary);
        }
      }

      .mapping-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-4);

        .mapping-item {
          label {
            display: block;
            font-weight: var(--font-weight-medium);
            color: var(--text-primary);
            margin-bottom: var(--space-2);
          }
        }
      }

      .preview-table {
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }
    }
  }

  @media (max-width: 640px) {
    .dialog-examples {
      padding: var(--space-4);

      .examples-grid {
        grid-template-columns: 1fr;
      }

      .form-content .form-row {
        grid-template-columns: 1fr;
      }

      .wizard-step .mapping-grid {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
