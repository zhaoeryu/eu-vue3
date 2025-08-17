<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { ElMessage, ElMessageBox, type TableInstance } from 'element-plus';
import { Key, Link, Refresh, Search } from '@element-plus/icons-vue';

import { list as deptListApi } from '@/api/system/dept';
import { getParentFieldsByLeafId, handleTreeData } from '@/utils';
import { batchDel, getUserInfo, page, resetPwd, updateStatus } from '@/api/system/user';
import { download } from '@/utils/request';
import UserEditDialog from '@/views/system/users/UserEditDialog.vue';
import AssignRoleDialog from '@/views/system/users/AssignRoleDialog.vue';
import ImportDialog from '@/components/ImportDialog.vue';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { User } from '@/types/system/user';
import type { ANY_OBJECT } from '@/types/generic';
import type { Dept, DeptTree } from '@/types/system/dept';
import { hasPermission } from '@/utils/permission';

const DEFAULT_PAGE = {
  page: 1,
  size: 10,
  sort: [],
};

type State = {
  deptList: Dept[];
  deptTree: DeptTree[];
} & Partial<ANY_OBJECT>;

const refUserEditDialog = useTemplateRef<InstanceType<typeof UserEditDialog>>('refUserEditDialog');
const refTable = useTemplateRef<TableInstance>('refTable');
const refImportDialog = useTemplateRef<InstanceType<typeof ImportDialog>>('refImportDialog');
const refAssignRoleDialog = useTemplateRef<InstanceType<typeof AssignRoleDialog>>('refAssignRoleDialog');
const { loading, setLoading } = useLoading(false);
const { loading: deptLoading, setLoading: setDeptLoading } = useLoading(false);
const [state, reset] = useResettableReactive<State>({
  list: [],
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    deptId: null,
    nickname: null,
    mobile: null,
    username: null,
    lastActiveTime: null,

    ...DEFAULT_PAGE,
  },

  deptList: [] as Dept[],
  deptTree: [] as DeptTree[],
});

onMounted(() => {
  onRefresh();
  onLoadDept();
});

function onSelectable(row: User) {
  return row.admin !== 1;
}

function onLoadDept() {
  setDeptLoading(true);
  deptListApi({})
    .then((res) => {
      state.deptList = res.data;
      state.deptTree = handleTreeData(state.deptList) as DeptTree[];
    })
    .finally(() => {
      setDeptLoading(false);
    });
}

const filterNodeMethod = (value: string, data: DeptTree) => data.deptName.includes(value);

function onQuery() {
  setLoading(true);
  page(state.queryParams)
    .then((res) => {
      state.list = res.data.records;
      state.total = res.data.total;
    })
    .finally(() => {
      setLoading(false);
    });
}

function onRefresh() {
  reset('queryParams');
  onQuery();
}

function onResetPassword(row: User) {
  ElMessageBox.prompt(`请输入"${row.nickname}"的新密码`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    inputPattern: /^.{6,20}$/,
    inputErrorMessage: '用户密码长度必须介于 6 ~ 20 之间',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        resetPwd(row.id, instance.inputValue)
          .then(() => {
            ElMessage.success(`密码重置成功，新密码是：${instance.inputValue}`);
            done();
          })
          .finally(() => {
            instance.confirmButtonLoading = false;
          });
      } else {
        done();
      }
    },
  });
}

function onAssignRoles(row: User) {
  refAssignRoleDialog.value?.open(row.id);
}

function onRowDelete(row: User) {
  ElMessageBox.confirm(`确认要删除"${row.nickname}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        batchDel([row.id])
          .then(() => {
            ElMessage.success('删除成功');
            done();
            onRefresh();
          })
          .finally(() => {
            instance.confirmButtonLoading = false;
          });
      } else {
        done();
      }
    },
  });
}

function onRowUpdate(row: User) {
  // 加载用户的岗位和角色
  getUserInfo(row.id).then((res) => {
    const data = JSON.parse(JSON.stringify(row));
    data._deptIds = getParentFieldsByLeafId(state.deptTree, row.deptId!, {
      fieldKey: 'id',
    });
    data.postIds = res.data.postIds || [];
    data.roleIds = res.data.roleIds || [];
    refUserEditDialog.value?.open(data, state.deptTree);
  });
}

function onSelectionChange(selection: User[]) {
  state.multipleDisabled = !selection.length;
}

function onAdd() {
  refUserEditDialog.value?.open(
    {
      sex: 1,
      status: 0,
    } as User,
    state.deptTree,
  );
}

function onBatchDel() {
  const ids = refTable.value?.getSelectionRows().map((item) => item.id) || [];
  ElMessageBox.confirm(`确认要删除选中的${ids.length}条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        batchDel(ids)
          .then(() => {
            ElMessage.success('删除成功');
            done();
            onRefresh();
          })
          .finally(() => {
            instance.confirmButtonLoading = false;
          });
      } else {
        done();
      }
    },
  });
}

