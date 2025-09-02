<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { UploadFile, UploadFiles } from 'element-plus';
import { computed, reactive, useAttrs, watch } from 'vue';

import { defaultSetting } from '@/settings';
import type { UploadResult } from '@/types/api';
import { downloadFile } from '@/utils';
import { getToken } from '@/utils/auth';
import { REQUEST_HEADER_TOKEN } from '@/utils/constants';
import { commonReqHeaders } from '@/utils/request';

export interface Props {
  uploadApi: string;
  sizeLimit?: number;
  delEnable?: boolean;
  tip?: string | null;
  singleMode?: boolean;
  onSuccessCallback?: ((response: UploadResult, uploadFile: UploadFile, uploadFiles: UploadFiles) => void) | null;
}

type EuUploadFile = Omit<UploadFile, 'response'> & {
  response?: UploadResult;
};

const props = withDefaults(defineProps<Props>(), {
  tip: null,
  sizeLimit: 10,
  delEnable: true,
  singleMode: false,
  onSuccessCallback: null,
});

const attrs = useAttrs();
const model = defineModel<string | null>();
const state = reactive({
  files: [] as EuUploadFile[],
  previewShow: false,
  previewUrl: null as string | null,
  headers: {
    [REQUEST_HEADER_TOKEN]: getToken(),
    ...commonReqHeaders,
  },
});

const action = computed(() => defaultSetting.BASE_API + props.uploadApi);

watch(
  () => model.value,
  (val, _oldVal) => {
    if (!val) {
      // 如果value为空，则清空文件列表
      state.files.splice(0, state.files.length);
      return;
    }

    let urls = val.split(',').filter((item) => item && item !== 'null');
    if (props.singleMode) {
      // 单个文件模式下，只保留最后一个文件
      urls = urls.slice(-1);
    }
    urls.forEach((url) => {
      const isExists = state.files.some((file) => file.response && file.response.link === url);
      if (isExists) {
        return;
      }
      state.files.push({
        name: url.substring(url.lastIndexOf('/') + 1, url.length),
        url: url,
        response: {
          link: url,
        },
      } as EuUploadFile);
    });
  },
  {
    immediate: true,
  },
);

function successHandle(response: UploadResult, file: EuUploadFile, fileList: EuUploadFile[]) {
  const isContinue = props.onSuccessCallback?.(response, file, fileList);
  if (isContinue !== undefined && !isContinue) {
    // 回调返回false，不进行后续处理
    return;
  }
  if (!verifySuccessResponse(response)) {
    // 校验失败
    state.files = fileList.filter((item) => item.response?.link);
    return;
  }

  syncValue(file, fileList);
}
function removeHandle(file: EuUploadFile, fileList: EuUploadFile[]) {
  syncValue(file, fileList, true);
}
function previewHandle(file: EuUploadFile) {
  const link = file.response?.link ?? '';
  const s_1 = link.lastIndexOf('/') + 1;
  const s_2 = link.lastIndexOf('.');
  const ext = link.substring(s_2 + 1, link.length);
  const fileName = link.substring(s_1, s_2);
  if (!['png', 'jpg', 'jpeg', 'gif'].includes(ext.toLowerCase())) {
    // 非图片类型，下载
    downloadFile(link, fileName + ext);
  } else {
    state.previewShow = true;
    state.previewUrl = link;
  }
}
function beforeRemoveHandle() {
  return props.delEnable;
}
function errorHandle(e: Error) {
  ElMessage.error(e.message || '上传失败');
}
function beforeUploadHandle(file: EuUploadFile) {
  const isLtM = (file.size!) / 1024 / 1024 < props.sizeLimit;
  if (!isLtM) {
    ElMessage.error('上传文件大小不能超过 ' + props.sizeLimit + 'MB!');
  }
  return isLtM;
}
function exceedHandle() {
  ElMessage({
    type: 'warning',
    message: `最多上传${attrs.limit as number}个文件`,
  });
}

function verifySuccessResponse(response: UploadResult) {
  return !!response.link;
}
function syncValue(file: EuUploadFile, fileList: EuUploadFile[], isRemove = false) {
  if (file.status !== 'success') {
    // 非成功状态不进行处理
    return;
  }

  if (props.singleMode) {
    // 单个文件模式下，文件列表只会保存最后一次上传成功的文件，重复上传会进行覆盖
    state.files = isRemove ? fileList : [file];
  } else {
    state.files = fileList;
  }
  // 从文件列表中获取文件地址，拼接成字符串(多个文件，分隔)，同步给v-model绑定的值
  model.value = state.files
    .filter((item) => item.response?.link)
    .map((item) => item.response?.link)
    .join(',');
}
</script>
<script lang="ts">
export default {
  name: 'UploadFile',
};
</script>

<template>
  <el-upload
    v-bind="$attrs"
    :class="{
      single: singleMode,
    }"
    :action="action"
    :headers="state.headers"
    :file-list="state.files"
    :on-success="successHandle"
    :on-remove="removeHandle"
    :on-preview="previewHandle"
    :before-remove="beforeRemoveHandle"
    :on-error="errorHandle"
    :before-upload="beforeUploadHandle"
    :on-exceed="exceedHandle"
  >
    <template #trigger>
      <!-- 触发文件选择框的内容 -->
      <el-button
        v-if="!$slots.trigger"
        type="primary"
      >点击上传</el-button>
      <slot
        v-else
        name="trigger"
      />
    </template>
    <template #tip>
      <!-- 提示说明文字 -->
      <div
        v-if="tip && !$slots.tip"
        class="el-upload__tip"
      >{{ tip }}</div>
      <slot
        v-else
        name="tip"
      />
    </template>
    <template #default>
      <!-- 图片预览 -->
      <el-image-viewer
        v-if="state.previewShow"
        :url-list="[state.previewUrl]"
        @close="state.previewShow = false"
      />
    </template>
  </el-upload>
</template>

<style lang="scss" scoped>
// 禁用上传动画
:deep(.el-upload-list__item) {
  transition: none !important;
}

// 图片列表模式下，新增按钮居中
:deep(.el-upload--picture-card) {
  text-align: center;
  width: 80px;
  height: 80px;
  line-height: 86px;
}

// 图片列表模式下，图片大小
:deep(.el-upload-list--picture-card) {
  .el-upload-list__item {
    width: 80px;
    height: 80px;
  }
}

// 头像模式
.single {
  :deep(.el-upload--picture-card) {
    background-color: var(--eu-layout-sidebar-bg, #fbfdff);
    border: 1px dashed var(--eu-color-border-primary, #c0ccda);
    border-radius: 6px;
    box-sizing: border-box;
    width: 80px;
    height: 80px;
    cursor: pointer;
    line-height: 86px;
    vertical-align: top;
    text-align: center;

    &:hover {
      border-color: #155bd4;
      color: #155bd4;
    }

    i {
      font-size: 28px;
      color: var(--eu-color-text-primary, #8c939d);
    }

    .avatar {
      width: 100%;
      height: 100%;
      border-radius: inherit;
    }
  }
}
</style>
