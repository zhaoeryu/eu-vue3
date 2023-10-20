<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  iconClass: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: '',
  }
})

const iconName = computed(() => `#icon-${props.iconClass}`)
const svgClass = computed(() => {
  // let className = props.className ? `icon-${props.className}` : '';
  return ['svg-icon', props.className]
})
</script>

<template>
  <!-- aria-hidden: 让这个元素对浏览器隐藏 -->
  <svg :class="svgClass" aria-hidden="true" v-bind="$attrs" v-if="iconClass">
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
