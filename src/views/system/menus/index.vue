<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue';
import { ElMessage, ElMessageBox, type TableInstance } from 'element-plus';
import { Sort } from '@element-plus/icons-vue';

import { list as listApi, batchDel } from '@/api/system/menu';
import { handleTreeData, getChildrenFields, getParentFieldsByLeafId, flattenTreeData } from '@/utils';
import MenuEditDialog from '@/views/system/menus/MenuEditDialog.vue';
import EnumTag from '@/components/EnumTag.vue';
import { EnableFlagEnums, MenuTypeEnums } from '@/utils/enums';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { MenuTree, Menu } from '@/types/system/menu';

const refTable = useTemplateRef<TableInstance>('refTable'); // 添加表格引用
const refMenuEditDialog = useTemplateRef<InstanceType<typeof MenuEditDialog>>('refMenuEditDialog');
const { loading, setLoading } = useLoading(false);
const [state, _reset] = useResettableReactive({
  list: [] as MenuTree[],
  originList: [] as Menu[],
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    menuName: null,

    // page: 1,
    // size: 10,
    // sort: [],
  },
  isExpandAll: false,
});

const treeTable = computed(() => {
  const searchValue = state.queryParams.menuName;
  if (searchValue) {
    return filterTreeData(state.list, searchValue);
  }
  return state.list;
});

onMounted(() => {
  onRefresh();
});

function filterTreeData(treeData: MenuTree[], searchValue: string): MenuTree[] {
  if (!treeData || treeData.length === 0) {
    return [];
  }
  const array = [];
  for (let i = 0; i < treeData.length; i += 1) {
    let match = false;
    const item = treeData[i];
    const labelValue = item.menuName;
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
      state.list = handleTreeData(res.data) as MenuTree[];
    })
    .finally(() => {
      setLoading(false);
    });
}

function onRefresh() {
  onQuery();
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
  refMenuEditDialog.value?.open(
    {
      menuType: MenuTypeEnums.DIR.value,
      status: EnableFlagEnums.ENABLE.value,
      visible: true,
    } as MenuTree,
    state.list,
  );
}

function onRowAdd(row: MenuTree) {
  refMenuEditDialog.value?.open(
    {
      menuType: MenuTypeEnums.MENU.value,
      status: EnableFlagEnums.ENABLE.value,
      visible: true,
      _parentIds: getParentFieldsByLeafId(treeTable.value, row.id, {
        fieldKey: 'id',
      }),
    } as MenuTree,
    state.list,
  );
}

function onRowUpdate(row: MenuTree) {
  refMenuEditDialog.value?.open(
    Object.assign(row, {
      // 从指定的叶子节点中获取所有父节点
      _parentIds: getParentFieldsByLeafId(treeTable.value, row.parentId!, {
        fieldKey: 'id',
      }),
    }),
    state.list,
  );
}

function onRowDelete(row: MenuTree) {
  ElMessageBox.confirm(`确定要删除"${row.menuName}"${row.children && row.children.length ? '以及该菜单下面所有的菜单' : ''}吗？`, {
    title: '提示',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        // 删除当前菜单以及该菜单下所有子菜单
        const menuIds = [row.id, ...getChildrenFields(row, { fieldKey: 'id' })];
        batchDel(menuIds)
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
      <query-expand-wrapper :show="state.isQueryShow">
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item prop="menuName" label="菜单名称">
            <el-input v-model="state.queryParams.menuName" placeholder="输入要查找的菜单名称" maxlength="20" />
          </el-form-item>
        </el-form>
      </query-expand-wrapper>
      <div v-loading="loading">
        <eu-table-toolbar
          v-model:search-toggle="state.isQueryShow"
          :multiple-disabled="state.multipleDisabled"
          :opt-show="{
            del: false,
            export: false,
            import: false,
            sort: false,
          }"
          :permission="{
            add: ['system:menu:add'],
          }"
          :ref-table="refTable"
          @add="onAdd"
          @refresh="onRefresh"
        >
          <template #right>
            <el-button :icon="Sort" plain @click="onExpandCollapse">
              {{ state.isExpandAll ? '全部折叠' : '全部展开' }}
            </el-button>
          </template>
        </eu-table-toolbar>
        <el-table ref="refTable" :data="treeTable" style="width: 100%" row-key="id" border :default-expand-all="state.isExpandAll" :tree-props="{ children: 'children' }">
          <el-table-column prop="menuName" label="菜单名称" width="180"></el-table-column>
          <el-table-column prop="menuType" label="菜单类型" width="90">
            <template #default="{ row }">
              <enum-tag :value="row.menuType" :enums="MenuTypeEnums" />
            </template>
          </el-table-column>
          <el-table-column prop="menuIcon" label="图标" width="60">
            <template #default="{ row }">
              <svg-icon v-if="row.menuIcon" :icon-class="row.menuIcon" />
            </template>
          </el-table-column>
          <el-table-column prop="sortNum" label="排序" width="60"></el-table-column>
          <el-table-column prop="permission" label="权限标识"></el-table-column>
          <el-table-column prop="component" label="组件路径"></el-table-column>
          <el-table-column prop="status" label="状态" width="70">
            <template #default="{ row }">
              <enum-tag :value="row.status" :enums="EnableFlagEnums" />
            </template>
          </el-table-column>
          <el-table-column prop="visible" label="是否可见" width="70">
            <template #default="{ row }">
              <el-tag v-if="row.visible === true">是</el-tag>
              <el-tag v-else-if="row.visible === false" type="info">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cache" label="是否缓存" width="70">
            <template #default="{ row }">
              <el-tag v-if="row.cache === true">是</el-tag>
              <el-tag v-else type="info">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="dot" label="dot" width="70">
            <template #default="{ row }">
              <el-tag v-if="row.dot === true">是</el-tag>
              <el-tag v-else type="info">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="badge" label="badge" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.badge" class="el-tag__badge" type="danger" effect="dark">
                {{ row.badge }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-permissions="['system:menu:add', 'system:menu:edit', 'system:menu:del']" label="操作" width="200">
            <template #default="{ row }">
              <el-button v-permissions="['system:menu:add']" text type="primary" @click="onRowAdd(row)">新增</el-button>
              <el-button v-permissions="['system:menu:edit']" text type="primary" @click="onRowUpdate(row)">修改</el-button>
              <el-button v-permissions="['system:menu:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <menu-edit-dialog ref="refMenuEditDialog" @complete="onRefresh" />
  </div>
</template>

<style scoped lang="scss">
.el-tag__badge {
  height: 16px;
  padding-right: 4px;
  padding-left: 4px;
  line-height: 16px;
  border: 0;
}

.page-body {
  .svg-icon {
    height: 32px;
    width: 1.5em;
  }
}
</style>
