<script setup lang="ts">
import {computed, ref, useTemplateRef} from "vue";
import {ElMessage, ElMessageBox, type TableInstance} from "element-plus";
import {Delete, Plus, Refresh, Search} from "@element-plus/icons-vue";
import { cancelAuth, roleUserList } from '@/api/system/user'
import { list as deptList } from '@/api/system/dept'
import { getParentFieldsByLeafId, handleTreeData } from '@/utils'
import AddAuthUserDialog from "@/views/system/roles/AddAuthUserDialog.vue";
import useVisible from "@/hooks/visible";
import useLoading from "@/hooks/loading";
import {useResettableReactive} from "@/hooks/resettable";
import type {Role} from "@/types/system/role";
import type {DeptTree} from "@/types/system/dept";
import EnumTag from "@/components/EnumTag.vue";
import {EnableFlagEnums} from "@/utils/enums";
import type {User} from "@/types/system/user";

const refTable = useTemplateRef<TableInstance>('refTable')
const refAddAuthUserDialog = useTemplateRef<InstanceType<typeof AddAuthUserDialog>>('refAddAuthUserDialog')
const { visible, setVisible } = useVisible(false)
const { loading, setLoading } = useLoading(false)
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    nickname: null,
    mobile: null,
    roleId: null as number | null,
    hasRole: 1,

    page: 1,
    size: 10,
    sort: []
  },

  deptTree: [] as DeptTree[],
  roleId: null as number | null,
  role: {} as Role,
})

const title = computed(() => {
  let title = '分配用户'
  if (state.role.roleName) {
    title += ` - ${state.role.roleName}`
  }
  return title
})

function open(_role: Role) {
  reset()
  state.role = _role
  state.roleId = _role.id
  setVisible(true)

  onDeptQuery()
  onRefresh()
}

function onQuery() {
  loading.value = true
  state.queryParams.roleId = state.roleId
  roleUserList(state.queryParams).then(res => {
    state.list = res.data.records
    state.total = res.data.total
  }).finally(() => {
    loading.value = false
  })
}

function onRefresh() {
  reset('queryParams')
  onQuery()
}

function onSelectionChange(selection: User[]) {
  state.multipleDisabled = !selection.length
}

function onAdd() {
  refAddAuthUserDialog.value?.open(state.roleId!)
}

function onBatchDel() {
  const ids = refTable.value?.getSelectionRows().map(item => item.id) || []
  ElMessageBox.confirm(`确认要删除选中的${ids.length}条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        cancelAuth({
          roleId: state.roleId,
          userIds: ids
        }).then(() => {
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

function onSelectable(row: User) {
  return row.admin !== 1
}

function onDeptQuery() {
  deptList().then(res => {
    state.deptTree = handleTreeData(res.data || []) as DeptTree[]
  })
}

function convertToDeptName(deptId: number) {
  return getParentFieldsByLeafId(state.deptTree, deptId, { fieldKey: 'deptName' }).join('/')
}

function onCancelAuth(row: User) {
  ElMessageBox.confirm(`确认要取消授权用户 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        cancelAuth({
          roleId: state.roleId,
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
    v-model="visible"
    size="900px"
    direction="rtl"
  >
    <div class="page-container">
      <query-expand-wrapper :show="state.isQueryShow">
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item label="用户名称">
            <el-input v-model="state.queryParams.nickname" placeholder="输入要查找的用户名称" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="state.queryParams.mobile" placeholder="输入要查找的手机号" clearable />
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
          v-model:searchToggle="state.isQueryShow"
        >
          <template #left>
            <el-button v-permissions="['system:user:assignRole']" type="primary" :icon="Plus" plain @click="onAdd">添加授权用户</el-button>
            <el-button v-permissions="['system:user:assignRole']" :disabled="state.multipleDisabled" type="danger" :icon="Delete" plain @click="onBatchDel">批量取消授权</el-button>
          </template>
        </eu-table-toolbar>
        <el-table
          ref="refTable"
          :data="state.list"
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
              <enum-tag :value="row.status" :enums="EnableFlagEnums" />
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
          v-model:page="state.queryParams.page"
          v-model:limit="state.queryParams.size"
          :total="state.total"
          @pagination="onQuery"
        />
      </div>

      <add-auth-user-dialog ref="refAddAuthUserDialog" @complete="onRefresh" />
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">

</style>
