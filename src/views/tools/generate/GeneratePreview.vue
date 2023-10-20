<script setup lang="ts">
import { preview } from '@/api/system/generate'
import TreeDirectory from '@/views/tools/generate/TreeDirectory/TreeDirectory.vue'
import {computed, ref} from "vue";
import { useClipboard } from '@vueuse/core'
import {ElMessage} from "element-plus";
import CodeEditor from "@/components/CodeEditor.vue";
import {DocumentCopy} from "@element-plus/icons-vue";

const show = ref(false)
const tabActive = ref(null)
const loading = ref(false)
const list = ref([])
const directoryTree = ref([])

const pageTitle = '代码预览'
const activeItem = computed(() => {
  return list.value.find(item => item.name === tabActive.value)
})

function open(row) {
  show.value = true

  loading.value = true
  preview({
    tableName: row.tableName
  }).then(res => {
    list.value = (res.data || []).map(item => {
      item.mode = convertMode(item.type)
      return item
    })
    tabActive.value = list.value[0].name

    // 构建树形目录
    directoryTree.value = buildTree(list.value);
  }).finally(() => {
    loading.value = false
  })
}

function onCopy() {
  const code = list.value.find(item => item.name === tabActive.value).code
  const { copy, isSupported } = useClipboard()
  if (!isSupported) {
    ElMessage.error('浏览器不支持复制')
    return
  }
  copy(code)
  ElMessage.success('复制成功')
}

function convertMode(type) {
  switch (type) {
    case 'java':
      return 'text/x-java'
    case 'xml':
      return 'text/xml'
    case 'js':
      return 'text/javascript'
    case 'vue':
      return 'text/x-vue'
    case 'sql':
      return 'text/x-sql'
  }
  return 'text/plain'
}

function buildTree(data) {
  const root = { name: '', children: [] };
  const treeMap = { '': root };

  data.forEach(item => {
    const pathParts = item.path.split('/');
    let parent = root;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!treeMap[part]) {
        const node = { name: part, children: [] };
        treeMap[part] = node;
        parent.children.push(node);
      }
      parent = treeMap[part];
    }

    parent.children.push({
      name: item.name,
      code: item.code,
      type: item.type,
      mode: item.mode
    });
  });

  return root.children;
}

defineExpose({
  open
})
</script>

<template>
  <div>
    <el-drawer
      :title="pageTitle"
      v-model="show"
      size="80%"
      direction="rtl"
    >
      <div v-loading="loading" style="position: relative;">
        <div style="display: flex;">
          <div style="padding: 0 12px;">
            <tree-directory v-model:active="tabActive" :tree="directoryTree" />
          </div>
          <code-editor v-if="activeItem" :value="activeItem.code" height="100%" style="flex: 1;" :mode="activeItem.mode" />
          <el-empty v-else style="flex: 1;" />
        </div>
        <el-button class="copy-btn" type="warning" size="small" :icon="DocumentCopy" @click="onCopy">复制代码</el-button>
      </div>
    </el-drawer>
  </div>
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
