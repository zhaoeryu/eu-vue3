<script setup lang="ts">
import {computed, defineModel, defineProps} from 'vue'
import { enumsConvertToList } from "@/utils/enums";
import type {Enum} from "@/types/generic";

type Props = {
  enums: Enum
}
const model = defineModel()
const props = defineProps<Props>()

const options = computed(() => enumsConvertToList(props.enums))
</script>

<script lang="ts">
export default {
  name: 'EnumRadioGroup'
}
</script>

<template>
  <el-radio-group v-model="model">
    <el-radio
      v-for="item in options"
      :key="item.value"
      :value="item.value"
    >{{ item.label }}</el-radio>
  </el-radio-group>
</template>

<style scoped lang="scss">

</style>
