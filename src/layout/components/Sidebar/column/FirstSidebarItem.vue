<script setup>
import AppLink from '@/layout/components/Sidebar/Link.vue'
import { getMaxMatchedMenu } from '@/utils/route-helpers'
import { computed } from 'vue'
import {useRoute} from "vue-router";

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  menuList: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'item-click'
])

const route = useRoute()

const activeFirstMenu = computed(() => {
  const matchedRoute = route.matched.find(item => item.parent === undefined)
  return matchedRoute.path
})
const isActive = computed(() => {
  if (props.item.path === '/' && activeFirstMenu.value === '') {
    return true
  }
  if (props.item.path === activeFirstMenu.value) {
    return true
  }
  if (route.meta.hidden === true) {
    // 支持模糊匹配
    const matched = getMaxMatchedMenu(route.path, props.menuList)
    return matched && matched === props.item.path
  }
  return false
})
function onItemClick() {
  emit('item-click', props.item)
}
</script>

<template>
  <li :class="{ 'active': isActive }" @click="onItemClick">
    <app-link :to="item.path">
      <svg-icon v-if="item.meta.icon" :icon-class="item.meta.icon" />
      <span class="text-overflow">{{ item.meta.title }}</span>
    </app-link>
  </li>
</template>

<style scoped lang="scss">
li {
  height: 40px;
  border-radius: 6px;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: 0 8px 4px;
  user-select: none;
  >a {
    padding: 0 8px;
    color: var(--theme-nav-first-color);
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    >.svg-icon {
      display: inline-block;
      min-width: 1.3em;
      min-height: 1.3em;
      text-align: center;
      margin-right: 8px;
    }
  }
  &.active,&.hover {
    background-color: var(--theme-nav-first-active-bg);
    >a {
      color: var(--theme-nav-first-active-color);
    }
  }
  &:not(.active):hover {
    background-color: var(--theme-nav-first-hover-bg);
    >a {
      color: var(--theme-nav-first-hover-color);
    }
  }
}
// 折叠状态
.sidebar-collapsed li {
  justify-content: center;
  >a {
    justify-content: center;
    >span {
      display: none !important;
    }
    >.svg-icon {
      margin-right: 0 !important;
    }
  }
}
</style>
