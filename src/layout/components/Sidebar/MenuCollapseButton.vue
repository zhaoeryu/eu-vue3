<script setup lang="ts">
import { useSettingsStore } from '@/store';

const settingsStore = useSettingsStore();

function onNavFold() {
  settingsStore.toggleCollapsed(!settingsStore.sidebarCollapsed);
}
</script>

<template>
  <div
    class="eu-nav-switch-trigger"
    @click="onNavFold"
  >
    <svg-icon icon-class="arrow-right2" />
  </div>
</template>

<style scoped lang="scss">
.eu-nav-switch-trigger {
  width: 15px;
  height: 50px;
  position: absolute;
  right: -15px;
  top: calc(var(--eu-layout-navbar-height) + 54px);
  transform: translateY(-50%);
  background-color: var(--eu-color-border-primary);
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.15s ease;
  box-sizing: content-box;

  >.svg-icon {
    color: var(--eu-color-text-tertiary);
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
