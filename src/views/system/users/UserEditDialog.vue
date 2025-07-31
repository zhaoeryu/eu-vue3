<script setup lang="ts">
import { page as postListApi } from '@/api/system/post'
import { page as roleListApi } from '@/api/system/role'
import { add, update } from '@/api/system/user'
import {computed, nextTick, ref} from "vue";
import {ElMessage} from "element-plus";

const DEFAULT_FORM = {
  nickname: null,
  dept: null,
  username: null,
  mobile: null,
  email: null,
  sex: null,
  status: null,
  deptId: null,
  postIds: null,
  roleIds: null,
  remark: null,
  _deptIds: null,
}

const show = ref(false)
const formLoading = ref(false)
const form = ref(DEFAULT_FORM)
const rules = {
  nickname: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入登录名', trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3456789]\d{9}$/, message: '手机号码格式不正确', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择用户性别', trigger: 'blur' }
  ],
}
const postList = ref([])
const roleList = ref([])
const deptTree = ref([])

const title = computed(() => form.value.id ? '编辑用户' : '新增用户')

const refForm = ref(null)

const emit = defineEmits(['complete'])

function open(row, _deptTree) {
  form.value = Object.assign({...DEFAULT_FORM}, row)
  deptTree.value = _deptTree
  show.value = true

  loadPostList()
  loadRoleList()
}

function onSubmit() {
  refForm.value.validate(valid => {
    if (!valid) {
      return false
    }

    if (form.value._deptIds && form.value._deptIds.length) {
      form.value.deptId = form.value._deptIds[form.value._deptIds.length - 1]
    } else {
      form.value.deptId = null
    }

    formLoading.value = true
    const reqPromise = form.value.id ? update(form.value) : add(form.value)
    reqPromise.then(res => {
      ElMessage.success(form.value.id ? '修改成功' : `新增成功，默认密码为：${res.data}`)
      show.value = false
      emit('complete')
    }).finally(() => {
      formLoading.value = false
    })
  })
}
function loadPostList() {
  postListApi({ page: 1, size: 999 }).then(res => {
    postList.value = res.data.records
  })
}
function loadRoleList() {
  roleListApi({ page: 1, size: 999 }).then(res => {
    roleList.value = res.data.records
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
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入用户昵称" maxlength="10" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="登录名" prop="username">
            <el-input v-model="form.username" placeholder="请输入登录名" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户性别" prop="sex">
            <el-radio-group v-model="form.sex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门" prop="deptId">
            <el-cascader
              v-model="form._deptIds"
              :options="deptTree"
              :props="{ checkStrictly: true, value: 'id', label: 'deptName', children: 'children' }"
              placeholder="请选择部门"
              clearable
              filterable
              style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位" prop="postIds">
            <el-select v-model="form.postIds" multiple placeholder="请选择岗位" clearable filterable style="width: 100%;">
              <el-option v-for="item in postList" :key="item.id" :label="item.postName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色" prop="roleIds">
            <el-select v-model="form.roleIds" multiple placeholder="请选择角色" clearable filterable style="width: 100%;">
              <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
.el-row {
  display: flex;
  flex-wrap: wrap;
}
</style>
