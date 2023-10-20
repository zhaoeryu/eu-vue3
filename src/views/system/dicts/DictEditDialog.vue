<script setup lang="ts">
import { add, update } from '@/api/system/dict'
import {ElMessage} from "element-plus";
import {computed, nextTick, ref} from "vue";

const DEFAULT_FORM = {
  dictKey: null,
  remark: null,
  status: null
}

const emit = defineEmits(['complete'])
const show = ref(false)
const formLoading = ref(false)
const form = ref(DEFAULT_FORM)
const rules = {
  dictKey: [
    { required: true, message: '请输入字典KEY', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择字典状态', trigger: 'blur' }
  ]
}
const refForm = ref(null)
const title = computed(() => {
  return form.value.id ? '修改字典' : '新增字典'
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
    width="500px"
    :close-on-click-modal="false"
    @open="onDialogOpen"
  >
    <el-form ref="refForm" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="字典KEY" prop="dictKey">
        <el-input v-model="form.dictKey" placeholder="请输入字典KEY" maxlength="30" />
      </el-form-item>
      <el-form-item label="字典状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="0">正常</el-radio>
          <el-radio :label="1">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" maxlength="200" />
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
