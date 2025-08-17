<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { defaultTo } from 'lodash';

import { type Enum } from '@/types/generic';
import { enumsFindByValue } from '@/utils/enums';

type Props = {
  value: number | string | boolean;
  enums: Enum;
  defaultValue?: string;
};
const props = defineProps<Props>();

const checkedItem = computed(() => {
  return enumsFindByValue(props.enums, props.value);
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
