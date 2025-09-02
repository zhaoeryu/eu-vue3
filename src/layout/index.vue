<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import AppContainerBody from '@/layout/components/AppContainerBody/index.vue';
import AppContainerFooter from '@/layout/components/AppContainerFooter/index.vue';
import AppContainerHeader from '@/layout/components/AppContainerHeader/index.vue';
import AppContainerTabs from '@/layout/components/AppContainerTabs/index.vue';
import HeaderNavBar from '@/layout/components/HeaderNavBar/index.vue';
import Sidebar from '@/layout/components/Sidebar/index.vue';
import ThemeConfig from '@/layout/components/ThemeConfig/index.vue';
import { useSettingsStore, useRouteStore } from '@/store';
import type { RouteNode } from '@/types/route';
import { DeviceTypeEnums } from '@/utils/enums';

const route = useRoute();
const settingsStore = useSettingsStore();
const routeStore = useRouteStore();

const isSecondNavHidden = computed(() => {
  const activeFirstMenu = route.matched[0];
  const activeFirstMenuPath = activeFirstMenu?.path === '' ? '/' : activeFirstMenu?.path;
  const secondNavList = (routeStore.routes.find((item) => item.path === activeFirstMenuPath)?.children ?? ([] as RouteNode[])).filter((item) => !item.hidden);
  const isNotMultiChildren = secondNavList.length < 2;
  const isAlwaysShow = activeFirstMenu?.meta?.alwaysShow;
  return isNotMultiChildren && !isAlwaysShow;
});
const curRouteMeta = computed(() => route.meta || {});

const { width } = useWindowSize();
const COLLAPSE_WIDTH = 1180;
const MOBILE_WIDTH = 992;

watchEffect(() => {
  const isMobile = width.value - 1 < MOBILE_WIDTH;
  const isCollapse = width.value - 1 < COLLAPSE_WIDTH;

  settingsStore.toggleDevice(isMobile ? DeviceTypeEnums.MOBILE : DeviceTypeEnums.DESKTOP);
  settingsStore.toggleCollapsed(isCollapse);
});
</script>

<script lang="ts">
export default {
  name: 'Layout',
};
</script>

<template>
  <div
    id="eu-layout"
    :class="{
      mobile: settingsStore.isMobileDevice,
      'sidebar-collapsed': settingsStore.sidebarCollapsed,
      'eu-nav-second-sidebar-hidden': isSecondNavHidden,
      'eu-tabs-fixed': settingsStore.theme.showTabsBar && settingsStore.theme.fixedTabsBar,
      ['eu-layout_' + settingsStore.theme.layout]: true,
    }"
  >
    <!-- Header Nav -->
    <header-nav-bar />
    <!-- container -->
    <div id="app-container">
      <!-- aside -->
      <sidebar />
      <!-- main -->
      <main id="app-container__main">
        <app-container-tabs v-if="settingsStore.theme.showTabsBar" />
        <!-- 头部 -->
        <app-container-header v-if="curRouteMeta.showHeader" />
        <!-- 内容区域 -->
        <app-container-body />
        <!-- 底部 -->
        <app-container-footer v-if="curRouteMeta.showFooter" />
      </main>
    </div>

    <!-- 主题配置 -->
    <theme-config />
    <!-- 回到顶部 -->
    <el-backtop
      ref="elBackTop"
      target="#app-container__main"
    ></el-backtop>
  </div>
</template>

<style scoped lang="scss">
#eu-layout {
  position: relative;
}

#app-container {
  box-sizing: border-box;
  padding-top: var(--eu-layout-navbar-height);
}

#app-container__main {
  margin-left: var(--eu-layout-sidebar-column-width);
  box-sizing: border-box;
  height: calc(100vh - var(--eu-layout-navbar-height));
  width: calc(100vw - var(--eu-layout-sidebar-column-width));
  overflow: auto;

  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  // 折叠情况下菜单栏的宽度
  --eu-layout-sidebar-column-width: var(--eu-layout-sidebar-collapse-width) !important;
}

#eu-layout {

  // 分栏布局
  &.eu-layout_column {

    // 不折叠并且二级菜单隐藏情况下的菜单栏宽度
    &:not(.sidebar-collapsed).eu-nav-second-sidebar-hidden {
      --eu-layout-sidebar-column-width: var(--eu-layout-sidebar-column-first-width);
    }
  }

  // 侧边布局
  &.eu-layout_vertical {
    --eu-layout-sidebar-column-width: var(--eu-layout-sidebar-vertical-width);
  }
}

// 固定TabsBar
.eu-tabs-fixed {
  #app-container__tabs {
    width: calc(100vw - var(--eu-layout-sidebar-column-width));
    position: fixed;
    top: var(--eu-layout-navbar-height);
    z-index: 10;
  }

  #app-container__main {
    height: calc(100vh - var(--eu-layout-navbar-height));
    padding-top: 38px;
  }
}
</style>
