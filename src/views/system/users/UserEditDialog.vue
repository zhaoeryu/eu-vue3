<script setup lang="ts">
import { page as postListApi } from '@/api/system/post'
import { page as roleListApi } from '@/api/system/role'
import { add, update } from '@/api/system/user'
import {computed, nextTick, ref, useTemplateRef} from "vue";
import {ElMessage, type FormInstance} from "element-plus";
import useVisible from "@/hooks/visible";
import useLoading from "@/hooks/loading";
import {useResettableReactive} from "@/hooks/resettable";
import type {User} from "@/types/system/user";
import type {Dept, DeptTree} from "@/types/system/dept";
import type {ANY_OBJECT} from "@/types/generic";
import type {Role} from "@/types/system/role";
import type {Post} from "@/types/system/post";

const emit = defineEmits(['complete'])

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
const DEFAULT_FORM = {
  id: null,
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
  _deptIds: [],
}

type State = {
  postList: Post[];
  roleList: Role[];
  deptTree: DeptTree[];
} & Partial<ANY_OBJECT>

const refForm = useTemplateRef<FormInstance>('refForm')
const { visible, setVisible } = useVisible(false)
const { loading: formLoading, setLoading: setFormLoading } = useLoading(false)
const [ state, reset ] = useResettableReactive<State>({
  form: {
    ...DEFAULT_FORM
  },

  deptTree: [],
  postList: [],
  roleList: [],
})

const title = computed(() => state.form.id ? '编辑用户' : '新增用户')

function open(row: User, _deptTree: DeptTree[]) {
  reset()
  state.form = Object.assign({...DEFAULT_FORM}, row)
  state.deptTree = _deptTree
  setVisible(true)

  loadPostList()
  loadRoleList()
}

function onSubmit() {
  refForm.value?.validate(valid => {
    if (!valid) {
      return
    }

    if (state.form._deptIds && state.form._deptIds.length) {
      state.form.deptId = state.form._deptIds[state.form._deptIds.length - 1]
    } else {
      state.form.deptId = null
    }

    setFormLoading(true)
    const reqPromise = state.form.id ? update(state.form) : add(state.form)
    reqPromise.then(res => {
      ElMessage.success(state.form.id ? '修改成功' : `新增成功，默认密码为：${res.data}`)
      setVisible(false)
      emit('complete')
    }).finally(() => {
      setFormLoading(false)
    })
  })
}
function loadPostList() {
  postListApi({ page: 1, size: 999 }).then(res => {
    state.postList = res.data.records
  })
}
function loadRoleList() {
  roleListApi({ page: 1, size: 999 }).then(res => {
    state.roleList = res.data.records
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
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户昵称" prop="nickname">
            <el-input v-model="state.form.nickname" placeholder="请输入用户昵称" maxlength="10" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="登录名" prop="username">
            <el-input v-model="state.form.username" placeholder="请输入登录名" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="state.form.mobile" placeholder="请输入手机号码" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户性别" prop="sex">
            <el-radio-group v-model="state.form.sex">
              <el-radio :value="1">男</el-radio>
              <el-radio :value="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="state.form.email" placeholder="请输入邮箱" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门" prop="deptId">
            <el-cascader
              v-model="state.form._deptIds"
              :options="state.deptTree"
              :props="{ checkStrictly: true, value: 'id', label: 'deptName', children: 'children' }"
              placeholder="请选择部门"
              clearable
              filterable
              style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位" prop="postIds">
            <el-select v-model="state.form.postIds" multiple placeholder="请选择岗位" clearable filterable style="width: 100%;">
              <el-option v-for="item in state.postList" :key="item.id" :label="item.postName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色" prop="roleIds">
            <el-select v-model="state.form.roleIds" multiple placeholder="请选择角色" clearable filterable style="width: 100%;">
              <el-option v-for="item in state.roleList" :key="item.id" :label="item.roleName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="state.form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="onReset">重 置</el-button>
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
