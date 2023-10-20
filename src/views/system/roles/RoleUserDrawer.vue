<script setup lang="ts">
import {computed, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {Delete, Plus, Refresh, Search} from "@element-plus/icons-vue";
import { cancelAuth, roleUserList } from '@/api/system/user'
import { list as deptList } from '@/api/system/dept'
import { getParentFieldsByLeafId, handleTreeData } from '@/utils'
import AddAuthUserDialog from "@/views/system/roles/AddAuthUserDialog.vue";

const DEFAULT_QUERY_PARAMS = {
  nickname: null,
  mobile: null,
  roleId: null,
  hasRole: 1,
  page: 1,
  size: 10
}

const show = ref(false)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const list = ref([])
const total = ref(0)
const loading = ref(false)
const isQueryShow = ref(true)
const multipleDisabled = ref(true)
const deptTree = ref([])
const roleId = ref(null)
const role = ref({})

const refAddAuthUserDialog = ref(null)
const refTable = ref(null)

const title = computed(() => {
  let title = '分配用户'
  if (role.value.roleName) {
    title += ` - ${role.value.roleName}`
  }
  return title
})

function open(_role) {
  role.value = _role
  roleId.value = _role.id
  show.value = true

  onDeptQuery()
  onRefresh()
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

function onRefresh() {
  queryParams.value = {...DEFAULT_QUERY_PARAMS}
  onQuery()
}

function onSelectionChange(selection) {
  multipleDisabled.value = !selection.length
}

function onAdd() {
  refAddAuthUserDialog.value.open(roleId.value)
}

function onBatchDel() {
  const ids = refTable.value.getSelectionRows().map(item => item.id)
  ElMessageBox.confirm(`确认要删除选中的${ids.length}条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        cancelAuth(ids, roleId.value).then(() => {
          ElMessage.success('删除成功')
          done()
          onRefresh()
        }).finally(() => {
          instance.confirmButtonLoading = false;
        })
      } else {
        done()
      }
    }
  });
}

function onSelectable(row) {
  return row.username !== 'admin'
}

function onDeptQuery() {
  deptList().then(res => {
    deptTree.value = handleTreeData(res.data || [])
  })
}

function convertToDeptName(deptId) {
  return getParentFieldsByLeafId(deptTree.value, deptId, { fieldKey: 'deptName' }).join('/')
}

function onCancelAuth(row) {
  ElMessageBox.confirm(`确认要取消授权用户 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        cancelAuth({
          roleId: roleId.value,
          userIds: [row.id]
        }).then(() => {
          ElMessage.success('取消授权成功')
          done()
          onRefresh()
        }).finally(() => {
          instance.confirmButtonLoading = false;
        })
      } else {
        done()
      }
    }
  });
}

defineExpose({
  open
})
</script>

<template>
  <el-drawer
      :title="title"
      v-model="show"
      size="900px"
      direction="rtl"
  >
    <div class="page-container">
      <query-expand-wrapper :show="isQueryShow">
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
      </query-expand-wrapper>

      <div v-loading="loading">
        <eu-table-toolbar
          :opt-show="{
            add: false,
            del: false,
            export: false,
            import: false,
            sort: false
          }"
          :ref-table="refTable"
          @refresh="onRefresh"
          v-model:searchToggle="isQueryShow"
        >
          <template #left>
            <template v-permissions="['system:user:assignRole']">
              <el-button type="primary" :icon="Plus" plain @click="onAdd">添加授权用户</el-button>
              <el-button :disabled="multipleDisabled" type="danger" :icon="Delete" plain @click="onBatchDel">批量取消授权</el-button>
            </template>
          </template>
        </eu-table-toolbar>
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
          <el-table-column v-permissions="['system:user:assignRole']" label="操作" fixed="right" width="150">
            <template v-slot:default="{ row }">
              <el-button text type="primary" size="small" @click="onCancelAuth(row)">取消授权</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-model:page="queryParams.page"
          v-model:limit="queryParams.size"
          :total="total"
          @pagination="onQuery"
        />
      </div>

      <add-auth-user-dialog ref="refAddAuthUserDialog" @complete="onRefresh" />
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">

</style>
