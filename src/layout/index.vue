<script setup lang="ts">
import Sidebar from '@/layout/components/Sidebar/index.vue'
import ThemeConfig from '@/layout/components/ThemeConfig/index.vue'
import AppContainerBody from '@/layout/components/AppContainerBody/index.vue'
import AppContainerFooter from '@/layout/components/AppContainerFooter/index.vue'
import HeaderNavBar from '@/layout/components/HeaderNavBar/index.vue'
import AppContainerHeader from '@/layout/components/AppContainerHeader/index.vue'
import AppContainerTabs from '@/layout/components/AppContainerTabs/index.vue'
import {useSettingsStore} from "@/store";
import {computed, defineOptions, ref, watchEffect} from "vue";
import { useWindowSize } from '@vueuse/core'
import {useRoute} from "vue-router";
import {DeviceTypeEnums} from "@/utils/enums";

defineOptions({
  name: 'Layout'
})

const route = useRoute()
const settingsStore = useSettingsStore()

const backTopSelector = '#app-container__main'
const sidebarCollapsed = computed(() => settingsStore.sidebarCollapsed)
const isMobileDevice = computed(() => settingsStore.isMobileDevice)
const isSecondNavHidden = ref(false)
const themeConfigShow = ref(false)
const theme = computed(() => settingsStore.theme)
const curRouteMeta = computed(() => route.meta || {})

const { width } = useWindowSize();
const COLLAPSE_WIDTH = 1180
const MOBILE_WIDTH = 992

watchEffect(() => {
  const isMobile = width.value - 1 < MOBILE_WIDTH
  const isCollapse = width.value - 1 < COLLAPSE_WIDTH

  settingsStore.toggleDevice(isMobile ? DeviceTypeEnums.MOBILE : DeviceTypeEnums.DESKTOP)
  settingsStore.toggleCollapsed(isCollapse)
})
</script>

<template>
  <div id="eu-layout" :class="{
    mobile: isMobileDevice,
    'sidebar-collapsed': sidebarCollapsed,
    'eu-nav-second-sidebar-hidden': isSecondNavHidden,
    'eu-tabs-fixed': theme.showTabsBar && theme.fixedTabsBar
  }">
    <!-- Header Nav -->
    <header-nav-bar
      v-model:theme-config-show="themeConfigShow"
    />
    <!-- container -->
    <div id="app-container">
      <!-- aside -->
      <sidebar v-model:second-nav-hidden="isSecondNavHidden" />
      <!-- main -->
      <main id="app-container__main">
        <app-container-tabs v-if="theme.showTabsBar" />
        <!-- 头部 -->
        <app-container-header v-if="curRouteMeta.showHeader" />
        <!-- 内容区域 -->
        <app-container-body />
        <!-- 底部 -->
        <app-container-footer v-if="curRouteMeta.showFooter" />
      </main>
    </div>

    <!-- 主题配置 -->
    <theme-config v-model:show="themeConfigShow" />
    <!-- 回到顶部 -->
    <el-backtop ref="elBackTop" :target="backTopSelector"></el-backtop>
  </div>
</template>

<style scoped lang="scss">
#eu-layout {
  position: relative;
}
#app-container {
  box-sizing: border-box;
  padding-top: 50px;
}
#app-container__main {
  margin-left: var(--sidebar-width);
  box-sizing: border-box;
  height: calc(100vh - 50px);
  width: calc(100vw - var(--sidebar-width));
  overflow: auto;

  display: flex;
  flex-direction: column;
}
.sidebar-collapsed {
  // 折叠情况下菜单栏的宽度
  --sidebar-width: var(--sidebar-collapse-width);
}
// 不折叠并且二级菜单隐藏情况下的菜单栏宽度
:not(.sidebar-collapsed).eu-nav-second-sidebar-hidden {
  --sidebar-width: var(--sidebar-first-width);
}

// 固定TabsBar
.eu-tabs-fixed {
  #app-container__tabs {
    width: calc(100vw - var(--sidebar-width));
    position: fixed;
    top: 50px;
    z-index: 10;
  }
  #app-container__main {
    height: calc(100vh - 50px - 38px);
    margin-top: 38px;
  }
}
</style>
