<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import { list as deptListApi } from '@/api/system/dept'
import {getParentFieldsByLeafId, handleTreeData} from "@/utils";
import {batchDel, getUserInfo, page, resetPwd, updateStatus} from "@/api/system/user";
import {ElMessage, ElMessageBox} from "element-plus";
import {download} from "@/utils/request";
import {Key, Link, Refresh, Search} from "@element-plus/icons-vue";
import UserEditDialog from "@/views/system/users/UserEditDialog.vue";
import AssignRoleDialog from "@/views/system/users/AssignRoleDialog.vue";
import ImportDialog from "@/components/ImportDialog.vue";

const DEFAULT_QUERY_PARAMS = {
  deptId: null,
  nickname: null,
  mobile: null,
  username: null,
  lastActiveTime: null,

  page: 1,
  size: 10,
}

const list = ref([])
const total = ref(0)
const loading = ref(false)
const isQueryShow = ref(true)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const multipleDisabled = ref(true)
const deptTree = ref([])
const deptLoading = ref(false)
const deptFilterKeyword = ref("")
const deptList  = ref([])

const refDeptTree = ref(null)
const refTable = ref(null)
const refUserEditDialog = ref(null)
const refImportDialog = ref(null)
const refAssignRoleDialog = ref(null)

// 根据名称筛选部门树
watch(deptFilterKeyword, (val) => {
  refDeptTree.value.filter(val)
})

onMounted(() => {
  onRefresh()
  onDeptQuery()
})

