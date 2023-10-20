<script setup lang="ts">
import MenuCollapseButton from "@/layout/components/Sidebar/MenuCollapseButton.vue";
import FirstSidebarItem from "@/layout/components/Sidebar/FirstSidebarItem.vue";
import SecondSidebar from "@/layout/components/Sidebar/SecondSidebar.vue";
import {useRouteStore, useSettingsStore} from "@/store";
import {useRoute} from "vue-router";
import {computed, defineOptions, onMounted, ref, unref, watchEffect} from "vue";

defineOptions({
  name: 'Sidebar'
})

defineProps({
  secondNavHidden: Boolean
})
const emit = defineEmits(['update:secondNavHidden'])

const route = useRoute();
const settingsStore = useSettingsStore();

const activeFirstMenuPath = computed(() => {
  const _route = route.matched.find(item => item.parent === undefined)
  return _route.path === '' ? '/' : _route.path
})

const menuList = computed(() => {
  const menus = useRouteStore().routes.filter(_route => !_route.hidden)
  if (settingsStore.theme.useUsualMenu && shortcutMenu.value.children.length) {
    return [shortcutMenu.value, ...menus]
  }
  return menus
})

const shortcutMenu = computed(() => {
  return {
    path: '/usual',
    meta: { title: '快捷', icon: 'pushpin', shortcut: true },
    children: useRouteStore().usualMenus || []
  }
})

const secondNavList = computed(() => {
  return (useRouteStore().routes.find(item => item.path === activeFirstMenuPath.value)?.children || [])
    .filter(item => !item.hidden)
})

const isSecondNavHidden = computed(() => {
  const isNotMultiChildren = secondNavList.value.length < 2
  const _route = route.matched.find(item => item.parent === undefined)
  const isAlwaysShow = _route?.meta?.alwaysShow
  return isNotMultiChildren && !isAlwaysShow
})

watchEffect(() => {
  emit('update:secondNavHidden', isSecondNavHidden.value)
})

function disabledFirstNav(item) {
  if (!Array.isArray(item.children) || item.children.length < 2) {
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

function onNavPopperShow(index) {

}

function onItemClick(index, item) {

}

// 为了解决鼠标移入pop层的二级菜单，一级菜单不高亮的问题
const firstMenuHover = ref([])
const firstNavPopover = ref([])

onMounted(() => {
  firstNavPopover.value.forEach((item, index) => {
    item.popperRef.contentRef.addEventListener('mouseenter', function () {
      firstMenuHover.value[index] = true
    })
    item.popperRef.contentRef.addEventListener('mouseleave', function () {
      firstMenuHover.value[index] = false
    })
  })
})

</script>

<template>
  <aside id="eu-nav-sidebar">
    <!-- 一级菜单 -->
    <nav class="eu-nav-sidebar__first">
      <ul class="eu-nav-sidebar__first-list">
        <el-popover
          v-for="(item, index) in menuList"
          :key="index"
          :show-after="100"
          :hide-after="100"
          :disabled="disabledFirstNav(item)"
          :append-to-body="false"
          ref="firstNavPopover"
          placement="right-start"
          width="140"
          popper-class="eu-nav-pop-wrapper"
          trigger="hover"
          @show="onNavPopperShow(index)"
        >
          <!-- 一级菜单Item -->
          <template #reference>
            <first-sidebar-item
              :item="item"
              :class="{ hover: firstMenuHover[index] }"
            />
          </template>
          <!-- 二级菜单弹出层 -->
          <div class="eu-nav-pop-inner">
            <second-sidebar
              ref="popSecondSidebar"
              :second-nav-list="item.children"
              :root-path="item.path"
              class="eu-nav-pop-scroll-wrapper"
              @item-click="onItemClick(index, $event)"
            />
          </div>
        </el-popover>
      </ul>
    </nav>
    <!-- 二级菜单 -->
    <second-sidebar :second-nav-list="secondNavList" class="eu-nav-sidebar__second" />
    <!-- 收缩 -->
    <menu-collapse-button />
  </aside>
</template>

<style lang='scss' scoped>
#eu-nav-sidebar {
  width: var(--sidebar-width, 264px);
  height: 100%;
  position: fixed;
  top: 50px;
  left: 0;
  display: flex;
  z-index: 100;
  transition: width .15s linear;
  // 一级菜单
  .eu-nav-sidebar__first {
    width: var(--sidebar-first-width, 124px);
    background-color: var(--theme-nav-first-bg);
    height: 100%;
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
    height: calc(100% - 51px);
    transition: width .15s linear;
    border-left: 1px solid var(--color-border);
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
