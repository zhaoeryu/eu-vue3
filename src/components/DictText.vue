<script setup lang="ts">
import { defineProps, computed, ref, onMounted } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { defaultTo } from 'lodash';

import { type DictDetail } from '@/types/system/dict';
import useLoading from '@/hooks/loading';
import useDict from '@/hooks/dict';

type Props = {
  value: number | string | boolean | null;
  dictKey: string;
  defaultValue?: string;
};
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
    options.value = res.data || [];
  } finally {
    setLoading(false);
  }
}
</script>

<script lang="ts">
export default {
  name: 'DictText',
};
</script>

<template>
  <el-icon v-if="loading"><Loading /></el-icon>
  <template v-else>
    {{ defaultTo(checkedItem?.dictLabel, defaultValue || '-') }}
  </template>
</template>

<style scoped lang="scss"></style>
