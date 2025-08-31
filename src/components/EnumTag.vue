<script setup lang="ts">
import { computed } from 'vue';

import type { Enum } from '@/types/generic';
import { enumsFindByValue } from '@/utils/enums';

interface Props {
  value: number | string | boolean;
  enums: Enum;
}
const props = defineProps<Props>();

const checkedItem = computed(() => {
  return enumsFindByValue(props.enums, props.value);
});
</script>

<script lang="ts">
export default {
  name: 'EnumTag',
};
</script>

<template>
  <template v-if="checkedItem">
    <el-tag :type="checkedItem.type">{{ checkedItem.label }}</el-tag>
  </template>
</template>

<style scoped lang="scss"></style>
