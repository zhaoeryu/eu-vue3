<script setup lang="ts">
import { computed } from 'vue';

import { useSettingsStore } from '@/store';

export interface Props {
  total: number;
  pageSizes?: number[];
  layout?: string;
  background?: boolean;
}

const page = defineModel<number>('page');
const limit = defineModel<number>('limit');

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [10, 20, 30, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
});

const PAGE_LAYOUT_BLACKLIST = ['jumper', 'pager'];

const emit = defineEmits(['pagination']);

const innerLayout = computed(() => {
  if (useSettingsStore().isMobileDevice && props.layout) {
    return props.layout
      .split(/\s*,\s*/)
      .filter((item) => !PAGE_LAYOUT_BLACKLIST.includes(item))
      .join(',');
  }
  return props.layout;
});

function handleSizeChange(val: number) {
  emit('pagination', {
    page: page.value,
    limit: val,
  });
}
function handleCurrentChange(val: number) {
  emit('pagination', {
    page: val,
    limit: limit.value,
  });
}
</script>

<script lang="ts">
export default {
  name: 'Pagination',
};
</script>

<template>
  <el-pagination
    v-bind="$attrs"
    v-model:current-page="page"
    v-model:page-size="limit"
    :total="props.total"
    :background="props.background"
    :layout="innerLayout"
    :page-sizes="props.pageSizes"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>
