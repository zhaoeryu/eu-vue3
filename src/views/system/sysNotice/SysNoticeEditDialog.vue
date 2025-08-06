<script setup lang="ts">
import { add, update } from '@/api/system/sysNotice'
import {EnableFlagEnums, NoticeTypeEnums} from '@/utils/enums'
import {computed, nextTick, useTemplateRef} from "vue";
import {ElMessage, type FormInstance} from "element-plus";
import useVisible from "@/hooks/visible";
import useLoading from "@/hooks/loading";
import {useResettableReactive} from "@/hooks/resettable";
import type {Notice} from "@/types/system/notice";
import EnumRadioGroup from "@/components/EnumRadioGroup.vue";

const DEFAULT_FORM = {
  id: null,
  title: null,
  type: null,
  description: null,
  content: null,
  status: null,
}

const emit = defineEmits(['complete'])

const rules = {
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '公告类型不能为空', trigger: 'change' }
  ],
  description: [
    { required: true, message: '公告描述不能为空', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '公告内容不能为空', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '公告状态不能为空', trigger: 'change' }
  ],
}

const refForm = useTemplateRef<FormInstance>('refForm')
const { visible, setVisible } = useVisible(false)
const { loading: formLoading, setLoading: setFormLoading } = useLoading(false)
const [ state, reset ] = useResettableReactive({
  form: {
    ...DEFAULT_FORM
  }
})

const title = computed(() => {
  return state.form.id ? '修改通知公告' : '新增通知公告'
})

function open(row: Notice) {
  reset()
  state.form = Object.assign({...DEFAULT_FORM}, row)
  setVisible(true)
}

function onSubmit() {
  refForm.value?.validate(valid => {
    if (!valid) {
      return
    }

    setFormLoading(true)
    const reqPromise = state.form.id ? update(state.form) : add(state.form)
    reqPromise.then(() => {
      ElMessage.success(state.form.id ? '修改成功' : '新增成功')
      setVisible(false)
      emit('complete')
    }).finally(() => {
      setFormLoading(false)
    })
  })
}

async function onDialogOpen() {
  await nextTick(() => {
    if (refForm.value) {
      refForm.value.clearValidate();
    }
  });
}

function onReset() {
  if (refForm.value) {
    refForm.value.resetFields();
  }
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    :title="title"
    v-model="visible"
    :close-on-click-modal="false"
    width="700px"
    @open="onDialogOpen"
  >
    <el-form ref="refForm" :model="state.form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="state.form.title" placeholder="请输入标题" clearable />
      </el-form-item>
      <el-form-item label="公告描述" prop="description">
        <el-input v-model="state.form.description" placeholder="请输入公告描述" clearable />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="公告类型" prop="type">
            <enum-radio-group :enums="NoticeTypeEnums" v-model="state.form.type" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公告状态" prop="status">
            <enum-radio-group :enums="EnableFlagEnums" v-model="state.form.status" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="公告内容" prop="content">
        <eu-editor v-model="state.form.content" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onReset">重 置</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
