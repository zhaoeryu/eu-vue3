<script lang="ts" setup>
import { ref } from 'vue';

import ExamplePulldown from '@/components/ExamplePulldown.vue';

const value = ref('1');
const label = ref(null);
</script>

<template>
  <div class="page-container">
    <div style="width: 300px;">
      <example-pulldown
        ref="pulldown"
        v-model="value"
        v-model:label="label"
        placeholder="请选择XXXX"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
