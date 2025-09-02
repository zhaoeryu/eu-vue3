<script setup lang="ts">
import { watchEffect } from 'vue';

import { useSameIndex } from '@/hooks/sameIndex';
import { useSettingsStore } from '@/store';
import { darkMode } from '@/utils/darkMode';

watchEffect(() => {
  darkMode(useSettingsStore().theme.darkMode);
});

useSameIndex();
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>
