<template>
  <div class="q-pa-lg">
    <h2 class="q-mb-md">Style Sandbox – Form Controls</h2>

    <div class="q-gutter-lg">
      <section>
        <h3>Native controls</h3>
        <div class="q-gutter-md" style="max-width: 480px">
          <input
            class="form-control control-sm"
            placeholder="input .control-sm"
          />
          <input
            class="form-control control-md"
            placeholder="input .control-md"
          />
          <input
            class="form-control control-lg"
            placeholder="input .control-lg"
          />

          <select class="form-control control-md">
            <option>Option A</option>
            <option>Option B</option>
          </select>

          <textarea
            class="form-control control-md"
            rows="3"
            placeholder="textarea .control-md"
          ></textarea>
        </div>
      </section>

      <section>
        <h3>Quasar fields</h3>
        <div class="q-gutter-md" style="max-width: 480px">
          <q-input filled label="QInput md" class="control-md" />
          <q-input filled label="QInput sm" class="control-sm" />
          <q-input filled label="QInput lg" class="control-lg" disable />
          <q-select
            filled
            label="QSelect md"
            class="control-md"
            :options="['One', 'Two']"
          />
          <q-select
            filled
            label="QSelect sm"
            class="control-sm"
            :options="['Small']"
          />
          <q-select
            filled
            label="QSelect lg"
            class="control-lg"
            :options="['Large']"
          />
        </div>
      </section>

      <section>
        <h3>Dropdown (menu)</h3>
        <q-btn label="Open menu" color="primary" @click="menu = true" />
        <q-menu v-model="menu">
          <q-list style="min-width: 200px">
            <q-item clickable v-close-popup
              ><q-item-section>Item 1</q-item-section></q-item
            >
            <q-item clickable v-close-popup
              ><q-item-section>Item 2</q-item-section></q-item
            >
          </q-list>
        </q-menu>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const menu = ref(false);
</script>

<style scoped>
  h3 {
    margin: 12px 0;
  }
</style>
