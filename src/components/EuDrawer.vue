<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: '60%',
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
});
</script>

<script lang="ts">
export default {
  name: 'EuDrawer',
};
</script>

<template>
  <el-drawer
    :size="size"
    direction="rtl"
    class="eu-drawer"
    v-bind="$attrs"
  >
    <div class="drawer-body">
      <div style="flex: 1;overflow-y: auto;">
        <slot />
      </div>
      <div
        v-if="showFooter"
        class="drawer-body__footer"
      >
        <div>
          <slot name="footer-left" />
        </div>
        <div>
          <slot name="footer-right" />
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss"></style>
