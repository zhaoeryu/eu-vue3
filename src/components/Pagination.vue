<script setup lang="ts">
import {computed} from "vue";
import {useSettingsStore} from "@/store";

const PAGE_LAYOUT_BLACKLIST = ['jumper', 'pager']

const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50, 100]
    }
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:page',
  'update:limit',
  'pagination'
])

const currentPage = computed({
  get() {
    return props.page
  },
  set(newValue) {
    emit('update:page', newValue)
  }
})
const pageSize = computed({
  get() {
    return props.limit
  },
  set(newValue) {
    emit('update:limit', newValue)
  }
})

const innerLayout = computed(() => {
  if (useSettingsStore().isMobileDevice && props.layout) {
    return props.layout.split(/\s*,\s*/).filter(item => !PAGE_LAYOUT_BLACKLIST.includes(item)).join(',')
  }
  return props.layout
})

function handleSizeChange(val) {
  emit('pagination', {
    page: currentPage,
    limit: val
  })
}
function handleCurrentChange(val) {
  emit('pagination', {
    page: val,
    limit: pageSize
  })
}
</script>

<template>
  <el-pagination
    v-bind="$attrs"
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="total"
    :background="background"
    :layout="innerLayout"
    :page-sizes="pageSizes"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>
