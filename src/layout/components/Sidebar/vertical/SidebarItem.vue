<script setup>
import AppLink from '@/layout/components/Sidebar/Link.vue'
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    required: false,
    default: 0
  }
})

const childrenList = computed(() => {
  return (props.item.children || []).filter(item => !item.hidden)
})

const isHiddenChildren = computed(() => {
  const isNotMultiChildren = childrenList.value.length < 2
  const isAlwaysShow = props.item.meta?.alwaysShow
  // 如果子菜单只有一个，同时alwaysShow = false，并且是一级菜单
  return !childrenList.value.length
    || (isNotMultiChildren && !isAlwaysShow && isRoot)
})

const isRoot = computed(() => {
  return props.level === 0
})

const resolvedPath = computed(() => {
  if (props.item.fullPath) {
    return props.item.fullPath
  }
  return props.item.path
})
</script>

<template>
  <div
    :style="{
      '--eu-menu-level': level
    }"
  >
    <template v-if="isHiddenChildren">
      <app-link :to="resolvedPath">
        <el-menu-item :index="resolvedPath">
          <svg-icon v-if="isRoot && item.meta.icon" :icon-class="item.meta.icon" />
          <template #title>
            <span class="text-overflow">{{ item.meta.title }}</span>
            <el-tag v-if="item.meta.badge" type="danger" effect="dark">{{ item.meta.badge }}</el-tag>
            <span v-else-if="item.meta.dot" class="eu-dot eu-dot-error">
              <span></span>
            </span>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu
      v-else
      :index="resolvedPath"
      popper-class="eu-submenu"
      :teleported="true"
    >
      <template #title>
        <svg-icon v-if="isRoot && item.meta.icon" :icon-class="item.meta.icon" />
        <span class="text-overflow">{{ item.meta.title }}</span>
      </template>
      <sidebar-item
        v-for="child in childrenList"
        :key="child.path"
        :item="child"
        :level="level + 1"
      />
    </el-sub-menu>
  </div>
</template>

<style scoped lang="scss">
.svg-icon {
  display: inline-block;
  width: 1.3em;
  height: 1.3em;
  min-width: 1.3em;
  min-height: 1.3em;
  text-align: center;
  margin-right: 8px;
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
<style lang="scss">
// 弹出层的二级菜单样式
.eu-submenu {
  font-size: 14px;
  font-weight: 400;
  user-select: none;
  .el-menu--popup {
    background-color: var(--theme-nav-second-bg);
    color: var(--theme-nav-second-color);
    border: 1px solid var(--color-border-2);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    padding: 12px 0;
    min-width: var(--sidebar-second-width, 140px);

    a {
      color: inherit;
    }

    // 菜单项
    .el-menu-item,.el-sub-menu__title {
      transition: unset;
      color: inherit;
      height: 36px;
      border-radius: 2px;
      margin: 0 8px 4px;
      display: flex;
      align-items: center;
      padding: 0 8px !important;
      i {
        color: inherit;
      }

      // 悬浮状态
      &:hover {
        background-color: var(--theme-nav-second-hover-bg);
        //color: var(--theme-nav-second-active-color);
      }
    }
    .el-sub-menu__icon-arrow {
      right: 8px;
    }

    // 有子菜单的选中
    .el-sub-menu.is-active {
      .el-menu-item,.el-sub-menu__title {
        background-color: var(--theme-nav-second-active-bg);
        color: var(--theme-nav-second-active-color);
      }
    }
    // 无子菜单的选中
    .el-menu-item.is-active {
      background-color: var(--theme-nav-second-active-bg);
      color: var(--theme-nav-second-active-color);
    }
  }
}
</style>
