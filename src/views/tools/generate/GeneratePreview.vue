<script setup lang="ts">
import { preview } from '@/api/system/generate'
import TreeDirectory from '@/views/tools/generate/TreeDirectory/TreeDirectory.vue'
import {computed, ref} from "vue";
import { useClipboard } from '@vueuse/core'
import {ElMessage} from "element-plus";
import CodeEditor from "@/components/CodeEditor.vue";
import {DocumentCopy} from "@element-plus/icons-vue";
import useVisible from "@/hooks/visible";
import {useResettableReactive} from "@/hooks/resettable";
import useLoading from "@/hooks/loading";
import type {GeneratePreview, GenerateTable, GeneratePreviewTree} from "@/types/system/generate";

const { visible, setVisible } = useVisible(false)
const { loading, setLoading } = useLoading(false)
const [state, reset] = useResettableReactive({
  tabActive: null as string | null,
  list: [] as GeneratePreview[],
  directoryTree: [] as GeneratePreviewTree[]
})

// const show = ref(false)
// const tabActive = ref(null)
// const loading = ref(false)
// const list = ref([])
// const directoryTree = ref([])

const pageTitle = '代码预览'
const activeItem = computed(() => {
  return state.list.find(item => item.name === state.tabActive)
})

function open(row: GenerateTable) {
  reset()
  setVisible(true)
  setLoading(true)
  preview({
    tableName: row.tableName
  }).then(res => {
    state.list = (res.data || []).map((item: GeneratePreview) => {
      item.mode = convertMode(item.type)
      return item
    })
    state.tabActive = state.list[0].name

    // 构建树形目录
    state.directoryTree = buildTree(state.list) as GeneratePreviewTree[];
  }).finally(() => {
    setLoading(false)
  })
}

function onCopy() {
  const code = state.list.find(item => item.name === state.tabActive)?.code || ''
  const { copy, isSupported } = useClipboard()
  if (!isSupported) {
    ElMessage.error('浏览器不支持复制')
    return
  }
  copy(code)
  ElMessage.success('复制成功')
}

function convertMode(type: string) {
  switch (type) {
    case 'java':
      return 'text/x-java'
    case 'xml':
      return 'text/xml'
    case 'js':
    case 'ts':
      return 'text/javascript'
    case 'vue':
      return 'text/x-vue'
    case 'sql':
      return 'text/x-sql'
  }
  return 'text/plain'
}

function buildTree(data: GeneratePreview[]) {
  // @ts-ignore
  const root: GeneratePreviewTree = { name: '', children: [] };
  const treeMap: Record<string, GeneratePreviewTree> = { '': root };

  data.forEach(item => {
    const pathParts = item.path.split('/');
    let parent = root;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!treeMap[part]) {
        // @ts-ignore
        const node: GeneratePreviewTree = { name: part, children: [] };
        treeMap[part] = node;
        parent.children.push(node);
      }
      parent = treeMap[part];
    }

    parent.children.push({
      name: item.name,
      code: item.code,
      type: item.type,
      mode: item.mode,
      i18n: item.i18n,
      path: item.path,
      children: []
    });
  });

  return root.children;
}

defineExpose({
  open
})
</script>

<template>
  <el-drawer
    :title="pageTitle"
    v-model="visible"
    size="80%"
    direction="rtl"
  >
    <div v-loading="loading" style="position: relative;">
      <div style="display: flex;">
        <div style="padding: 0 12px;">
          <tree-directory v-model="state.tabActive" :tree="state.directoryTree" />
        </div>
        <code-editor v-if="activeItem" :value="activeItem.code" height="100%" style="flex: 1;" :mode="activeItem.mode" />
        <el-empty v-else style="flex: 1;" />
      </div>
      <el-button class="copy-btn" type="warning" size="small" :icon="DocumentCopy" @click="onCopy">复制代码</el-button>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
:deep(.el-drawer__header) {
  margin-bottom: 12px;
}
.copy-btn {
  position: fixed;
  top: 100px;
  right: 5%;
}
</style>
