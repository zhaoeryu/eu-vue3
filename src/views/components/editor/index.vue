<script setup lang="ts">
import {ref} from "vue";

const content = ref(null)
</script>

<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :span="12" :xs="24">
        <div class="page-body">
          <eu-editor v-model="content" />
        </div>
      </el-col>
      <el-col :span="12" :xs="24">
        <div class="page-body">
          <m-block-header title="预览" />
          <div v-html="content" class="eu-editor-content-view"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/eu-editor.scss';
</style>
