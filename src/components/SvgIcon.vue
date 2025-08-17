<script setup lang="ts">
import { computed, defineProps } from 'vue';

export interface Props {
  iconClass: string;
  className?: string;
}

const props = defineProps<Props>();

const iconName = computed(() => `#icon-${props.iconClass}`);
const svgClass = computed(() => {
  // let className = props.className ? `icon-${props.className}` : '';
  return ['svg-icon', props.className];
});
</script>

<script lang="ts">
export default {
  name: 'SvgIcon',
};
</script>

<template>
  <svg v-if="iconClass" :class="svgClass" v-bind="$attrs">
    <use :href="iconName" />
  </svg>
</template>

<style scoped lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  display: inline-block;
}
</style>
