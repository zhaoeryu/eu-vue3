<script setup lang="ts">
import {computed, ref, watch} from "vue";

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  },
  active: {
    type: String
  }
})

const emit = defineEmits(['update:active'])

const innerActive = ref(null)

const iconType = computed(() => {
  if (!props.item.type) {
    return null
  }
  switch (props.item.type) {
    case 'java':
      return 'folder_java'
    case 'xml':
      return 'folder_xml'
    case 'js':
      return 'folder_js'
    case 'vue':
      return 'folder_vue'
    case 'sql':
      return 'folder_sql'
  }
  return 'folder_file'
})

watch(() => props.active, (value) => {
  innerActive.value = value
}, { immediate: true })

watch(innerActive, (value) => {
  emit('update:active', value)
})

function onChecked() {
  if (!props.item.code || props.item.name === innerActive.value) {
    return
  }
  innerActive.value = props.item.name
}

</script>

<template>
  <details open>
    <summary
      :class="{ active: item.code && active === item.name }"
      @click="onChecked"
    >
      <span class="tree-item" :class="iconType">{{ item.name }}</span>
    </summary>
    <tree-directory-item
      v-for="(v, index) in item.children"
      :key="index"
      :item="v"
      v-model:active="innerActive"
    />
  </details>
</template>

<style scoped lang="scss">

</style>
