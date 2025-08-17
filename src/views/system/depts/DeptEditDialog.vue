<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';

import { add, update } from '@/api/system/dept';
import useVisible from '@/hooks/visible';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { DeptTree } from '@/types/system/dept';
import { EnableFlagEnums } from '@/utils/enums';

const emit = defineEmits(['complete']);

const rules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择部门状态', trigger: 'change' }],
};
const DEFAULT_FORM = {
  id: null,
  deptName: null,
  status: null,
  sortNum: 999,

  parentId: null as number | null,
  parentIds: null as string | null,
  _parentIds: [],
};

const refForm = useTemplateRef<FormInstance>('refForm');
const { visible, setVisible } = useVisible(false);
const { loading: formLoading, setLoading: setFormLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  form: {
    ...DEFAULT_FORM,
  },
});

const list = ref<DeptTree[]>([]);

const title = computed(() => {
  return state.form.id ? '修改部门' : '新增部门';
});

function open(
  row: DeptTree & {
    _parentIds: string[];
  },
  _list: DeptTree[],
) {
  reset();
  state.form = Object.assign({ ...DEFAULT_FORM }, row);
  list.value = _list;
  setVisible(true);
}

function onSubmit() {
  refForm.value?.validate((valid) => {
    if (!valid) {
      return;
    }

    // 设置直接父级ID
    if (state.form._parentIds.length) {
      state.form.parentId = state.form._parentIds[state.form._parentIds.length - 1];
      state.form.parentIds = '0,' + state.form._parentIds.join(',');
    } else {
      state.form.parentId = 0;
      state.form.parentIds = '0';
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
    <el-form ref="refForm" :model="state.form" :rules="rules" label-width="80px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="上级部门" prop="parentId">
            <el-cascader
              v-model="state.form._parentIds"
              :options="list"
              :props="{
                checkStrictly: true,
                value: 'id',
                label: 'deptName',
                children: 'children',
              }"
              placeholder="请选择上级部门"
              clearable
              filterable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="state.form.deptName" placeholder="请输入部门名称" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门状态" prop="status">
            <enum-radio-group v-model="state.form.status" :enums="EnableFlagEnums" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="排序" prop="sortNum">
            <el-input-number v-model="state.form.sortNum" :min="0" :max="9999" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="setVisible(false)">取 消</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
