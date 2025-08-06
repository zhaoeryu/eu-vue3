<script setup lang="ts">
import { defineProps, computed } from 'vue'
import {type Enum} from "@/types/generic";
import { enumsFindByValue } from "@/utils/enums";
import { defaultTo } from 'lodash'

type Props = {
  value: number | string,
  enums: Enum,
  defaultValue?: string,
}
const props = defineProps<Props>()

const checkedItem = computed(() => {
  return enumsFindByValue(props.enums, props.value)
})
</script>

<script lang="ts">
export default {
  name: 'EnumText'
}
</script>

<template>
  <template>
    {{ defaultTo(checkedItem?.label, defaultValue || '-') }}
  </template>
</template>

<style scoped lang="scss">

</style>
