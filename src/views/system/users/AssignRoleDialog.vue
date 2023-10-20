<script setup lang="ts">
import { assignRole, getUserInfo } from '@/api/system/user'
import { page as roleListApi } from '@/api/system/role'
import {computed, ref} from "vue";
import {ElMessage} from "element-plus";

const emit = defineEmits(['success'])

const show = ref(false)
const loading = ref(false)
const roleIds = ref([])
const roleId = ref('')
const userId = ref(null)
const roleList = ref([])

const assignRoleList = computed(() => {
  return roleIds.value.map(id => {
    const role = roleList.value.find(item => item.id === id)
    if (role) {
      return role
    }
  }).filter(item => item)
})

function open(_userId) {
  userId.value = _userId
  show.value = true
  loading.value = true
  Promise.all([
    roleListApi({ page: 1, size: 999 }),
    getUserInfo(_userId)
  ]).then(res => {
    roleList.value = res[0].data.records || []
    roleIds.value = res[1].data.roleIds || []
  }).finally(() => {
    loading.value = false
  })
}

function onRemoveRole(tag) {
  roleIds.value = roleIds.value.filter(item => item !== tag.id)
}

function onAssignRoleSelectChange(_roleId) {
  roleIds.value.push(_roleId)
  roleId.value = null
}

function onAssignRoleSave() {
  loading.value = true
  assignRole({
    id: userId.value,
    roleIds: roleIds.value
  }).then(() => {
    ElMessage.success('分配角色成功')
    show.value = false
    emit('success')
  }).finally(() => {
    loading.value = false
  })
}
function onDialogClose() {
  roleIds.value = []
  roleId.value = ''
  userId.value = null
  roleList.value = []
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    title="分配角色"
    v-model="show"
    width="700px"
    @close="onDialogClose"
  >
    <div class="assign-role-wrapper">
      <el-tag
        :key="tag.id"
        v-for="tag in assignRoleList"
        closable
        :disable-transitions="false"
        @close="onRemoveRole(tag)">
        {{tag.roleName}}
      </el-tag>
      <el-select v-model="roleId" @change="onAssignRoleSelectChange" placeholder="请选择角色" filterable class="input-new-tag">
        <el-option v-for="item in roleList" :disabled="assignRoleList.some(v => v.id === item.id)" :key="item.id" :label="item.roleName" :value="item.id" />
      </el-select>
    </div>

    <template #footer>
      <el-button @click="show = false">取 消</el-button>
      <el-button :loading="loading" type="primary" @click="onAssignRoleSave">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.assign-role-wrapper {
  .el-tag {
    height: 32px;
    line-height: 32px;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .input-new-tag {
    width: 120px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
