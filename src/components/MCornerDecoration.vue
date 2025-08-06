<template>
  <div class="m-corner-decoration" :style="elStyle">
    <div class="m-corner-decoration__body">
      <div class="m-corner-decoration__main">
        <slot v-if="$slots.default" />
        <span v-else>{{ text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

const TYPE_MAP = {
  'success': 'var(--color-success)',
  'warning': 'var(--color-warning)',
  'error': 'var(--color-danger)',
  'primary': 'var(--color-primary)',
  'info': 'var(--color-info)'
}

type TYPE = 'success' | 'warning' | 'error' | 'primary' | 'info'

interface Props {
  text: string;
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  rotate?: number;
  type?: TYPE;
}

const props = withDefaults(defineProps<Props>(), {
  rotate: 0,
  type: 'primary'
})

const elStyle = computed(() => {
  let tmp = {
    top: props.top || 'unset',
    left: props.left || 'unset',
    bottom: props.bottom || 'unset',
    right: props.right || 'unset',
    transform: `rotate(${props.rotate}deg)`,
    '--decoration-color': TYPE_MAP[props.type] || TYPE_MAP['primary']
  }
  if (!props.top && !props.bottom) {
    tmp.top = '0'
  }
  if (!props.left && !props.right) {
    tmp.left = '0'
  }
  return tmp
})
</script>

<script lang="ts">
export default {
  name: 'MCornerDecoration'
}
</script>

<style lang="scss" scoped>
.m-corner-decoration {
  position: absolute;
  //top: 0;
  //left: 0;
  .m-corner-decoration__body {
    //--decoration-color: #178DED;
    --decoration-width: 70px;
    --decoration-main-height: 20px;
    --decoration-sub-width: 20px;
    --decoration-sub-border-width: 5px;
    width: var(--decoration-width);
    height: var(--decoration-width);
    overflow: hidden;
    .m-corner-decoration__main {
      position: relative;
      width: 200%;
      height: var(--decoration-main-height);
      line-height: var(--decoration-main-height);
      text-align: center;
      background: var(--decoration-color);
      color: #FFF;
      font-size: 12px;
      transform: rotate(-45deg) translate(-30%, -85%);
    }
    &:before {
      content: "";
      position: absolute;
      top: calc(0px - var(--decoration-sub-width) - var(--decoration-sub-border-width));
      right: calc(0px - var(--decoration-sub-width) - var(--decoration-sub-border-width));
      width: var(--decoration-sub-width);
      height: var(--decoration-sub-width);
      border: var(--decoration-sub-border-width) solid transparent;
      border-bottom: var(--decoration-sub-border-width) solid var(--decoration-color);
      filter: grayscale(30%);
    }
    &:after {
      content: "";
      position: absolute;
      bottom: calc(0px - var(--decoration-sub-width) - var(--decoration-sub-border-width));
      left: calc(0px - var(--decoration-sub-width) - var(--decoration-sub-border-width));
      width: var(--decoration-sub-width);
      height: var(--decoration-sub-width);
      border: var(--decoration-sub-border-width) solid transparent;
      border-right: var(--decoration-sub-border-width) solid var(--decoration-color);
      filter: grayscale(30%);
    }
  }
}
</style>

