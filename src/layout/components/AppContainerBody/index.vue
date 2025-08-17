<script setup lang="ts">
import { computed, defineOptions } from 'vue';

import { defaultSetting } from '@/settings';
import { useTabsStore } from '@/store';
import { type Tab } from '@/types/store/tabs';

defineOptions({
  name: 'AppContainerBody',
});

const cachedRoutes = computed(() => {
  return (
    useTabsStore()
      .tabs.filter((item: Tab) => item.title && item.keepAlive)
      .map((item: Tab) => item.title) || []
  );
});
</script>

<template>
  <section id="app-container__body">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedRoutes" :max="defaultSetting.keepAliveMaxNum">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<style scoped lang="scss">
#app-container__body {
  width: 100%;
  box-sizing: border-box;
  flex-grow: 1;
  position: relative;
}
.eu-layout-horizontal {
  #app-container__body {
    margin-left: 10%;
    margin-right: 10%;
  }
}

/* fade-transform */
.fade-transform--move-from,
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
