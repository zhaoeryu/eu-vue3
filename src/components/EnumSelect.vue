<script setup lang="ts">
import { computed } from 'vue';

import type { Enum } from '@/types/generic';

interface Props {
  enums: Enum;
}
const model = defineModel<string | number | boolean | null>();
const props = defineProps<Props>();

const options = computed(() => props.enums.options());
</script>

<script lang="ts">
export default {
  name: 'EnumSelect',
};
</script>

<template>
  <el-select
    v-model="model"
    v-bind="$attrs"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<style scoped lang="scss"></style>
