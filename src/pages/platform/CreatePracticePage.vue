<template>
  <PageLayout>
    <PageTitle
      title="Create New Practice"
      :breadcrumbs="[
        { label: 'Platform', to: '/platform' },
        { label: 'Practices', to: '/platform/practices' },
        { label: 'Create', to: '/platform/practices/create' },
      ]"
    >
      <template #actions>
        <q-btn
          class="app-btn-secondary"
          icon="arrow_back"
          label="Back to Practices"
          @click="$router.push('/platform/practices')"
        />
      </template>
    </PageTitle>

    <div class="row q-gutter-lg">
      <div class="col-12">
        <BaseCard>
          <template #header>
            <div class="text-h6">Practice Information</div>
          </template>

          <div class="q-pa-md">
            <q-form @submit="createPractice" class="q-gutter-md">
              <div class="row q-gutter-md">
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="form.name"
                    label="Practice Name"
                    required
                    outlined
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="form.email"
                    label="Contact Email"
                    type="email"
                    required
                    outlined
                  />
                </div>
              </div>

              <div class="row q-gutter-md">
                <div class="col-md-6 col-12">
                  <q-input v-model="form.phone" label="Phone Number" outlined />
                </div>
                <div class="col-md-6 col-12">
                  <q-input v-model="form.address" label="Address" outlined />
                </div>
              </div>

              <div class="row q-pt-md">
                <div class="col-12">
                  <q-btn
                    type="submit"
                    class="app-btn-primary"
                    icon="add"
                    label="Create Practice"
                    :loading="creating"
                  />
                  <q-btn
                    class="app-btn-secondary q-ml-sm"
                    label="Cancel"
                    @click="$router.push('/platform/practices')"
                  />
                </div>
              </div>
            </q-form>
          </div>
        </BaseCard>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import PageLayout from '@/components/PageLayout.vue';
  import PageTitle from '@/components/PageTitle.vue';
  import BaseCard from '@/components/cards/BaseCard.vue';

  const router = useRouter();
  const creating = ref(false);

  const form = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const createPractice = async () => {
    creating.value = true;
    try {
      // TODO: Implement practice creation
      console.log('Creating practice:', form.value);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push('/platform/practices');
    } finally {
      creating.value = false;
    }
  };
</script>
