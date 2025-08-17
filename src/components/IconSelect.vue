<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { type PopoverInstance } from 'element-plus';

import icons from '@/utils/icons';

const model = defineModel<string | null>();
const keyword = ref<string | null>(null);
const refPopover = useTemplateRef<PopoverInstance>('refPopover');

const filterIcons = computed(() => {
  if (keyword.value) {
    return icons.filter((item) => item.includes(keyword.value as string));
  }
  return icons;
});

function onShow() {
  keyword.value = null;
}

function onIconSelected(icon: string) {
  model.value = icon;
  refPopover.value?.hide();
}
</script>

<script lang="ts">
export default {
  name: 'IconSelect',
};
</script>

<template>
  <el-popover ref="refPopover" placement="bottom-start" width="fit-content" trigger="click" append-to-body @show="onShow">
    <div class="icon-select-body">
      <el-input v-model="keyword" style="width: 250px" placeholder="输入要查找的图标拼音" />
      <el-divider></el-divider>
      <div style="max-height: 300px; overflow-y: auto">
        <el-row>
          <el-col v-for="(icon, index) in filterIcons" :key="index" :span="4" :class="{ active: icon === model }" @click="onIconSelected(icon)">
            <div style="text-align: center">
              <svg-icon :icon-class="icon" />
              <div style="font-size: 12px; color: #909399">{{ icon }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <template #reference>
      <slot name="reference" />
    </template>
  </el-popover>
</template>

<style scoped lang="scss">
.icon-select-body {
  width: 700px;
  :deep(.el-divider--horizontal) {
    margin: 12px 0;
  }
  :deep(.svg-icon) {
    width: 1.5em;
    height: 1.5em;
  }
  .el-col {
    padding: 6px;
    cursor: pointer;
    user-select: none;
    margin-bottom: 12px;
    &:hover,
    .active {
      background-color: rgba(21, 91, 212, 0.08);
      border-radius: 4px;
    }
  }
}
</style>
