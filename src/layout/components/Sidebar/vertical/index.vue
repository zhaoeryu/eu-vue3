<script lang="ts" setup>
import type { MenuInstance } from 'element-plus';
import { computed, nextTick, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';

import SidebarItem from '@/layout/components/Sidebar/vertical/SidebarItem.vue';
import { useRouteStore, useSettingsStore } from '@/store';
import { getMaxMatchedMenu } from '@/utils/route-helpers';

const routeStore = useRouteStore();
const route = useRoute();
const settingsStore = useSettingsStore();
const refMenu = useTemplateRef<MenuInstance>('refMenu');

const menuList = computed(() => {
  return routeStore.routes.filter((item) => !item.hidden);
});

watch(
  () => route.path,
  () => {
    tryHighlightMenu();
  },
  { immediate: true },
);

async function tryHighlightMenu() {
  await nextTick();
  // 这里应该获取当前菜单是否激活，但是没有找到合适的方法，每次都执行一下吧
  const isNotActive = true;
  if (isNotActive) {
    // 首页特殊处理
    const foundHomeMenu = menuList.value.find((item) => item.path === '/' && item.redirect === route.path);
    if (foundHomeMenu) {
      refMenu.value?.updateActiveIndex('/');
      return;
    }
    if (route.meta.hidden === true) {
      // 支持模糊匹配
      const matched = getMaxMatchedMenu(route.path, menuList.value);
      if (matched) {
        refMenu.value?.updateActiveIndex(matched);
        return;
      }
    }
  }
}
</script>

<template>
  <el-scrollbar wrap-class="eu-scrollbar-wrapper">
    <el-menu
      ref="refMenu"
      :default-active="route.path"
      :collapse="settingsStore.sidebarCollapsed"
      :unique-opened="true"
      :collapse-transition="false"
      mode="vertical"
      class="eu-menu"
    >
      <sidebar-item
        v-for="item in menuList"
        :key="item.path"
        :item="item"
        :level="0"
      />
    </el-menu>
  </el-scrollbar>
</template>

<style scoped lang="scss">
.el-scrollbar {
  flex: 1;
  background-color: var(--eu-layout-sidebar-bg);
  color: var(--eu-layout-sidebar-text-color);
  width: 100%;
  height: calc(100vh - var(--eu-layout-navbar-height));
  --eu-menu-level: 0;
  --eu-menu-base-level-padding: calc(1.3em + 8px);
}

:deep(.el-menu) {
  background-color: var(--eu-layout-sidebar-bg);
  border-right: unset !important;
}

:deep(.eu-menu) {
  height: 100%;
  padding: 12px 0;
  border-right-color: var(--color-border);
  user-select: none;

  // 折叠状态下
  &.el-menu--collapse {

    .el-sub-menu__title,
    .el-menu-item {
      > :not(.svg-icon) {
        display: none;
      }

      .svg-icon {
        margin-right: unset;
      }
    }

    .el-sub-menu__title,
    .el-menu-item>.el-menu-tooltip__trigger {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .el-sub-menu {
      &.is-active>.el-sub-menu__title {
        background-color: var(--eu-layout-sidebar-active-bg);
        color: var(--eu-layout-sidebar-active-text-color);
      }
    }
  }

  // 菜单项
  .el-sub-menu .el-sub-menu__title,
  .el-menu-item {
    margin: 0 8px 4px;
    border-radius: 6px;
    height: 40px;
    line-height: 40px;
    padding: 0 8px !important;
    display: flex;
    align-items: center;
    transition: unset;
    color: var(--eu-layout-sidebar-text-color);
    //&:not(.is-active):hover {
    //  background-color: var(--eu-layout-sidebar-active-bg);
    //  color: var(--eu-layout-sidebar-active-text-color);
    //}
  }

  .el-menu-item:focus,
  .el-menu-item:hover,
  .el-submenu__title:hover {
    background-color: var(--eu-layout-sidebar-hover-bg);
    color: var(--eu-layout-sidebar-hover-text-color);
  }

  .el-sub-menu__icon-arrow {
    font-size: 14px;
    color: inherit;
    right: 8px;
  }

  // 有子菜单
  .el-sub-menu {
    &.is-active>.el-sub-menu__title {
      color: var(--eu-layout-sidebar-active-text-color);
      font-weight: 500;
    }

    .el-menu-item,
    .el-sub-menu .el-sub-menu__title {
      min-width: unset;
      padding-left: calc(8px + var(--eu-menu-base-level-padding) * var(--eu-menu-level)) !important;
    }
  }

  // 无子菜单的选中
  .el-menu-item.is-active {
    background-color: var(--eu-layout-sidebar-active-bg);
    color: var(--eu-layout-sidebar-active-text-color);
    font-weight: 500;
  }
}

:deep(.eu-scrollbar-wrapper) {
  margin-right: unset !important;
  overflow-x: hidden !important;

  &::-webkit-scrollbar {
    width: 0;
  }
}
</style>