function onSelectable(row) {
  return row.admin !== 1
}
function onFilterNode(value, node) {
  if (!value) {
    return true
  }
  return node.deptName.indexOf(value) !== -1;
}
function onDeptTreeClick(node) {
  queryParams.value.deptId = node.id
  queryParams.value.page = DEFAULT_QUERY_PARAMS.page
  queryParams.value.size = DEFAULT_QUERY_PARAMS.size
  onQuery()
}
function onDeptQuery() {
  deptLoading.value = true
  deptListApi({}).then(res => {
    deptList.value = res.data
    deptTree.value = handleTreeData(deptList.value)
  }).finally(() => {
    deptLoading.value = false
  })
}
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
function onResetPassword(row) {
  ElMessageBox.prompt(`请输入"${ row.nickname }"的新密码`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    inputPattern: /^.{6,20}$/,
    inputErrorMessage: '用户密码长度必须介于 6 ~ 20 之间',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        resetPwd(row.id, instance.inputValue).then(() => {
          ElMessage.success(`密码重置成功，新密码是：${instance.inputValue}`);
          done()
        }).finally(() => {
          instance.confirmButtonLoading = false;
        })
      } else {
        done()
      }
    }
  })
}
function onAssignRoles(row) {
  refAssignRoleDialog.value.open(row.id)
}
function onRowDelete(row) {
  ElMessageBox.confirm(`确认要删除"${ row.nickname }"吗？`, '提示', {
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
function onRowUpdate(row) {
  // 加载用户的岗位和角色
  getUserInfo(row.id).then(res => {
    const data = JSON.parse(JSON.stringify(row))
    data._deptIds = getParentFieldsByLeafId(deptTree.value, row.deptId, {
      fieldKey: 'id'
    })
    data.postIds = res.data.postIds || []
    data.roleIds = res.data.roleIds || []
    refUserEditDialog.value.open(data, deptTree.value)
  })
}
function onSelectionChange(selection) {
  multipleDisabled.value = !selection.length
}
function onAdd() {
  refUserEditDialog.value.open({
    sex: 1,
    status: 0
  }, deptTree.value)
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
function convertToDeptName(deptId) {
  return getParentFieldsByLeafId(deptTree.value, deptId, { fieldKey: 'deptName' }).join('/')
}
function onStatusChange(row) {
  const status = row.status
  ElMessageBox.confirm(`确认要${status === 0 ? '启用' : '禁用'}"${ row.nickname }"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        updateStatus({
          id: row.id,
          status
        }).then(() => {
          ElMessage.success(`${status === 0 ? '启用' : '禁用'}成功`)
          done()
          onRefresh()
        }).finally(() => {
          instance.confirmButtonLoading = false;
        })
      } else {
        done()
      }
    }
  }).catch(() => {
    row.status = status === 0 ? 1 : 0
  });
}
function onExport() {
  download('/api/system/user/export', queryParams.value, `user_${new Date().getTime()}.xlsx`)
}
function onImport() {
  refImportDialog.value.open()
}
</script>

<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :md="4" :sm="6" :xs="24">
        <div class="page-body">
          <el-input placeholder="输入关键字进行过滤" v-model="deptFilterKeyword" style="margin-bottom: 12px;" clearable></el-input>
          <el-tree
            ref="refDeptTree"
            v-loading="deptLoading"
            :data="deptTree"
            :props="{ label: 'deptName', children: 'children' }"
            node-key="id"
            default-expand-all
            :highlight-current="true"
            :expand-on-click-node="false"
            :filter-node-method="onFilterNode"
            @node-click="onDeptTreeClick"
          ></el-tree>
        </div>
      </el-col>
      <el-col :md="20" :sm="18" :xs="24">
        <div class="page-body">
          <query-expand-wrapper :show="isQueryShow">
            <el-form :model="queryParams" :inline="true">
              <el-form-item label="用户名称">
                <el-input v-model="queryParams.nickname" placeholder="输入要查找的用户名称" clearable />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="queryParams.mobile" placeholder="输入要查找的手机号" clearable />
              </el-form-item>
              <el-form-item label="登录名">
                <el-input v-model="queryParams.username" placeholder="输入要查找的登录名" clearable />
              </el-form-item>
              <el-form-item label="最后活跃时间">
                <el-date-picker
                  v-model="queryParams.lastActiveTime"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  align="right">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
                <el-button :icon="Refresh" @click="onRefresh">重置</el-button>
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
                add: ['system:user:add'],
                del: ['system:user:del'],
                export: ['system:user:export'],
                import: ['system:user:import'],
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
              <el-table-column type="selection" label="#" :selectable="onSelectable"></el-table-column>
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
                  <el-switch v-model="row.status" :disabled="row.username === 'admin'" :active-value="0" :inactive-value="1" @change="onStatusChange(row)" />
                </template>
              </el-table-column>
              <el-table-column prop="lastActiveTime" label="最后活跃时间"></el-table-column>
              <el-table-column label="操作" fixed="right" width="200">
                <template v-slot:default="{ row }">
                  <template v-if="row.admin !== 1">
                    <el-button-group>
                      <el-button v-permissions="['system:user:edit']" type="primary" text @click="onRowUpdate(row)">修改</el-button>
                      <el-button v-permissions="['system:user:del']" type="primary" text @click="onRowDelete(row)">删除</el-button>
                      <!--                    <el-button v-permissions="['system:user:resetPwd']" type="primary" text @click="onResetPassword(row)">重置密码</el-button>-->
                      <!--                    <el-button v-permissions="['system:user:assignRole']" type="primary" text @click="onAssignRoles(row)">分配角色</el-button>-->
                      <el-dropdown
                        v-permissions="['system:user:resetPwd', 'system:user:assignRole']"
                        trigger="click"
                      >
                        <el-button text type="primary">更多</el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item :icon="Key" @click="onResetPassword(row)">重置密码</el-dropdown-item>
                            <el-dropdown-item :icon="Link" @click="onAssignRoles(row)">分配角色</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </el-button-group>
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
      </el-col>
    </el-row>

    <user-edit-dialog ref="refUserEditDialog" @complete="onRefresh" />

    <import-dialog
      ref="refImportDialog"
      upload-url="/api/system/user/import"
      tpl-export-url="/api/system/user/export-template"
      @complete="onRefresh"
    />

    <assign-role-dialog
      ref="refAssignRoleDialog"
      @success="onRefresh"
    />

  </div>
</template>

<style scoped lang="scss">

</style>
