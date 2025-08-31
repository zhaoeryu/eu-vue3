<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { computed, ref, onMounted } from 'vue';

import useDict from '@/hooks/dict';
import useLoading from '@/hooks/loading';
import type { DictDetail } from '@/types/system/dict';

interface Props {
  value: number | string | boolean | null;
  dictKey: string;
}
const props = defineProps<Props>();

const options = ref<DictDetail[]>([]);
const { loading, setLoading } = useLoading(false);

const checkedItem = computed(() => {
  return options.value.find((item) => item.dictValue == props.value);
});

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
  name: 'DictTag',
};
</script>

<template>
  <el-icon v-if="loading">
    <Loading />
  </el-icon>
  <template v-else-if="checkedItem">
    <el-tag>{{ checkedItem.dictLabel || '-' }}</el-tag>
  </template>
</template>

<style scoped lang="scss"></style>
