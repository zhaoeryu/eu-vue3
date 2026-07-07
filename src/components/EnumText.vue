<script setup lang="ts">
import { defaultTo } from 'lodash';
import { computed } from 'vue';

import type { Enum } from '@/types/generic';

interface Props {
  value: number | string | boolean;
  enums: Enum;
  defaultValue?: string;
}
const props = defineProps<Props>();

const checkedItem = computed(() => {
  return props.enums.findByValue(props.value);
});
</script>

<script lang="ts">
export default {
  name: 'EnumText',
};
</script>

<template>
  {{ defaultTo(checkedItem?.label, defaultValue || '-') }}
</template>

<style scoped lang="scss"></style>