function convertToDeptName(deptId: number) {
  return getParentFieldsByLeafId(state.deptTree, deptId, {
    fieldKey: 'deptName',
  }).join('/');
}

function onStatusChange(row: User) {
  const status = row.status;
  ElMessageBox.confirm(`确认要${status === 0 ? '启用' : '禁用'}"${row.nickname}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        updateStatus({
          id: row.id,
          status,
        })
          .then(() => {
            ElMessage.success(`${status === 0 ? '启用' : '禁用'}成功`);
            done();
            onRefresh();
          })
          .finally(() => {
            instance.confirmButtonLoading = false;
          });
      } else {
        done();
      }
    },
  }).catch(() => {
    row.status = status === 0 ? 1 : 0;
  });
}

function onExport() {
  download('/api/system/user/export', state.queryParams, `user_${new Date().getTime()}.xlsx`);
}

function onImport() {
  refImportDialog.value?.open();
}
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper :show="state.isQueryShow">
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item label="用户名称">
            <el-input v-model="state.queryParams.nickname" placeholder="输入要查找的用户名称" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="state.queryParams.mobile" placeholder="输入要查找的手机号" clearable />
          </el-form-item>
          <el-form-item label="登录名">
            <el-input v-model="state.queryParams.username" placeholder="输入要查找的登录名" clearable />
          </el-form-item>
          <el-form-item label="部门">
            <el-tree-select
              v-model="state.queryParams.deptId"
              :loading="deptLoading"
              :data="state.deptTree"
              :filter-node-method="filterNodeMethod"
              :props="{
                children: 'children',
                label: 'deptName',
              }"
              :default-expand-all="true"
              node-key="id"
              check-strictly
              show-checkbox
              filterable
              clearable
            />
          </el-form-item>
          <el-form-item label="最后活跃时间">
            <el-date-picker
              v-model="state.queryParams.lastActiveTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            >
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
          v-model:search-toggle="state.isQueryShow"
          :multiple-disabled="state.multipleDisabled"
          :opt-show="{
            sort: false,
          }"
          :permission="{
            add: ['system:user:add'],
            del: ['system:user:del'],
            export: ['system:user:export'],
            import: ['system:user:import'],
          }"
          :ref-table="refTable"
          @add="onAdd"
          @batch-del="onBatchDel"
          @export="onExport"
          @import="onImport"
          @refresh="onRefresh"
        />
        <el-table ref="refTable" :data="state.list" style="width: 100%" @selection-change="onSelectionChange">
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
            <template #default="{ row }">
              <el-switch v-model="row.status" :disabled="row.username === 'admin'" :active-value="0" :inactive-value="1" @change="onStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="lastActiveTime" label="最后活跃时间"></el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <template v-if="row.admin !== 1">
                <el-button-group>
                  <el-button v-permissions="['system:user:edit']" type="primary" text @click="onRowUpdate(row)">修改</el-button>
                  <el-button v-permissions="['system:user:del']" type="primary" text @click="onRowDelete(row)">删除</el-button>
                  <el-dropdown v-if="hasPermission(['system:user:resetPwd', 'system:user:assignRole'])" trigger="click">
                    <el-button text type="primary">更多</el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-if="hasPermission(['system:user:resetPwd'])" :icon="Key" @click="onResetPassword(row)">重置密码</el-dropdown-item>
                        <el-dropdown-item v-if="hasPermission(['system:user:assignRole'])" :icon="Link" @click="onAssignRoles(row)">分配角色</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-button-group>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-model:page="state.queryParams.page" v-model:limit="state.queryParams.size" :total="state.total" @pagination="onQuery" />
      </div>
    </div>

    <user-edit-dialog ref="refUserEditDialog" @complete="onRefresh" />

    <import-dialog ref="refImportDialog" upload-url="/api/system/user/import" tpl-export-url="/api/system/user/export-template" @complete="onRefresh" />

    <assign-role-dialog ref="refAssignRoleDialog" @success="onRefresh" />
  </div>
</template>

<style scoped lang="scss"></style>
