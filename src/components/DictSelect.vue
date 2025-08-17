<script setup lang="ts">
import { defineModel, defineProps, onMounted, ref } from 'vue';

import { type DictDetail } from '@/types/system/dict';
import useLoading from '@/hooks/loading';
import useDict from '@/hooks/dict';

type Props = {
  dictKey: string;
};
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
    options.value = res.data || [];
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
  <el-select v-model="model" :loading="loading" v-bind="$attrs">
    <el-option v-for="item in options" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" />
  </el-select>
</template>

<style scoped lang="scss"></style>
