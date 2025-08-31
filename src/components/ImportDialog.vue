<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, withDefaults } from 'vue';

import { useResettableReactive } from '@/hooks/resettable';
import useVisible from '@/hooks/visible';
import { download } from '@/utils/request';

export interface Props {
  uploadUrl: string;
  tplExportUrl: string;
  sizeLimit?: number;
  reqData?: object;
}

const DEFAULT_UPLOAD_RESULT = {
  updateCount: 0,
  addCount: 0,
};

const props = withDefaults(defineProps<Props>(), {
  sizeLimit: 20,
  reqData: () => ({}),
});

const emit = defineEmits(['complete']);

const { visible, setVisible } = useVisible(false);
const [state, reset] = useResettableReactive({
  stepActive: 0,
  importMode: 0,
  file: '',
  uploadResult: {
    ...DEFAULT_UPLOAD_RESULT,
  },
  uploadResponse: {},
});

const uploadData = computed(() => {
  return {
    importMode: state.importMode,
    ...(props.reqData || {}),
  };
});

function open() {
  reset();
  setVisible(true);
}

function onExportTemplate() {
  download(props.tplExportUrl, {}, `模版_${new Date().getTime()}.xlsx`);
}
function onSuccessCallback(response: any) {
  state.uploadResponse = response;
  if (response.code !== 200) {
    ElMessage.error(response.msg);
  } else {
    state.stepActive++;
    state.uploadResult = response.data;
    emit('complete');
  }
}
function onComplete() {
  setVisible(false);
}

defineExpose({
  open,
});
</script>

<script lang="ts">
export default {
  name: 'ImportDialog',
};
</script>

<template>
  <el-dialog
    v-model="visible"
    title="导入Excel数据"
    width="600px"
    class="dialog-footer-flex"
    append-to-body
  >
    <el-steps
      :active="state.stepActive"
      :align-center="true"
      finish-status="success"
    >
      <el-step title="上传Excel"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="state.stepActive === 0">
      <div style="padding: 10px 40px">
        <div class="import-mode">
          <span>导入模式：</span>
          <el-radio-group v-model="state.importMode">
            <el-radio :value="0">仅新增数据</el-radio>
            <el-radio :value="1">仅更新数据</el-radio>
            <el-radio :value="2">新增和更新数据</el-radio>
          </el-radio-group>
        </div>
        <ul class="import-tip">
          <li>
            <span>为保证数据导入顺利，推荐您使用</span>
            <span
              style="cursor: pointer; color: var(--color-primary)"
              @click="onExportTemplate"
            >标准模板</span>
          </li>
          <li>支持 {{ sizeLimit }}MB 以内的xls、xlsx格式文件</li>
          <slot name="importTip" />
        </ul>
      </div>
      <upload-file
        v-model="state.file"
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
          <el-icon
            size="67"
            color="var(--el-text-color-placeholder)"
          >
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </template>
      </upload-file>
    </div>
    <div v-if="state.stepActive === 1">
      <slot
        name="stepFinish"
        :response="state.uploadResponse"
      />
      <el-result
        v-if="!$slots.stepFinish"
        icon="success"
      >
        <template #sub-title>
          <p>
            <span>导入完成,更新</span>
            <span
              class="text-success"
              style="padding: 0 0.5em"
            >{{ state.uploadResult.updateCount }}</span>
            <span>条数据，新增</span>
            <span
              class="text-success"
              style="padding: 0 0.5em"
            >{{ state.uploadResult.addCount }}</span>
            <span>条数据</span>
          </p>
        </template>
      </el-result>
    </div>
    <template
      v-if="state.stepActive > 0"
      #footer
    >
      <el-button @click="state.stepActive = 0">上一步</el-button>
      <div style="flex: 1">
        <el-button
          class="eu-submit-btn"
          type="primary"
          @click="onComplete"
        >完成</el-button>
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
        background: linear-gradient(to left, var(--color-primary), #ebeff7);
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
      content: '';
      width: 150px;
      height: 1px;
      background: #ebeff7;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate3d(-50%, -50%, 0);
    }

    .el-step__line-inner {
      display: none;
    }
  }
}
</style>
