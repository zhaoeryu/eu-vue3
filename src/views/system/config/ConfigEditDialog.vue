<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { computed, nextTick, useTemplateRef } from 'vue';

import { add, update } from '@/api/system/config';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import useVisible from '@/hooks/visible';
import type { SysConfig } from '@/types/system/config';

const emit = defineEmits(['complete']);

const rules = {
  configName: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
  configKey: [{ required: true, message: '请输入参数键名', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入参数键值', trigger: 'blur' }],
};
const DEFAULT_FORM = {
  configId: null,
  configName: null,
  configKey: null,
  configValue: null,
  configType: 'N',
  remark: null,
};

const refForm = useTemplateRef<FormInstance>('refForm');
const { visible, setVisible } = useVisible(false);
const { loading: formLoading, setLoading: setFormLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  form: {
    ...DEFAULT_FORM,
  },
});

const title = computed(() => {
  return state.form.configId ? '修改参数配置' : '新增参数配置';
});

function open(row: SysConfig) {
  reset();
  state.form = Object.assign({ ...DEFAULT_FORM }, row);
  setVisible(true);
}

function onSubmit() {
  refForm.value?.validate((valid) => {
    if (!valid) {
      return;
    }

    setFormLoading(true);
    const reqPromise = state.form.configId ? update(state.form) : add(state.form);
    reqPromise
      .then(() => {
        ElMessage.success(state.form.configId ? '修改成功' : '新增成功');
        setVisible(false);
        emit('complete');
      })
      .finally(() => {
        setFormLoading(false);
      });
  });
}

function onReset() {
  if (refForm.value) {
    refForm.value.resetFields();
  }
}

async function onDialogOpen() {
  await nextTick(() => {
    if (refForm.value) {
      refForm.value.clearValidate();
    }
  });
}

defineExpose({
  open,
});
</script>

<template>
  <el-dialog v-model="visible" :title="title" :close-on-click-modal="false" width="600px" @open="onDialogOpen">
    <el-form ref="refForm" :model="state.form" :rules="rules" label-width="100px">
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model="state.form.configName" placeholder="请输入参数名称" maxlength="100" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model="state.form.configKey" placeholder="请输入参数键名" maxlength="100" />
      </el-form-item>
      <el-form-item label="参数键值" prop="configValue">
        <el-input v-model="state.form.configValue" placeholder="请输入参数键值" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <el-radio-group v-model="state.form.configType">
          <el-radio value="Y">是</el-radio>
          <el-radio value="N">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="state.form.remark" placeholder="请输入备注" type="textarea" :rows="2" maxlength="255" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onReset">重 置</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
