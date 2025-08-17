<template>
  <component :is="type" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue';

import { isExternal } from '@/utils';

export interface Props {
  to: string | object;
}

const props = defineProps<Props>();

const type = computed(() => {
  if (isExternal(props.to)) {
    return 'a';
  }
  return 'router-link';
});

function linkProps(to) {
  if (isExternal(to)) {
    return {
      href: to,
      target: '_blank',
      rel: 'noopener',
    };
  }
  return {
    to: to,
  };
}
</script>
