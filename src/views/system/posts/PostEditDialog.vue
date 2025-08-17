<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { computed, nextTick, useTemplateRef } from 'vue';

import { add, update } from '@/api/system/post';
import useVisible from '@/hooks/visible';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { Post } from '@/types/system/post';
import { EnableFlagEnums } from '@/utils/enums';

const emit = defineEmits(['complete']);

const rules = {
  postName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择岗位状态', trigger: 'blur' }],
};
const DEFAULT_FORM = {
  id: null,
  postName: null,
  code: null,
  status: null,
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
  return state.form.id ? '修改岗位' : '新增岗位';
});

function open(row: Post) {
  reset();
  if (!row.id) {
    row.status = EnableFlagEnums.ENABLE.value;
  }
  state.form = Object.assign({ ...DEFAULT_FORM }, row);
  setVisible(true);
}

function onSubmit() {
  refForm.value?.validate((valid) => {
    if (!valid) {
      return;
    }

    setFormLoading(true);
    const reqPromise = state.form.id ? update(state.form) : add(state.form);
    reqPromise
      .then(() => {
        ElMessage.success(state.form.id ? '修改成功' : '新增成功');
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
  <el-dialog v-model="visible" :title="title" :close-on-click-modal="false" width="500px" @open="onDialogOpen">
    <el-form ref="refForm" :model="state.form" :rules="rules" label-width="80px">
      <el-form-item label="岗位名称" prop="postName">
        <el-input v-model="state.form.postName" placeholder="请输入岗位名称" maxlength="20" />
      </el-form-item>
      <el-form-item label="岗位编码" prop="code">
        <el-input v-model="state.form.code" placeholder="请输入岗位编码" maxlength="20" />
      </el-form-item>
      <el-form-item label="岗位状态" prop="status">
        <enum-radio-group v-model="state.form.status" :enums="EnableFlagEnums" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onReset">重 置</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
