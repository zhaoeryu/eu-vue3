<script setup lang="ts">
import { computed, reactive, ref, useAttrs, watch, defineProps } from 'vue'
import { REQUEST_HEADER_TOKEN } from '@/utils/constants'
import { getToken } from '@/utils/auth'
import { defaultSetting } from '@/settings'
import {ElMessage, type UploadFile} from 'element-plus'
import { downloadFile } from '@/utils'
import { commonReqHeaders } from '@/utils/request'
import {type UploadResult} from "@/types/api";

interface Props {
  uploadApi: string;
  sizeLimit?: number;
  delEnable?: boolean;
  tip?: string;
  singleMode?: boolean;
  onSuccessCallback?: Function;
}

type EuUploadFile = Omit<UploadFile, 'response'> & {
  response?: UploadResult;
};

const props = withDefaults(defineProps<Props>(), {
  sizeLimit: 10,
  delEnable: true,
  singleMode: false,
})

const attrs = useAttrs()
const model = defineModel<string|null>()
const state = reactive({
  files: [] as EuUploadFile[],
  previewShow: false,
  previewUrl: null as (string | null),
  headers: {
    [REQUEST_HEADER_TOKEN]: getToken(),
    ...commonReqHeaders
  },
})

const action = computed(() => defaultSetting.BASE_API + props.uploadApi)

watch(() => model.value, (val, oldVal) => {
  if (!val) {
    // 如果value为空，则清空文件列表
    state.files.splice(0, state.files.length)
    return
  }

  let urls = val.split(',').filter(item => item && item !== 'null')
  if (props.singleMode) {
    // 单个文件模式下，只保留最后一个文件
    urls = urls.slice(-1)
  }
  urls.forEach(url => {
    const isExists = state.files.some(file => file.response && file.response.link === url)
    if (isExists) {
      return
    }
    state.files.push({
      name: url.substring(url.lastIndexOf('/') + 1, url.length),
      url: url,
      response: {
        link: url
      }
    } as EuUploadFile)
  })
}, {
  immediate: true
})

function successHandle(response: { link: string, msg: string }, file: EuUploadFile, fileList: EuUploadFile[]) {
  const isContinue = props.onSuccessCallback && props.onSuccessCallback(response, file, fileList)
  if (isContinue !== undefined && !isContinue) {
    // 回调返回false，不进行后续处理
    return
  }
  if (!verifySuccessResponse(response, !props.onSuccessCallback)) {
    // 校验失败
    state.files = fileList.filter(item => item.response?.link)
    return
  }

  syncValue(file, fileList)
}
function removeHandle(file: EuUploadFile, fileList: EuUploadFile[]) {
  syncValue(file, fileList, true)
}
function previewHandle() {
  const link = arguments[0].response.link
  const s_1 = link.lastIndexOf('/') + 1
  const s_2 = link.lastIndexOf('.')
  const ext = link.substring(s_2 + 1, link.length)
  const fileName = link.substring(s_1, s_2)
  if (['png', 'jpg', 'jpeg', 'gif'].indexOf(ext.toLowerCase()) === -1) {
    // 非图片类型，下载
    downloadFile(link, fileName + ext)
  } else {
    state.previewShow = true
    state.previewUrl = link;
  }
}
function beforeRemoveHandle() {
  return props.delEnable
}
function errorHandle(e: Error) {
  ElMessage.error(e.message || '上传失败')
}
function beforeUploadHandle(file: EuUploadFile) {
  const isLtM = (file.size as number) / 1024 / 1024 < props.sizeLimit
  if (!isLtM) {
    ElMessage.error('上传文件大小不能超过 ' + props.sizeLimit + 'MB!')
  }
  return isLtM
}
function exceedHandle() {
  ElMessage({
    type: 'warning',
    message: `最多上传${attrs.limit}个文件`
  })
}

function verifySuccessResponse(response: { link: string, msg: string }, isTip: boolean) {
  if (response && response.link) {
    return true
  }
  if (isTip) {
    ElMessage.error(response.msg || '上传失败')
  }
  return false
}
function syncValue(file: EuUploadFile, fileList: EuUploadFile[], isRemove = false) {
  if (file.status !== 'success') {
    // 非成功状态不进行处理
    return
  }

  if (props.singleMode) {
    // 单个文件模式下，文件列表只会保存最后一次上传成功的文件，重复上传会进行覆盖
    state.files = isRemove ? fileList : [file]
  } else {
    state.files = fileList
  }
  // 从文件列表中获取文件地址，拼接成字符串(多个文件，分隔)，同步给v-model绑定的值
  const urls = state.files.filter(item => item.response && item.response.link)
    .map(item => item.response?.link)
    .join(',')
  model.value = urls
}

</script>
<script lang="ts">

export default {
  name: 'UploadFile'
}
</script>

<template>
  <el-upload
    v-bind="$attrs"
    :class="{
      single: singleMode
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
      <el-button v-if="!$slots.trigger" type="primary">点击上传</el-button>
      <slot v-else name="trigger"></slot>
    </template>
    <template #tip>
      <!-- 提示说明文字 -->
      <div v-if="tip && !$slots.tip" class="el-upload__tip">{{ tip }}</div>
      <slot v-else name="tip"></slot>
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
    background-color: var(--theme-nav-second-bg, #fbfdff);
    border: 1px dashed var(--color-border-2, #c0ccda);
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
      color: var(--theme-text-primary-color, #8c939d);
    }
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: inherit;
    }
  }
}
</style>
