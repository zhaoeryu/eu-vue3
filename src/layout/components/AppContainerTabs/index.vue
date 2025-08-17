<script setup lang="ts">
import { computed, defineOptions, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { type TabsPaneContext } from 'element-plus';

import { useRouteStore, useTabsStore } from '@/store';
import type { Tab } from '@/types/store/tabs';
import type { RouteNode } from '@/types/route';

defineOptions({
  name: 'AppContainerTabs',
});

const route = useRoute();
const router = useRouter();
const tabsStore = useTabsStore();
const routeStore = useRouteStore();

const tabActive = ref(null as string | null);
const moreIconMouseenter = ref(false);

const routes = computed(() => routeStore.routes);
const curTab = computed(() => tabsStore.tabs.find((item) => item.path === route.path));

watch(
  route,
  (newRoute, _oldRoute) => {
    initAffixTabs();
    const tab: Tab = {
      path: newRoute.path,
      title: newRoute.meta.title as string,
      icon: newRoute.meta.icon as string,
      affix: newRoute.meta.affix as boolean,
      keepAlive: newRoute.meta.keepAlive as boolean,
    };
    tabsStore.addTab(tab);
    tabActive.value = tabsStore.tabs.find((item) => item.path === newRoute.path)?.path || null;
  },
  {
    immediate: true,
  },
);

function initAffixTabs() {
  const affixTabs = filterAffixTabs(routes.value);
  for (const tab of affixTabs) {
    if (tab.path) {
      tabsStore.addTab(tab);
    }
  }
}
function filterAffixTabs(_routes: RouteNode[]) {
  let tabs: Tab[] = [];
  _routes.forEach((_route) => {
    if (_route.meta && _route.meta.affix && _route.meta.isChildMeta !== true) {
      tabs.push({
        path: _route.path,
        title: _route.meta.title,
        icon: _route.meta.icon,
        affix: _route.meta.affix,
        keepAlive: _route.meta.keepAlive,
      });
    }
    if (_route.children) {
      const tempTabs = filterAffixTabs(_route.children);
      if (tempTabs.length >= 1) {
        tabs = [...tabs, ...tempTabs];
      }
    }
  });
  return tabs;
}

function isActive(tab: Tab) {
  return tab.path === route.path;
}

function onTabClick(tab: TabsPaneContext) {
  router.push(tab.paneName as string);
}
function onTabRemove(path: string) {
  const tab = tabsStore.tabs.find((item) => item.path === path);
  if (tab) {
    tabsStore.delTab(tab);
    if (isActive(tab)) {
      openLastTab();
    }
  }
}

function openLastTab() {
  const lastTab = tabsStore.tabs.slice(-1)[0];
  if (lastTab) {
    router.push(lastTab.path);
  } else {
    router.push('/');
  }
}

function onDropdown(command: string) {
  switch (command) {
    case 'refresh':
      onPageRefresh();
      break;
    case 'closeOther':
      closeOtherTabs();
      break;
    case 'closeLeft':
      closeLeftTabs();
      break;
    case 'closeRight':
      closeRightTabs();
      break;
    case 'closeAll':
      closeAllTabs();
      break;
  }
}
function onPageRefresh() {
  window.location.reload();
}
function closeOtherTabs() {
  if (curTab.value) {
    tabsStore.delOthersTabs(curTab.value);
  }
}
function closeLeftTabs() {
  if (curTab.value) {
    tabsStore.delLeftTabs(curTab.value);
  }
}
function closeRightTabs() {
  if (curTab.value) {
    tabsStore.delRightTabs(curTab.value);
  }
}
function closeAllTabs() {
  tabsStore.delAllTabs();
  openLastTab();
}

function onDropdownVisibleChange(isVisible: boolean) {
  moreIconMouseenter.value = isVisible;
}
</script>

<template>
  <div id="app-container__tabs">
    <el-tabs v-model="tabActive" type="card" class="tabs-content eu-tabs-content-smart" @tab-click="onTabClick" @tab-remove="onTabRemove">
      <el-tab-pane v-for="item in tabsStore.tabs" :key="item.path" :label="item.title" :name="item.path" :closable="!item.affix"></el-tab-pane>
    </el-tabs>

    <el-dropdown trigger="click" popper-class="eu-tabs-dropdown" @command="onDropdown" @visible-change="onDropdownVisibleChange">
      <span class="eu-tabs-more">
        <span class="eu-tabs-more-icon" :class="{ 'eu-tabs-more-icon__mouse-enter': moreIconMouseenter }">
          <svg-icon icon-class="shortcut" />
        </span>
      </span>
      <template #dropdown>
        <el-dropdown-menu class="tabs-more">
          <el-dropdown-item command="refresh">
            <svg-icon icon-class="refresh" />
            刷新
          </el-dropdown-item>
          <el-dropdown-item command="closeOther">
            <svg-icon icon-class="close" />
            关闭其他
          </el-dropdown-item>
          <el-dropdown-item command="closeLeft">
            <svg-icon icon-class="arrow-left" />
            关闭左侧
          </el-dropdown-item>
          <el-dropdown-item command="closeRight">
            <svg-icon icon-class="arrow-right" />
            关闭右侧
          </el-dropdown-item>
          <el-dropdown-item command="closeAll">
            <svg-icon icon-class="close" />
            关闭全部
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style lang="scss">
.eu-tabs-dropdown {
  .svg-icon {
    margin-right: 0.5em;
  }
}
</style>
<style scoped lang="scss">
#app-container__tabs {
  max-height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--theme-base-second-bg);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-left: 1px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 4px;
  .tabs-content {
    width: calc(100% - 20px - 20px);
  }
  .eu-tabs-more {
    box-sizing: border-box;
    display: block;
    text-align: left;
    position: relative;
    .eu-tabs-more-icon {
      display: inline-block;
      cursor: pointer;
      transition: transform 0.3s ease-out;
      font-size: 20px;
    }
    .eu-tabs-more-icon__mouse-enter {
      transform: rotate(90deg);
      color: var(--color-primary);
    }
    //&:hover:after {
    //  position: absolute;
    //  bottom: 0;
    //  left: 0;
    //  height: 0;
    //  content: "";
    //}
  }
  .eu-tabs-content-smart {
    height: 34px;
    :deep(.el-tabs__nav-next, .el-tabs__nav-prev) {
      line-height: 34px;
      &.is-disabled {
        cursor: not-allowed;
      }
    }
    :deep(.el-tabs__header) {
      border-bottom: 0;
      .el-tabs__nav {
        border: 0;
        .el-tabs__item {
          border: 0;
          line-height: 34px;
          height: 34px;
          position: relative;
          transition: padding 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
          margin-right: 5px;
          border-radius: 2px 2px 0 0;
          user-select: none;
          &:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2px;
            width: 0;
            transition:
              all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
              border 0s,
              color 0.1s,
              font-size 0s;
            background-color: var(--color-primary) !important;
          }
          &.is-active {
            background: rgba(21, 91, 212, 0.08) !important;
            color: var(--color-primary) !important;
            &:after {
              width: 100%;
            }
          }
          &:not(.is-active):hover {
            background-color: rgba(21, 91, 212, 0.08);
            color: var(--color-primary) !important;
            &:after {
              width: 100%;
              transition:
                all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
                border 0s,
                color 0.1s,
                font-size 0s;
            }
          }
        }
      }
    }
  }
}

.eu-fixed-tabs {
  #app-container__tabs {
    position: fixed;
    top: 0;
    left: var(--sidebar-width, 264px);
    right: 0;
    z-index: 3;
    transition: left 0.15s linear;
  }
}
</style>
