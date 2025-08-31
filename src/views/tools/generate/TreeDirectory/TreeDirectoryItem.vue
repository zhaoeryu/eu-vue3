<script setup lang="ts">
import { computed } from 'vue';

import type { GeneratePreviewTree } from '@/types/system/generate';

interface State {
  item: GeneratePreviewTree;
};

const model = defineModel<string | null>();
const props = defineProps<State>();

const iconType = computed(() => {
  if (!props.item.type) {
    return null;
  }
  switch (props.item.type) {
    case 'java':
      return 'folder_java';
    case 'xml':
      return 'folder_xml';
    case 'js':
    case 'ts':
      return 'folder_js';
    case 'vue':
      return 'folder_vue';
    case 'sql':
      return 'folder_sql';
  }
  return 'folder_file';
});

function onChecked() {
  if (!props.item.code || props.item.name === model.value) {
    return;
  }
  model.value = props.item.name;
}
</script>

<template>
  <details open>
    <summary
      :class="{ active: item.code && model === item.name }"
      @click="onChecked"
    >
      <span
        class="tree-item"
        :class="iconType"
      >{{ item.name }}</span>
    </summary>
    <tree-directory-item
      v-for="(v, index) in item.children"
      :key="index"
      v-model="model"
      :item="v"
    />
  </details>
</template>

<style scoped lang="scss"></style>
