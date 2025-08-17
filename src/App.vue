<script setup lang="ts">
import { watchEffect } from 'vue';

import { useSettingsStore } from '@/store';
import { darkMode } from '@/utils/darkMode';

watchEffect(() => {
  darkMode(useSettingsStore().theme.darkMode);
});
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>
