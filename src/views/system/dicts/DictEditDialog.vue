<script setup lang="ts">
import { ElMessage  } from 'element-plus';
import type {FormInstance} from 'element-plus';
import { computed, nextTick, useTemplateRef } from 'vue';

import { add, update } from '@/api/system/dict';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import useVisible from '@/hooks/visible';
import type { Dict } from '@/types/system/dict';
import { EnableFlagEnums } from '@/utils/enums';

const emit = defineEmits(['complete']);

const rules = {
  dictKey: [{ required: true, message: '请输入字典KEY', trigger: 'blur' }],
  status: [{ required: true, message: '请选择字典状态', trigger: 'blur' }],
};
const DEFAULT_FORM = {
  id: null,
  dictKey: null,
  remark: null,
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
  return state.form.id ? '修改字典' : '新增字典';
});

function open(row: Dict) {
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
  <el-dialog v-model="visible" :title="title" width="500px" :close-on-click-modal="false" @open="onDialogOpen">
    <el-form ref="refForm" :model="state.form" :rules="rules" label-width="90px">
      <el-form-item label="字典KEY" prop="dictKey">
        <el-input v-model="state.form.dictKey" placeholder="请输入字典KEY" maxlength="30" />
      </el-form-item>
      <el-form-item label="字典状态" prop="status">
        <enum-radio-group v-model="state.form.status" :enums="EnableFlagEnums" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="state.form.remark" type="textarea" placeholder="请输入备注" maxlength="200" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onReset">重 置</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
