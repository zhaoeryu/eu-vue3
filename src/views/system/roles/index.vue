<script setup lang="ts">
import {onMounted, ref} from "vue";
import {download} from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import {Refresh, Search} from "@element-plus/icons-vue";
import ImportDialog from "@/components/ImportDialog.vue";
import { page, batchDel } from '@/api/system/role'
import RoleUserDrawer from '@/views/system/roles/RoleUserDrawer.vue'
import RoleEditDialog from '@/views/system/roles/RoleEditDialog.vue'
import DataScopeDialog from '@/views/system/roles/DataScopeDialog.vue'

const DEFAULT_QUERY_PARAMS = {
  roleName: null,
  page: 1,
  size: 10,
}

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const isQueryShow = ref(true)
const multipleDisabled = ref(true)

const refTable = ref(null)
const refRoleUserDrawer = ref(null)
const refDataScopeDialog = ref(null)
const refRoleEditDialog = ref(null)
const refImportDialog = ref(null)

onMounted(() => {
  onRefresh()
})

function onQuery() {
  loading.value = true
  page(queryParams.value).then(res => {
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

function onAdd() {
  refRoleEditDialog.value.open({
    status: 0
  })
}

function onSelectable(row) {
  return row.roleKey !== 'admin'
}

function onExport() {
  download('/api/system/role/export', queryParams.value, `role_${new Date().getTime()}.xlsx`)
}

function onImport() {
  refImportDialog.value.open()
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
        batchDel(ids).then(() => {
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

function onSelectionChange(selection) {
  multipleDisabled.value = !selection.length
}

function onRowUpdate(row) {
  refRoleEditDialog.value.open(row)
}

function onRowDelete(row) {
  ElMessageBox.confirm(`确认要删除"${ row.roleName }"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        batchDel([row.id]).then(() => {
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

function onRowRoleMember(row) {
  refRoleUserDrawer.value.open(row)
}

function onRowDataScope(row) {
  refDataScopeDialog.value.open(row)
}
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper :show="isQueryShow">
        <el-form :model="queryParams" :inline="true">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="queryParams.roleName" placeholder="输入要查找的角色名称" maxlength="20" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
            <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
          </el-form-item>
        </el-form>
      </query-expand-wrapper>
      <div v-loading="loading">
        <eu-table-toolbar
          :multiple-disabled="multipleDisabled"
          :opt-show="{
            sort: false
          }"
          :permission="{
            add: ['system:role:add'],
            del: ['system:role:del'],
            export: ['system:role:export'],
            import: ['system:role:import'],
          }"
          :ref-table="refTable"
          @add="onAdd"
          @batchDel="onBatchDel"
          @export="onExport"
          @import="onImport"
          @refresh="onRefresh"
          v-model:searchToggle="isQueryShow"
        />
        <el-table
            ref="refTable"
            :data="list"
            @selection-change="onSelectionChange"
            style="width: 100%"
        >
          <el-table-column type="selection" :selectable="onSelectable"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="description" label="角色描述"></el-table-column>
          <el-table-column prop="roleKey" label="权限字符串"></el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0">正常</el-tag>
              <el-tag v-else-if="row.status === 1" type="danger">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-permissions="['system:role:edit', 'system:role:del']" label="操作" width="220">
            <template #default="{ row }">
              <template v-if="row.roleKey !== 'admin'">
                <el-button v-permissions="['system:role:edit']" text type="primary" @click="onRowUpdate(row)">修改</el-button>
                <el-button v-permissions="['system:role:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
                <el-button v-permissions="['system:role:edit']" text type="primary" @click="onRowRoleMember(row)">分配用户</el-button>
                <el-button v-permissions="['system:role:edit']" text type="primary" @click="onRowDataScope(row)">数据权限</el-button>
              </template>
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
    </div>

    <role-edit-dialog ref="refRoleEditDialog" @complete="onRefresh" />

    <role-user-drawer ref="refRoleUserDrawer" />
    <data-scope-dialog ref="refDataScopeDialog" @complete="onRefresh" />
    <import-dialog
        ref="refImportDialog"
        upload-url="/api/system/role/import"
        tpl-export-url="/api/system/role/export-template"
        @complete="onRefresh"
    >
      <template #importTip>
        <li>状态字段可选项：正常、禁用</li>
      </template>
    </import-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
