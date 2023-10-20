<script setup lang="ts">
import {useSettingsStore} from "@/store";
import {watchEffect} from "vue";
import {darkMode} from "@/utils/darkMode";

const settingsStore = useSettingsStore()

watchEffect(() => {
  darkMode(settingsStore.theme.darkMode)
})

</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>
