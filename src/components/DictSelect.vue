<script setup lang="ts">
import { onMounted, ref } from 'vue';

import useDict from '@/hooks/dict';
import useLoading from '@/hooks/loading';
import type { DictDetail } from '@/types/system/dict';

interface Props {
  dictKey: string;
}
const model = defineModel<string | number | boolean | null>();
const props = defineProps<Props>();
const { loading, setLoading } = useLoading(false);
const options = ref<DictDetail[]>([]);

onMounted(() => {
  initOptions();
});

async function initOptions() {
  setLoading(true);
  try {
    const res = await useDict().fetchOptions(props.dictKey);
    options.value = res.data ?? [];
  } finally {
    setLoading(false);
  }
}
</script>

<script lang="ts">
export default {
  name: 'DictSelect',
};
</script>

<template>
  <el-select
    v-model="model"
    :loading="loading"
    v-bind="$attrs"
  >
    <el-option
      v-for="item in options"
      :key="item.dictValue"
      :label="item.dictLabel"
      :value="item.dictValue"
    />
  </el-select>
</template>

<style scoped lang="scss"></style>
