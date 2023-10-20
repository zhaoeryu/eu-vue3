<script setup lang="ts">
import {computed, ref} from "vue";
import {download} from "@/utils/request";
import {ElMessage} from "element-plus";
import {UploadFilled} from "@element-plus/icons-vue";

const DEFAULT_UPLOAD_RESULT = {
  updateCount: 0,
  addCount: 0
}

const props = defineProps({
  uploadUrl: {
    type: String,
    required: true
  },
  tplExportUrl: {
    type: String,
    required: true
  },
  sizeLimit: {
    type: Number,
    default: 20
  },
  reqData: {
    type: Object,
    required: false
  }
})
const emit = defineEmits(['complete'])

const show = ref(false)
const stepActive = ref(0)
const importMode = ref(0)
const file = ref('')
const uploadResult = ref(DEFAULT_UPLOAD_RESULT)

const uploadData = computed(() => {
  return {
    importMode: importMode.value,
    ...(props.reqData || {})
  }
})

function open() {
  show.value = true
}

function onExportTemplate() {
  download(props.tplExportUrl, {}, `模版_${new Date().getTime()}.xlsx`)
}
function onSuccessCallback(response) {
  if (response.code !== 200) {
    ElMessage.error(response.msg)
  } else {
    stepActive.value++
    uploadResult.value = response.data
    emit('complete')
  }
}
function onComplete() {
  show.value = false
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    title="导入Excel数据"
    v-model="show"
    width="600px"
    class="dialog-footer-flex"
    append-to-body
  >
    <el-steps :active="stepActive" :align-center="true" finish-status="success">
      <el-step title="上传Excel"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive === 0">
      <div style="padding: 10px 40px;">
        <div class="import-mode">
          <span>导入模式：</span>
          <el-radio-group v-model="importMode">
            <el-radio :label="0">仅新增数据</el-radio>
            <el-radio :label="1">仅更新数据</el-radio>
            <el-radio :label="2">新增和更新数据</el-radio>
          </el-radio-group>
        </div>
        <ul class="import-tip">
          <li>
            <span>为保证数据导入顺利，推荐您使用</span>
            <span style="cursor: pointer;color: var(--color-primary);" @click="onExportTemplate">标准模板</span>
          </li>
          <li>支持 {{ sizeLimit }}MB 以内的xls、xlsx格式文件</li>
          <slot name="importTip"></slot>
        </ul>
      </div>
      <upload-file
        v-model="file"
        :upload-api="uploadUrl"
        :single-mode="true"
        :size-limit="sizeLimit"
        :tip="`单个文件不超过${sizeLimit}MB`"
        :data="uploadData"
        :on-success-callback="onSuccessCallback"
        accept=".xls,.xlsx"
        class="import-upload"
        drag
      >
        <template #trigger>
          <el-icon size="67" color="var(--el-text-color-placeholder)"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </template>
      </upload-file>
    </div>
    <div v-if="stepActive === 1">
      <el-result icon="success">
        <template #sub-title>
          <p>
            <span>导入完成,更新</span>
            <span class="text-success" style="padding: 0 0.5em;">{{ uploadResult.updateCount }}</span>
            <span>条数据，新增</span>
            <span class="text-success" style="padding: 0 0.5em;">{{uploadResult.addCount }}</span>
            <span>条数据</span>
          </p>
        </template>
      </el-result>
    </div>
    <template v-if="stepActive > 0" #footer>
      <el-button @click="stepActive = 0">上一步</el-button>
      <div style="flex: 1;">
        <el-button class="eu-submit-btn" type="primary" @click="onComplete">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.el-result {
  padding-top: 80px;
  padding-bottom: 80px;
}
.import-tip {
  list-style-type: square;
  list-style-position: inside;
  padding-top: 20px;
  color: var(--color-text-3);
  line-height: 22px;
}
.import-upload {
  .el-upload {
    width: 100%;
    .el-upload-dragger {
      width: 100%;
    }
  }
}

// 步骤条样式
.el-steps {
  margin-bottom: 24px;
  :deep(.el-step) {
    .el-step__icon {
      width: 20px;
      height: 20px;
      &.is-text {
        color: #fff;
        background-color: var(--color-primary);
        border-radius: 50%;
        border: 1px solid var(--color-primary);
      }
    }
    .el-step__title {
      font-size: 13px;
      &.is-success {
        color: #333;
      }
    }
    .el-step__line {
      background-color: unset;
    }
    .is-success {
      .el-step__line:before {
        background: var(--color-primary);
      }
    }
    .is-process {
      font-weight: unset;
      color: var(--color-primary);
      .el-step__line:before {
        background: -webkit-linear-gradient(left,var(--color-primary),#ebeff7);
        color: transparent;
      }
    }
    .is-wait {
      color: #999;
      .el-step__icon {
        background-color: transparent;
        &.is-text {
          color: #999;
          border-color: #d9d9d9;
        }
      }
    }
    .el-step__line:before {
      content: "";
      width: 150px;
      height: 1px;
      background: #ebeff7;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate3d(-50%,-50%,0);
    }
    .el-step__line-inner {
      display: none;
    }
  }
}
</style>
