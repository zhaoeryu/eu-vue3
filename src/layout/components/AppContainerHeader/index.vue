<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'AppContainerHeader',
});

const route = useRoute();

const activeMenus = computed(() => {
  const activeMenus = route.matched.filter((item) => !['', '/'].includes(item.path));
  if (activeMenus.length === 2) {
    // 如果是两级菜单，且first.redirect === first.path === second.path
    // 这种情况是一级菜单的类型为菜单，创建router的时候包装了一层Layout，故这里只需要显示一级菜单即可
    const [first, second] = activeMenus;
    if (first.redirect === first.path && first.redirect === second.path) {
      return [first];
    }
  }
  return activeMenus;
});
</script>

<template>
  <header id="app-container__header">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in activeMenus"
        :key="index"
      >{{ item.meta.title }}</el-breadcrumb-item>
    </el-breadcrumb>
  </header>
</template>

<style scoped lang="scss">
#app-container__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 21px 21px 16px;
}
</style>
