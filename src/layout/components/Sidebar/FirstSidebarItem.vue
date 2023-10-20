<script>
import AppLink from '@/layout/components/Sidebar/Link.vue'

export default {
  name: 'FirstSidebarItem',
  components: { AppLink },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    activeFirstMenu() {
      const route = this.$route.matched.find(item => item.parent === undefined)
      return route.path
    },
    isActive() {
      if (this.item.path === '/' && this.activeFirstMenu === '') {
        return true
      }
      return this.item.path === this.activeFirstMenu
    }
  },
}
</script>

<template>
  <li :class="{ 'active': isActive }">
    <template v-if="item.meta.shortcut">
      <app-link :to="item.children[0].fullPath">
        <svg-icon v-if="item.meta.icon" :icon-class="item.meta.icon" />
        <span>{{ item.meta.title }}</span>
      </app-link>
    </template>
    <app-link v-else :to="item.path">
      <svg-icon v-if="item.meta.icon" :icon-class="item.meta.icon" />
      <span>{{ item.meta.title }}</span>
    </app-link>
  </li>
</template>

<style scoped lang="scss">
li {
  height: 40px;
  border-radius: 2px;
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
      width: 1.3em;
      height: 1.3em;
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
