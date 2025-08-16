<script setup lang="ts">
import FirstSidebarItem from "@/layout/components/Sidebar/column/FirstSidebarItem.vue";
import SecondSidebar from "@/layout/components/Sidebar/column/SecondSidebar.vue";
import {useRouteStore, useSettingsStore} from "@/store";
import {useRoute} from "vue-router";
import {computed, defineOptions, nextTick, ref, useTemplateRef} from "vue";
import type {RouteNode} from "@/types/route";

defineOptions({
  name: 'SidebarColumn'
})

const route = useRoute();
const settingsStore = useSettingsStore();
const refSecondSidebar = useTemplateRef<InstanceType<typeof SecondSidebar>>('refSecondSidebar')
// 为了解决鼠标移入pop层的二级菜单，一级菜单不高亮的问题
const firstMenuHover = ref<boolean[]>([])

const activeFirstMenuPath = computed(() => {
  const _route = route.matched[0]
  return _route?.path === '' ? '/' : _route?.path
})

const menuList = computed(() => {
  const menus = useRouteStore().routes.filter(_route => !_route.hidden)
  return menus
})

const secondNavList = computed(() => {
  return (useRouteStore().routes.find(item => item.path === activeFirstMenuPath.value)?.children || [])
    .filter(item => !item.hidden)
})

function disabledFirstNav(item: RouteNode) {
  if (!Array.isArray(item.children) || (item.children.filter(c => !c.hidden)).length < 2) {
    // 如果没有二级菜单，或者二级菜单只有一个，则禁用
    return true
  }
  if (settingsStore.sidebarCollapsed) {
    // 收缩状态下，不需要禁用
    return false
  }
  // 只有当前router被选中时才禁用
  return item.path === activeFirstMenuPath.value
}

async function onItemClick(index: number, item: RouteNode) {
  await nextTick()
  refSecondSidebar.value.onSelfNavScroll()
}
async function onFirstItemClick(index: number, item: RouteNode) {
  await nextTick()
  refSecondSidebar.value.onSelfNavScroll()
}

</script>

<template>
  <div class="eu-nav__column">
    <!-- 一级菜单 -->
    <nav class="eu-nav-sidebar__first">
      <ul class="eu-nav-sidebar__first-list">
        <el-popover
          v-for="(item, index) in menuList"
          :key="index"
          :show-after="0"
          :hide-after="100"
          :disabled="disabledFirstNav(item)"
          :append-to-body="false"
          placement="right-start"
          width="140"
          popper-class="eu-nav-pop-wrapper"
          trigger="hover"
          @show="firstMenuHover[index] = true"
          @before-leave="firstMenuHover[index] = false"
        >
          <!-- 一级菜单Item -->
          <template #reference>
            <first-sidebar-item
              :item="item"
              :menu-list="menuList"
              :class="{ hover: firstMenuHover[index] }"
              @item-click="onFirstItemClick(index, $event)"
            />
          </template>
          <!-- 二级菜单弹出层 -->
          <div class="eu-nav-pop-inner">
            <second-sidebar
              ref="popSecondSidebar"
              :second-nav-list="item.children.filter(m => !m.hidden)"
              class="eu-nav-pop-scroll-wrapper"
              @item-click="onItemClick(index, $event)"
            />
          </div>
        </el-popover>
      </ul>
    </nav>
    <!-- 二级菜单 -->
    <second-sidebar ref="refSecondSidebar" :second-nav-list="secondNavList" class="eu-nav-sidebar__second" />
  </div>
</template>

<style lang='scss' scoped>
.eu-nav__column {
  flex: 1;
  display: inherit;
  width: inherit;
}
// 一级菜单
.eu-nav-sidebar__first {
  width: var(--sidebar-first-width, 124px);
  background-color: var(--theme-nav-first-bg);
  height: calc(100vh - var(--layout-header-nav-height));
  display: flex;
  flex-direction: column;
  .eu-nav-sidebar__first-list {
    flex: 1;
    font-size: 14px;
    overflow-y: auto;
    padding: 12px 0;
    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
// 二级菜单
.eu-nav-sidebar__second {
  width: var(--sidebar-second-width, 140px);
  background-color: var(--theme-nav-second-bg);
  padding: 16px 0 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - var(--layout-header-nav-height) - 1px);
  transition: width .15s linear;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 1px;
    width: 1px;
    height: 100%;
    background-color: var(--color-border);
  }
}

// 二级菜单pop层
.eu-nav-pop-inner {
  background-color: var(--theme-nav-second-bg);
  font-size: 14px;
  font-weight: 400;
  border-radius: 2px;
  padding: 12px 0;
}
.eu-nav-pop-scroll-wrapper {
  :deep(.eu-nav-scroll) {
    max-height: 650px;
  }
}
</style>
<style lang="scss">
// 二级菜单pop层样式
.eu-nav-pop-wrapper {
  font-size: 14px;
  line-height: 20px;
  padding: 0 !important;
}
</style>
