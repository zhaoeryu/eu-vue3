<script setup>
import SidebarItem from '@/layout/components/Sidebar/vertical/SidebarItem.vue'
import { getMaxMatchedMenu } from '@/utils/route-helpers'
import { useRouteStore, useSettingsStore } from '@/store'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const routeStore = useRouteStore()
const route = useRoute()

const activeMenu = ref('')
const refMenu = ref(null)

const sidebarCollapsed = computed(() => {
  return useSettingsStore().sidebarCollapsed
})

const menuList = computed(() => {
  return routeStore.routes.filter(route => !route.hidden)
})

const menuUniqueOpened = computed(() => {
  return true
})

onMounted(async () => {
  activeMenu.value = route.path
  await tryHighlightMenu()
})

async function tryHighlightMenu() {
  await nextTick()
  const isNotActive = refMenu.value.activeIndex === null
  if (isNotActive) {
    // 首页特殊处理
    const foundHomeMenu = menuList.value.find(item => item.path === '/' && item.redirect === route.path)
    if (foundHomeMenu) {
      activeMenu.value = foundHomeMenu.path
      return
    }

    if (route.meta.hidden === true) {
      // 支持模糊匹配
      const matched = getMaxMatchedMenu(activeMenu.value, menuList)
      if (matched) {
        activeMenu.value = matched
      }
    }
  }
}

watch(route, (newRoute, oldRoute) => {
  activeMenu.value = newRoute.path
  tryHighlightMenu()
}, {
  immediate: true
})
</script>

<template>
  <el-scrollbar wrap-class="eu-scrollbar-wrapper">
    <el-menu
      ref="refMenu"
      :default-active="activeMenu"
      :collapse="sidebarCollapsed"
      :unique-opened="menuUniqueOpened"
      :collapse-transition="false"
      mode="vertical"
      class="eu-menu"
    >
      <sidebar-item
        v-for="item in menuList"
        :key="item.path"
        :item="item"
      />
    </el-menu>
  </el-scrollbar>
</template>

<style scoped lang="scss">
.el-scrollbar {
  flex: 1;
  background-color: var(--theme-nav-first-bg);
  color: var(--theme-nav-first-color);
  width: 100%;
  height: calc(100vh - var(--layout-header-nav-height));
  --eu-menu-level: 0;
  --eu-menu-base-level-padding: calc(1.3em + 8px);
}
::v-deep .el-menu {
  background-color: var(--theme-nav-first-bg);
  border-right: unset !important;
}
::v-deep .eu-menu {
  height: 100%;
  padding: 12px 0;
  border-right-color: var(--color-border);
  user-select: none;

  // 折叠状态下
  &.el-menu--collapse {
    .el-sub-menu__title,.el-menu-item {
      >:not(.svg-icon) {
        display: none;
      }
      .svg-icon {
        margin-right: unset;
      }
    }

    .el-sub-menu__title,.el-menu-item {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .el-sub-menu {
      &.is-active>.el-sub-menu__title {
        background-color: var(--theme-nav-first-active-bg);
        color: var(--theme-nav-first-active-color);
      }
    }
  }

  // 菜单项
  .el-sub-menu .el-sub-menu__title,.el-menu-item {
    margin: 0 8px 4px;
    border-radius: 6px;
    height: 40px;
    line-height: 40px;
    padding: 0 8px !important;
    display: flex;
    align-items: center;
    transition: unset;
    color: var(--theme-nav-first-color);
    //&:not(.is-active):hover {
    //  background-color: var(--theme-nav-first-active-bg);
    //  color: var(--theme-nav-first-active-color);
    //}
  }

  .el-menu-item:focus, .el-menu-item:hover, .el-submenu__title:hover {
    background-color: var(--theme-nav-first-hover-bg);
    color: var(--theme-nav-first-hover-color);
    font-weight: 500;
  }

  .el-sub-menu__icon-arrow {
    font-size: 14px;
    color: inherit;
    right: 8px;
  }

  // 有子菜单
  .el-sub-menu {
    &.is-active>.el-sub-menu__title {
      color: var(--color-primary);
    }
    .el-menu-item,.el-sub-menu .el-sub-menu__title {
      min-width: unset;
      padding-left: calc(8px + var(--eu-menu-base-level-padding) * var(--eu-menu-level)) !important;
    }
  }

  // 无子菜单的选中
  .el-menu-item.is-active {
    background-color: var(--theme-nav-first-active-bg);
    color: var(--theme-nav-first-active-color);
  }
}
::v-deep {
  .eu-scrollbar-wrapper {
    margin-right: unset !important;
    overflow-x: hidden !important;

    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
</style>
