<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    default: true,
  },
});
</script>
<script lang="ts">
export default {
  name: 'QueryExpandWrapper',
};
</script>
<template>
  <div
    class="query-expand-wrapper"
    :class="{
      'query-wrapper__show': show,
    }"
  >
    <slot />
    <el-divider />
  </div>
</template>

<style scoped lang="scss">
.query-expand-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0, 1, 0, 1);

  &.query-wrapper__show {
    max-height: 500px;
    transition: max-height 0.8s ease-in-out;
  }

  .el-divider--horizontal {
    margin-top: 0;
  }
}
</style>
