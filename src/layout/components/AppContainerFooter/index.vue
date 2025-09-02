<script setup lang="ts">
import { defaultSetting } from '@/settings';

defineOptions({
  name: 'AppContainerFooter',
});
</script>

<template>
  <footer id="app-container__footer">
    <!-- eslint-disable vue/no-v-html -->
    <span v-html="defaultSetting.copyright" />
  </footer>
</template>

<style scoped lang="scss">
#app-container__footer {
  text-align: center;
  color: var(--eu-color-text-tertiary);
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}
</style>
