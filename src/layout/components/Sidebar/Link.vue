<template>
  <component
    :is="type"
    v-bind="linkProps(to)"
  >
    <slot />
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { isExternal } from '@/utils';

export interface Props {
  to: string | object;
}

const props = defineProps<Props>();

const type = computed(() => {
  if (typeof props.to === 'string' && isExternal(props.to)) {
    return 'a';
  }
  return 'router-link';
});

function linkProps(to: string | object) {
  if (typeof to === 'string' && isExternal(to)) {
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
