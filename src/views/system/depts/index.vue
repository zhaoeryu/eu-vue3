<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue';
import { ElMessage, ElMessageBox, type TableInstance } from 'element-plus';
import { Plus, Sort } from '@element-plus/icons-vue';

import DeptEditDialog from '@/views/system/depts/DeptEditDialog.vue';
import { flattenTreeData, getChildrenFields, getParentFieldsByLeafId, handleTreeData } from '@/utils';
import { list as listApi, batchDel as batchDelApi } from '@/api/system/dept';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { Dept, DeptTree } from '@/types/system/dept';
import { EnableFlagEnums } from '@/utils/enums';

const refTable = useTemplateRef<TableInstance>('refTable'); // 添加表格引用
const refDeptEditDialog = useTemplateRef<InstanceType<typeof DeptEditDialog>>('refDeptEditDialog');
const { loading, setLoading } = useLoading(false);
const [state, _reset] = useResettableReactive({
  list: [] as DeptTree[],
  originList: [] as Dept[],
  queryParams: {
    deptName: null,

    page: 1,
    size: 10,
    sort: [],
  },
  isExpandAll: true,
});

const treeTable = computed(() => {
  const searchValue = state.queryParams.deptName;
  if (searchValue) {
    return filterTreeData(state.list, searchValue);
  }
  return state.list;
});

onMounted(() => {
  onRefresh();
});

function onRefresh() {
  onQuery();
}

function filterTreeData(treeData: DeptTree[], searchValue: string): DeptTree[] {
  if (!treeData || treeData.length === 0) {
    return [];
  }
  const array = [];
  for (let i = 0; i < treeData.length; i += 1) {
    let match = false;
    const item = treeData[i];
    const labelValue = item.deptName;
    if (labelValue) {
      match = labelValue.includes(searchValue);
    }
    if (filterTreeData(treeData[i].children, searchValue).length > 0 || match) {
      array.push({
        ...treeData[i],
        children: filterTreeData(treeData[i].children, searchValue),
      });
    }
  }
  return array;
}

function onQuery() {
  setLoading(true);
  listApi(state.queryParams)
    .then((res) => {
      state.originList = res.data;
      state.list = handleTreeData(state.originList) as DeptTree[];
    })
    .finally(() => {
      setLoading(false);
    });
}

function onExpandCollapse() {
  state.isExpandAll = !state.isExpandAll;
  // 获取所有树形节点并切换展开状态
  const allRows = flattenTreeData(state.list);
  allRows.forEach((row) => {
    refTable.value?.toggleRowExpansion(row, state.isExpandAll);
  });
}

function onAdd() {
  const data = {
    status: EnableFlagEnums.ENABLE.value,
  } as DeptTree & {
    _parentIds: string[];
  };
  refDeptEditDialog.value?.open(data, state.list);
}

function onRowAdd(row: DeptTree) {
  const data = {
    status: EnableFlagEnums.ENABLE.value,
    _parentIds: getParentFieldsByLeafId(treeTable.value, row.id, {
      fieldKey: 'id',
    }),
  } as DeptTree & {
    _parentIds: string[];
  };
  refDeptEditDialog.value?.open(data, state.list);
}
function onRowEdit(row: DeptTree) {
  const data = JSON.parse(JSON.stringify(row));
  data._parentIds = getParentFieldsByLeafId(treeTable.value, row.parentId, {
    fieldKey: 'id',
  });
  refDeptEditDialog.value?.open(data, state.list);
}
function onRowDelete(row: DeptTree) {
  ElMessageBox.confirm(`确定要删除"${row.deptName}"${row.children && row.children.length ? '以及它下面的所有部门吗' : ''}吗？`, {
    title: '提示',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        // 删除当前菜单以及该菜单下所有子菜单
        const nodeIds = [row.id, ...getChildrenFields(row, { fieldKey: 'id' })];
        batchDelApi(nodeIds)
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
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <div class="query-wrapper">
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item label="部门名称">
            <el-input v-model="state.queryParams.deptName" placeholder="输入要查找的部门名称" />
          </el-form-item>
        </el-form>
        <div>
          <el-button :icon="Sort" plain @click="onExpandCollapse">{{ state.isExpandAll ? '全部折叠' : '全部展开' }}</el-button>
          <el-button v-permissions="['system:dept:add']" type="primary" :icon="Plus" plain @click="onAdd">添加部门</el-button>
        </div>
      </div>
      <el-divider />
      <div v-loading="loading">
        <el-table ref="refTable" :data="treeTable" style="width: 100%" row-key="id" border :default-expand-all="state.isExpandAll" :tree-props="{ children: 'children' }">
          <el-table-column prop="deptName" label="部门名称" width="180"></el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <enum-tag :value="row.status" :enums="EnableFlagEnums" />
            </template>
          </el-table-column>
          <el-table-column prop="sortNum" label="排序"></el-table-column>
          <el-table-column v-permissions="['system:dept:add', 'system:dept:edit', 'system:dept:del']" label="操作" width="200">
            <template #default="{ row }">
              <el-button v-permissions="['system:dept:add']" text type="primary" @click="onRowAdd(row)">新增</el-button>
              <el-button v-permissions="['system:dept:edit']" text type="primary" @click="onRowEdit(row)">修改</el-button>
              <el-button v-permissions="['system:dept:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <dept-edit-dialog ref="refDeptEditDialog" @complete="onRefresh" />
  </div>
</template>

<style scoped lang="scss"></style>
