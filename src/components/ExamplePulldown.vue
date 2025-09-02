<script setup lang="ts">
// 定义组件名称
defineOptions({
  name: 'ExamplePulldown',
});

import type { ComponentInstance } from 'vue';
import { getCurrentInstance, h, reactive } from 'vue';

import MSelectPulldown from '@/components/MSelectPulldown.vue';
import type { Value } from '@/components/MSelectPulldown.vue';
import { useCacheStore } from '@/store/modules/options';

export interface ExamplePulldownProps {
  customProp?: string
}

defineProps<ExamplePulldownProps>()

const state = reactive({
  queryParams: {
    page: 1,
    size: 10,
  },
  total: 100,
});

const field = {
  valueKey: 'id',
  labelKey: 'username'
}

async function fetchOptions() {
  const fetchOptionsApi = (params: any) => new Promise(resolve => {
    setTimeout(() => {
      console.log(params)
      const records = []
      for (let i = 1; i <= 10; i++) {
        records.push({
          id: i,
          username: `user_${i}`,
          nickname: `nick_${i}`,
        });
      }
      resolve({
        data: {
          records
        },
      });
    }, 300);
  });
  const res = await useCacheStore().fetchOptions({
    page: 1,
    size: 10,
  }, fetchOptionsApi);
  return {
    data: res.data.records,
  };
}
async function fetchObject(value: Value) {
  if (value === null) {
    return null;
  }
  const fetchObjectApi = (value: string | number) => new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: {
          id: value,
          username: `user_${value}`,
          nickname: `nick_${value}`,
        },
      });
    }, 300);
  });
  const res = await useCacheStore().fetchObject(value, fetchObjectApi);
  return res.data;
}

const vm = getCurrentInstance();
function changeRef(refInstance: any) {
  if (!vm) {
    return
  }
  vm.exposeProxy = vm.exposed = refInstance ?? {}
}
defineExpose({} as ComponentInstance<typeof MSelectPulldown>)
</script>

<template>
  <component :is="h(MSelectPulldown, {
    ...$attrs,
    fetchOptions,
    fetchObject,
    field,
    ref: changeRef,
  }, $slots)">
    <template #footer="{ query }">
      <pagination
        v-model:page="state.queryParams.page"
        v-model:limit="state.queryParams.size"
        :total="state.total"
        :pager-count="5"
        layout="total, prev, pager, next"
        style="padding: 12px;"
        @pagination="query"
      />
    </template>
  </component>
</template>

<style scoped lang="scss">
.list {
  padding: 12px 0;
}

.item {
  padding: 12px;
  margin: 0 12px;
  position: relative;
  border-radius: var(--el-border-radius-base);

  &+& {
    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 1px;
      background-color: var(--color-border);
    }
  }

  &:hover {
    background-color: var(--el-color-primary-light-9);
  }

  &.active {
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

/* .active {
  color: red;
  font-weight: 500;
} */
</style>
