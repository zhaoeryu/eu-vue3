<script setup lang="ts">
import {add, update} from '@/api/system/dept'
import {computed, nextTick, ref} from "vue";
import {ElMessage} from "element-plus";

const DEFAULT_FORM = {
  deptName: null,
  status: null,
  sortNum: 999,

  parentId: null,
  parentIds: null,
  _parentIds: []
}

const emit = defineEmits(['complete'])

const show = ref(false)
const list = ref([])
const formLoading = ref(false)
const form = ref(DEFAULT_FORM)
const rules = {
  deptName: [
    {required: true, message: '请输入部门名称', trigger: 'blur'}
  ],
  status: [
    {required: true, message: '请选择部门状态', trigger: 'change'}
  ]
}
const refForm = ref(null)

const title = computed(() => {
  return form.value.id ? '修改部门' : '新增部门'
})

function open(row, _list) {
  form.value = Object.assign({...DEFAULT_FORM}, row)
  list.value = _list
  show.value = true
}

function onSubmit() {
  refForm.value.validate(valid => {
    if (!valid) {
      return false
    }

    // 设置直接父级ID
    if (form.value._parentIds.length) {
      form.value.parentId = form.value._parentIds[form.value._parentIds.length - 1]
      form.value.parentIds = '0,' + form.value._parentIds.join(',')
    } else {
      form.value.parentId = 0
      form.value.parentIds = '0'
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
    width="600px"
    @open="onDialogOpen"
  >
    <el-form ref="refForm" :model="form" :rules="rules" label-width="80px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item label="上级部门" prop="parentId">
            <el-cascader
              v-model="form._parentIds"
              :options="list"
              :props="{ checkStrictly: true, value: 'id', label: 'deptName', children: 'children' }"
              placeholder="请选择上级部门"
              clearable
              filterable
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="form.deptName" placeholder="请输入部门名称" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0">正常</el-radio>
              <el-radio :label="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="排序" prop="sortNum">
            <el-input-number v-model="form.sortNum" :min="0" :max="9999" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="show = false">取 消</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
