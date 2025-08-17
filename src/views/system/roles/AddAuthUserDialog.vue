<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { ElMessage, ElMessageBox, type TableInstance } from 'element-plus';
import { Plus, Refresh, Search } from '@element-plus/icons-vue';

import { list as deptList } from '@/api/system/dept';
import { getParentFieldsByLeafId, handleTreeData } from '@/utils';
import { batchAssignRole, roleUserList } from '@/api/system/user';
import useVisible from '@/hooks/visible';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { DeptTree } from '@/types/system/dept';
import EnumTag from '@/components/EnumTag.vue';
import { EnableFlagEnums } from '@/utils/enums';
import type { User } from '@/types/system/user';

const emit = defineEmits(['complete']);
const refTable = useTemplateRef<TableInstance>('refTable');
const { visible, setVisible } = useVisible(false);
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    nickname: null,
    mobile: null,
    roleId: null as number | null,
    hasRole: 0,

    page: 1,
    size: 10,
    sort: [],
  },

  deptTree: [] as DeptTree[],
  roleId: null as number | null,
});

function open(_roleId: number) {
  reset();
  state.roleId = _roleId;
  setVisible(true);
  onDeptQuery();
  onRefresh();
}

function onSelectionChange(selection: User[]) {
  state.multipleDisabled = !selection.length;
}

function onSelectable(row: User) {
  return !!row.id;
}

function onDeptQuery() {
  deptList().then((res) => {
    state.deptTree = handleTreeData(res.data || []) as DeptTree[];
  });
}

function onRefresh() {
  reset('queryParams');
  onQuery();
}

function onQuery() {
  setLoading(true);
  state.queryParams.roleId = state.roleId;
  roleUserList(state.queryParams)
    .then((res) => {
      state.list = res.data.records;
      state.total = res.data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

function convertToDeptName(deptId: number) {
  return getParentFieldsByLeafId(state.deptTree, deptId, {
    fieldKey: 'deptName',
  }).join('/');
}

function onBatchAuth() {
  const ids = refTable.value?.getSelectionRows().map((item) => item.id) || [];
  ElMessageBox.confirm(`确定要给这 ${ids.length} 个用户分配角色吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        batchAssignRole({
          roleId: state.roleId,
          userIds: ids,
        })
          .then(() => {
            ElMessage.success('授权成功');
            done();
            setVisible(false);
            emit('complete');
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

defineExpose({
  open,
});
</script>

<template>
  <el-dialog v-model="visible" title="授权用户" width="1000px" append-to-body>
    <div>
      <div class="page-body query-wrapper">
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
        <div v-permissions="['system:user:assignRole']">
          <el-button :disabled="state.multipleDisabled" type="primary" :icon="Plus" plain @click="onBatchAuth">批量授权</el-button>
        </div>
      </div>
      <el-table ref="refTable" :data="state.list" style="width: 100%" @selection-change="onSelectionChange">
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
          <template #default="{ row }">
            <enum-tag :value="row.status" :enums="EnableFlagEnums" />
          </template>
        </el-table-column>
        <el-table-column prop="lastActiveTime" label="最后活跃时间"></el-table-column>
      </el-table>
      <pagination v-model:page="state.queryParams.page" v-model:limit="state.queryParams.size" :total="state.total" @pagination="onQuery" />
    </div>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
