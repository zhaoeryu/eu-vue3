<script setup lang="ts">
import { computed, reactive, ref, useAttrs, watch } from 'vue'
import { REQUEST_HEADER_TOKEN } from '@/utils/constants'
import { getToken } from '@/utils/auth'
import { defaultSetting } from '@/settings'
import { ElMessage } from 'element-plus'
import { downloadFile } from '@/utils'
import { commonReqHeaders } from '@/utils/request'

const props = defineProps({
  /**
   * 上传接口
   */
  uploadApi: {
    type: String,
    required: true
  },
  /**
   * 文件地址，多个文件使用，分隔
   */
  modelValue: {
    type: String,
    default: ''
  },
  /**
   * 文件大小限制：单位MB
   */
  sizeLimit: {
    type: Number,
    required: false,
    default: 10
  },
  /**
   * 是否禁用删除: 默认不禁用
   */
  delEnable: {
    type: Boolean,
    required: false,
    default: true
  },
  /**
   * 提示说明的内容
   */
  tip: {
    type: String,
    required: false
  },
  /**
   * 是否单个文件模式
   * 单个文件模式下，文件列表只会保存最后一次上传成功的文件，重复上传会进行覆盖
   */
  singleMode: {
    type: Boolean,
    required: false,
    default: false
  },
  /**
   * 上传成功的回调
   */
  onSuccessCallback: {
    type: Function,
    required: false
  }
})

const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()

const headers = reactive({
  [REQUEST_HEADER_TOKEN]: getToken(),
  ...commonReqHeaders
})

const files = ref([])
const previewShow = ref(false)
const previewUrl = ref(null)

const action = computed(() => defaultSetting.BASE_API + props.uploadApi)

watch(() => props.modelValue, (val, oldVal) => {
  if (!val) {
    // 如果value为空，则清空文件列表
    files.value.splice(0, files.value.length)
    return
  }

  let urls = val.split(',').filter(item => item && item !== 'null')
  if (props.singleMode) {
    // 单个文件模式下，只保留最后一个文件
    urls = urls.slice(-1)
  }
  urls.forEach(url => {
    const isExists = files.value.some(file => file.response && file.response.link === url)
    if (isExists) {
      return
    }
    files.value.push({
      name: url.substring(url.lastIndexOf('/') + 1, url.length),
      url: url,
      response: {
        link: url
      }
    })
  })
}, {
  immediate: true
})

function successHandle(response, file, fileList) {
  const isContinue = props.onSuccessCallback && props.onSuccessCallback(response, file, fileList)
  if (isContinue !== undefined && !isContinue) {
    // 回调返回false，不进行后续处理
    return
  }
  if (!verifySuccessResponse(response, !props.onSuccessCallback)) {
    // 校验失败
    files.value = fileList.filter(item => item.response.link)
    return
  }

  syncValue(file, fileList)
}
function removeHandle(file, fileList) {
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
    previewShow.value = true
    previewUrl.value = link;
  }
}
function beforeRemoveHandle() {
  return props.delEnable
}
function errorHandle(e) {
  ElMessage.error(e.message && e.message.message || e.message || '上传失败')
}
function beforeUploadHandle(file) {
  const isLtM = file.size / 1024 / 1024 < props.sizeLimit
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

function verifySuccessResponse(response, isTip) {
  if (response && response.link) {
    return true
  }
  if (isTip) {
    ElMessage.error(response.msg || '上传失败')
  }
  return false
}
function syncValue(file, fileList, isRemove = false) {
  if (file.status !== 'success') {
    // 非成功状态不进行处理
    return
  }

  if (props.singleMode) {
    // 单个文件模式下，文件列表只会保存最后一次上传成功的文件，重复上传会进行覆盖
    files.value = isRemove ? fileList : [file]
  } else {
    files.value = fileList
  }
  // 从文件列表中获取文件地址，拼接成字符串(多个文件，分隔)，同步给v-model绑定的值
  const urls = files.value.filter(item => item.response && item.response.link)
    .map(item => item.response.link)
    .join(',')
  emit('update:modelValue', urls)
}

</script>

<template>
  <el-upload
    v-bind="$attrs"
    :class="{
      single: singleMode
    }"

    :action="action"
    :headers="headers"
    :file-list="files"

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
        v-if="previewShow"
        :url-list="[previewUrl]"
        @close="previewShow = false"
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
