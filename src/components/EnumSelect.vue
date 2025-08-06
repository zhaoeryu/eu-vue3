<script setup lang="ts">
import {computed, defineModel, defineProps} from 'vue'
import {type Enum} from "@/types/generic";
import {enumsConvertToList} from "@/utils/enums";

type Props = {
  enums: Enum
}
const model = defineModel()
const props = defineProps<Props>()

const options = computed(() => enumsConvertToList(props.enums))
</script>

<script lang="ts">
export default {
  name: 'EnumSelect'
}
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

<style scoped lang="scss">

</style>
