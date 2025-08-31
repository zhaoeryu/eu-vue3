<script setup lang="ts">
import * as DOMPurify from 'dompurify';
import { ref } from 'vue';

import type { Notice } from '@/types/system/notice';

const show = ref(false);
const notice = ref<Notice>({} as Notice);

function open(_notice: Notice) {
  notice.value = _notice || {};
  // 净化内容
  notice.value.content = DOMPurify.default.sanitize(notice.value.content);
  show.value = true;
}

defineExpose({
  open,
});
</script>

<template>
  <el-dialog
    v-model="show"
    title="通知公告"
    width="80%"
    append-to-body
  >
    <div style="line-height: 2em">
      <div style="font-weight: 500; font-size: 16px">{{ notice.title }}</div>
      <div style="color: #909399; font-size: 12px">
        <span>发布人：{{ notice.publisher || '未知' }}，</span>
        <span>发布时间：{{ notice.createTime || ' -- ' }}</span>
      </div>
    </div>
    <el-divider />
    <div>
      <!-- eslint-disable vue/no-v-html -->
      <div
        class="eu-editor-content-view"
        v-html="notice.content"
      />
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
@use '@/assets/styles/eu-editor.scss';
</style>
