<script setup lang="ts">
import {ref} from "vue";

const show = ref(false)
const notice = ref({})

function open(_notice) {
  notice.value = _notice || {}
  show.value = true
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    title="通知公告"
    v-model="show"
    width="80%"
    append-to-body
  >
    <div style="line-height: 2em;">
      <div style="font-weight: 500;font-size: 16px;">{{ notice.title }}</div>
      <div style="color: #909399;font-size: 12px;">
        <span>发布人：{{ notice.publisher || '未知' }}，</span>
        <span>发布时间：{{ notice.createTime || ' -- ' }}</span>
      </div>
    </div>
    <el-divider />
    <div>
      <div v-html="notice.content" class="eu-editor-content-view"></div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
@import '@/assets/styles/eu-editor.scss';
</style>
