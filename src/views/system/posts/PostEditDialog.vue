<script setup lang="ts">
import { add, update } from '@/api/system/post'
import {ElMessage} from "element-plus";
import {computed, nextTick, ref} from "vue";

const DEFAULT_FORM = {
  postName: null,
  code: null,
  status: null
}

const emit = defineEmits(['complete'])

const show = ref(false)
const formLoading = ref(false)
const form = ref(DEFAULT_FORM)
const rules = {
  postName: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入岗位编码', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择岗位状态', trigger: 'blur' }
  ]
}
const refForm = ref(null)
const title = computed(() => {
  return form.value.id ? '修改岗位' : '新增岗位'
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
    width="500px"
    @open="onDialogOpen"
  >
    <el-form ref="refForm" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="岗位名称" prop="postName">
        <el-input v-model="form.postName" placeholder="请输入岗位名称" maxlength="20" />
      </el-form-item>
      <el-form-item label="岗位编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入岗位编码" maxlength="20" />
      </el-form-item>
      <el-form-item label="岗位状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">停用</el-radio>
        </el-radio-group>
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
