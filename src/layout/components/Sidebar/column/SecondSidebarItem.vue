<script lang="ts" setup>
import AppLink from '@/layout/components/Sidebar/Link.vue'
import { computed, ref, defineProps } from 'vue'
import {useRoute} from "vue-router";
import { isMenuSegmentMatch } from '@/utils/route-helpers'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const route = useRoute()

const isOpened = ref(true)

const resolvedPath = computed(() => {
  if (props.item.fullPath) {
    return props.item.fullPath
  }
  return props.item.path
})

const hasChildren = computed(() => {
  return props.item.children && (props.item.children.filter(m => !m.hidden)).length
})

const isActive = computed(() => {
  const activeMenu = route.path
  let isActive = resolvedPath.value === activeMenu
  if (!isActive && route.meta.hidden === true) {
    // 支持模糊匹配
    isActive = isMenuSegmentMatch(activeMenu, resolvedPath.value)
  }
  return isActive
})
</script>

<template>
  <li
    :class="{
      'active': isActive,
      'eu-submenu': hasChildren,
      'eu-menu-item': !hasChildren,
      'is-opened': isOpened,
    }"
    @click="$emit('item-click', item)"
  >
    <!-- 有子菜单 -->
    <template v-if="hasChildren">
      <div class="eu-submenu__title" @click="isOpened = !isOpened">
        <svg-icon icon-class="arrow-right2"/>
        <span class="text-overflow">{{ item.meta.title }}</span>
      </div>
      <ul class="eu-submenu__body">
        <second-sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :root-path="resolvedPath"
          @item-click="$emit('item-click', $event)"
        />
      </ul>
    </template>
    <!-- 没有子菜单 -->
    <app-link v-else :to="resolvedPath">
      <span class="text-overflow">{{ item.meta.title }}</span>
      <el-tag v-if="item.meta.badge" type="danger" effect="dark">{{ item.meta.badge }}</el-tag>
      <span v-else-if="item.meta.dot" class="eu-dot eu-dot-error">
        <span></span>
      </span>
    </app-link>
  </li>
</template>

<style scoped lang="scss">
li {
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  position: relative;
  &.eu-menu-item {
    height: 36px;
    border-radius: 6px;
    margin: 0 8px 4px;
    display: flex;
    align-items: center;
    padding: 0 8px;
    >a {
      color: var(--theme-nav-second-color);
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }
    &.active {
      background-color: var(--theme-nav-second-active-bg);
      >a {
        color: var(--theme-nav-second-active-color);
      }
    }
    &:not(.active):hover {
      background-color: var(--theme-nav-second-hover-bg);
      >a {
        color: var(--theme-nav-second-hover-color);
      }
    }
  }
  &.eu-submenu {
    &>.eu-submenu__title {
      height: 32px;
      line-height: 32px;
      padding: 0 8px;
      color: #4d5466;
      .svg-icon {
        transform: rotate(0deg);
        transition: transform .3s;
        font-size: 12px;
        font-weight: bold;
        margin-right: 4px;
      }
    }
    &>.eu-submenu__body {
      max-height: 0;
      overflow: hidden;
      transition: max-height .3s cubic-bezier(0, 1, 0, 1);
      &>.eu-menu-item {
        margin-left: 16px;
      }
    }
    &.is-opened {
      &>.eu-submenu__body {
        max-height: 1000px;
        transition: max-height .8s ease-in-out;
      }
      &>.eu-submenu__title>.svg-icon {
        transform: rotate(90deg);
      }
    }
    &.active {
      .eu-submenu__title {
        color: var(--theme-nav-second-active-color);
      }
    }
    &>.eu-submenu__body {
      &>:not(.eu-menu-item) {
        margin-left: 8px;
      }
    }
  }
}

.el-tag {
  position: absolute;
  right: 4px;
  height: 16px;
  padding-right: 4px;
  padding-left: 4px;
  line-height: 16px;
  border: 0;
}
.eu-dot {
  position: absolute;
  right: 4px;
}
</style>
