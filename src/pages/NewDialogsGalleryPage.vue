<template>
  <div class="q-pa-lg">
    <h2 class="q-mb-md">Dialogs Gallery</h2>

    <div class="q-gutter-lg">
      <q-btn label="Open Small" @click="showSm = true" />
      <q-btn label="Open Medium" color="primary" @click="showMd = true" />
      <q-btn label="Open Large Form" color="secondary" @click="showLg = true" />
      <q-btn label="Open Confirm" color="negative" @click="showConfirm = true" />
    </div>

    <BaseDialog
      v-model="showSm"
      title="Small Dialog"
      subtitle="Compact header with subtitle"
      icon="info"
      size="sm"
    >
      <div class="q-gutter-md">
        <p>Body content with standardized padding.</p>
        <q-input outlined label="Sample input" />
      </div>
    </BaseDialog>

    <BaseDialog
      v-model="showMd"
      title="Medium Dialog"
      icon="list"
      size="md"
    >
      <q-list bordered separator>
        <q-item v-for="n in 12" :key="n"><q-item-section>Item {{ n }}</q-item-section></q-item>
      </q-list>
    </BaseDialog>

    <FormDialog
      v-model="showLg"
      title="Create Product"
      icon="add_box"
      size="lg"
      submit-button-text="Save"
      cancel-button-text="Cancel"
    >
      <div class="form-grid">
        <q-input class="col-6" outlined label="Name" />
        <q-input class="col-6" outlined label="SKU" />
        <q-input class="col-4" outlined label="Price" type="number" />
        <q-input class="col-12" outlined type="textarea" label="Description" />
      </div>
    </FormDialog>

    <ConfirmDialog
      v-model="showConfirm"
      title="Delete item?"
      message="This action cannot be undone."
      type="danger"
      size="sm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import BaseDialog from 'src/components/base/BaseDialog.vue';
  import FormDialog from 'src/components/base/FormDialog.vue';
  import ConfirmDialog from 'src/components/base/ConfirmDialog.vue';

  const showSm = ref(false);
  const showMd = ref(false);
  const showLg = ref(false);
  const showConfirm = ref(false);
</script>

<style scoped>
  h2 {
    font-weight: 600;
  }
</style>

