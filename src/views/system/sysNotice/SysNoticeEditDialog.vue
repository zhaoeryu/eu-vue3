<script setup lang="ts">
import { add, update } from '@/api/system/sysNotice'
import { NoticeTypeEnums } from '@/utils/enums'
import {computed, ref, nextTick} from "vue";
import {ElMessage} from "element-plus";

const DEFAULT_FORM = {
  title: null,
  type: null,
  description: null,
  content: null,
  status: null,
}

const emit = defineEmits(['complete'])

const show = ref(false)
const formLoading = ref(false)
const form = ref(DEFAULT_FORM)
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

const refForm = ref(null)

const title = computed(() => {
  return form.value.id ? '修改通知公告' : '新增通知公告'
})

function open(row) {
  form.value = Object.assign({...DEFAULT_FORM}, row)
  show.value = true
}

function onSubmit() {
  refForm.value.validate(valid => {
    if (!valid) {
      return false
    }

    formLoading.value = true
    const reqPromise = form.value.id ? update(form.value) : add(form.value)
    reqPromise.then(() => {
      ElMessage.success(form.value.id ? '修改成功' : '新增成功')
      show.value = false
      emit('complete')
    }).finally(() => {
      formLoading.value = false
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

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    :title="title"
    v-model="show"
    :close-on-click-modal="false"
    width="700px"
    @open="onDialogOpen"
  >
    <el-form ref="refForm" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" clearable />
      </el-form-item>
      <el-form-item label="公告描述" prop="description">
        <el-input v-model="form.description" placeholder="请输入公告描述" clearable />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="公告类型" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio v-for="item in NoticeTypeEnums" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公告状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0">正常</el-radio>
              <el-radio :label="1">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="公告内容" prop="content">
        <eu-editor v-model="form.content" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="show = false">取 消</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
