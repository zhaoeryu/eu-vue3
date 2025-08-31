<script lang="ts" setup>
import { UploadFilled, Plus } from '@element-plus/icons-vue';
import { ref } from 'vue';

const file = ref(null);
const image = ref(null);
const imageList = ref(null);
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <m-block-header title="点击上传文件" />
      <upload-file
        v-model="file"
        upload-api="/api/upload/uploadFile"
        :multiple="true"
        :limit="3"
        :size-limit="1"
        tip="单个文件不超过1MB"
      />

      <m-block-header title="用户头像上传" />
      <upload-file
        v-model="image"
        upload-api="/api/upload/uploadFile"
        :show-file-list="false"
        :single-mode="true"
        accept="image/*"
        list-type="picture-card"
      >
        <template #trigger>
          <img
            v-if="image"
            :src="image"
            alt=""
            class="avatar"
          />
          <el-icon v-else>
            <Plus />
          </el-icon>
        </template>
      </upload-file>

      <m-block-header title="文件缩略图" />
      <upload-file
        v-model="imageList"
        upload-api="/api/upload/uploadFile"
        :multiple="true"
        accept="image/*"
        :limit="10"
        list-type="picture-card"
      >
        <template #trigger>
          <el-icon>
            <Plus />
          </el-icon>
        </template>
      </upload-file>

      <m-block-header title="上传文件列表控制" />
      <upload-file
        v-model="file"
        upload-api="/api/upload/uploadFile"
        :multiple="true"
        :limit="10"
        tip="单个文件不超过10MB"
        list-type="picture"
      />

      <m-block-header title="拖拽上传" />
      <upload-file
        v-model="file"
        upload-api="/api/upload/uploadFile"
        :multiple="true"
        :limit="10"
        tip="单个文件不超过10MB"
        drag
      >
        <template #trigger>
          <el-icon
            size="67"
            color="var(--el-text-color-placeholder)"
          >
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </template>
      </upload-file>

      <m-block-header title="单文件上传" />
      <upload-file
        v-model="file"
        upload-api="/api/upload/uploadFile"
        :single-mode="true"
        :limit="10"
        tip="单个文件不超过10MB"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
