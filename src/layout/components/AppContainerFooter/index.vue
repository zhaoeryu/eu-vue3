<script setup lang="ts">
import {defaultSetting} from "@/settings";
import {defineOptions} from "vue";

defineOptions({
  name: 'AppContainerFooter'
})
</script>

<template>
  <footer id="app-container__footer">
    <span v-html="defaultSetting.copyright"></span>
  </footer>
</template>

<style scoped lang="scss">
#app-container__footer {
  text-align: center;
  color: var(--color-text-3);
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}
</style>
