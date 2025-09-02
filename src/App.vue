<script setup lang="ts">
import { watchEffect } from 'vue';

import { useCheckVersion } from '@/hooks/checkVersion';
import { useSameIndex } from '@/hooks/sameIndex';
import { useSettingsStore } from '@/store';
import { darkMode } from '@/utils/darkMode';

watchEffect(() => {
  darkMode(useSettingsStore().theme.darkMode);
});

useSameIndex();
useCheckVersion();
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>
