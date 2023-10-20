<script setup lang="ts">
import {ref} from "vue";
import { list as deptList } from '@/api/system/dept'
import { getParentFieldsByLeafId, handleTreeData } from '@/utils'
import { batchAssignRole, roleUserList } from '@/api/system/user'
import {ElMessage, ElMessageBox} from "element-plus";
import {Plus, Refresh, Search} from "@element-plus/icons-vue";

const DEFAULT_QUERY_PARAMS = {
  roleId: null,
  hasRole: 0,
  page: 1,
  size: 10
}

const show = ref(false)
const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const multipleDisabled = ref(true)
const deptTree = ref([])
const roleId = ref(null)

const refTable = ref(null)

function open(_roleId) {
  roleId.value = _roleId
  show.value = true
  onDeptQuery()
  onRefresh()
}

function onDialogClose() {
  queryParams.value = {...DEFAULT_QUERY_PARAMS}
}

function onSelectionChange(selection) {
  multipleDisabled.value = !selection.length
}

function onSelectable(row) {
  return !!row.id
}

function onDeptQuery() {
  deptList().then(res => {
    deptTree.value = handleTreeData(res.data || [])
  })
}

function onRefresh() {
  queryParams.value = {...DEFAULT_QUERY_PARAMS}
  onQuery()
}

function onQuery() {
  loading.value = true
  queryParams.value.roleId = roleId.value
  roleUserList(queryParams.value).then(res => {
    list.value = res.data.records
    total.value = res.data.total
  }).finally(() => {
    loading.value = false
  })
}

function convertToDeptName(deptId) {
  return getParentFieldsByLeafId(deptTree.value, deptId, { fieldKey: 'deptName' }).join('/')
}

function onBatchAuth() {
  const ids = refTable.value.getSelectionRows().map(item => item.id)
  ElMessageBox.confirm(`确定要给这 ${ids.length} 个用户分配角色吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        batchAssignRole({
          roleId: roleId.value,
          userIds: ids
        }).then(() => {
          ElMessage.success('授权成功')
          done()
          onRefresh()
        }).finally(() => {
          instance.confirmButtonLoading = false;
        })
      } else {
        done()
      }
    }
  })
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    title="授权用户"
    v-model="show"
    width="1000px"
    @close="onDialogClose"
    append-to-body
  >
    <div>
      <div class="page-body query-wrapper">
        <el-form :model="queryParams" :inline="true">
          <el-form-item label="用户名称">
            <el-input v-model="queryParams.nickname" placeholder="输入要查找的用户名称" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="queryParams.mobile" placeholder="输入要查找的手机号" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
            <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
          </el-form-item>
        </el-form>
        <div v-permissions="['system:user:assignRole']">
          <el-button :disabled="multipleDisabled" type="primary" :icon="Plus" plain @click="onBatchAuth">批量授权</el-button>
        </div>
      </div>
      <el-table
          ref="refTable"
          :data="list"
          @selection-change="onSelectionChange"
          style="width: 100%"
      >
        <el-table-column type="selection" :selectable="onSelectable"></el-table-column>
        <el-table-column prop="username" label="登录名" width="100"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" width="100"></el-table-column>
        <el-table-column prop="deptId" label="部门">
          <template #default="{ row }">
            <span>{{ convertToDeptName(row.deptId) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号码"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template v-slot:default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastActiveTime" label="最后活跃时间"></el-table-column>
      </el-table>
      <pagination
        v-model:page="queryParams.page"
        v-model:limit="queryParams.size"
        :total="total"
        @pagination="onQuery"
      />
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
