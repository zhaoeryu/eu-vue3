<script setup lang="ts">
import {useSettingsStore} from "@/store";

const settingsStore = useSettingsStore()

function onNavFold() {
  settingsStore.toggleCollapsed(!settingsStore.sidebarCollapsed)
}
</script>

<template>
  <div class="eu-nav-switch-trigger" @click="onNavFold">
    <svg-icon icon-class="arrow-right2" />
  </div>
</template>

<style scoped lang="scss">
.eu-nav-switch-trigger {
  width: 15px;
  height: 50px;
  position: absolute;
  right: -15px;
  top: 40px;
  transform: translateY(-50%);
  background-color: var(--color-fill-3);
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all .15s ease;
  box-sizing: content-box;
  >.svg-icon {
    color: var(--color-text-3);
    font-size: 16px;
    transform: rotate(180deg);
  }
  &:hover {
    right: -23px;
    padding-left: 8px;
  }
}
// 折叠菜单
.sidebar-collapsed {
  .eu-nav-switch-trigger {
    >.svg-icon {
      transform: rotate(0deg);
    }
  }
}
</style>
