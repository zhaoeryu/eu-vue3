<script setup lang="ts">
import DeptEditDialog from "@/views/system/depts/DeptEditDialog.vue";
import {ref, computed, onMounted, nextTick} from "vue";
import {getChildrenFields, getParentFieldsByLeafId, handleTreeData} from "@/utils";
import {list as listApi, batchDel as batchDelApi} from '@/api/system/dept'
import {ElMessage, ElMessageBox} from "element-plus";
import {Plus, Sort} from "@element-plus/icons-vue";

const DEFAULT_QUERY_PARAMS = {
  deptName: null
}

const refreshTable = ref(true)
const isExpandAll = ref(true)
const list = ref([])
const originList = ref([])
const loading = ref(false)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const refDeptEditDialog = ref(null)

const treeTable = computed(() => {
  const searchValue = queryParams.value.deptName
  if(searchValue){
    let handleTreeData = handleTreeData2(list.value, searchValue)
    return handleTreeData
  }
  return list.value
})

onMounted(() => {
  onRefresh()
})

function onRefresh() {
  onQuery()
}

function handleTreeData2(treeData, searchValue: string) {
  if (!treeData || treeData.length === 0) {
    return [];
  }
  const array = [];
  for (let i = 0; i < treeData.length; i += 1) {
    let match = false;
    for(let pro in treeData[i]){
      if(typeof(treeData[i][pro])=='string'){
        match = treeData[i][pro].includes(searchValue);
        if(match) {
          break;
        }
      }
    }
    if (handleTreeData2(treeData[i].children, searchValue).length > 0 || match ) {
      array.push({
        ...treeData[i],
        children: handleTreeData2(treeData[i].children, searchValue),
      });
    }
  }
  return array;
}

function onQuery() {
  loading.value = true
  listApi(queryParams.value).then(res => {
    originList.value = res.data
    list.value = handleTreeData(originList.value)
  }).finally(() => {
    loading.value = false
  })
}

function onExpandCollapse() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

function onAdd() {
  const data = {
    status: 0
  }
  refDeptEditDialog.value.open(data, list.value)
}

function onRowAdd(row) {
  const data = {
    status: 0,
    _parentIds: getParentFieldsByLeafId(treeTable.value, row.id, {
      fieldKey: 'id',
    })
  }
  refDeptEditDialog.value.open(data, list.value)
}
function onRowEdit(row) {
  const data = JSON.parse(JSON.stringify(row))
  data._parentIds = getParentFieldsByLeafId(treeTable.value, row.parentId, {
    fieldKey: 'id',
  })
  refDeptEditDialog.value.open(data, list.value)
}
function onRowDelete(row) {
  ElMessageBox.confirm(`确定要删除"${ row.deptName }"${row.children && row.children.length ? '以及它下面的所有部门吗' : ''}吗？`, {
    title: '提示',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        // 删除当前菜单以及该菜单下所有子菜单
        const nodeIds = [row.id, ...getChildrenFields(row, { fieldKey: 'id' })]
        batchDelApi(nodeIds).then(() => {
          ElMessage.success('删除成功')
          done()
          onRefresh()
        }).finally(() => {
          instance.confirmButtonLoading = false
        })
      } else {
        done()
      }
    }
  })
}

</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <div class="query-wrapper">
        <el-form :model="queryParams" :inline="true">
          <el-form-item label="部门名称">
            <el-input v-model="queryParams.deptName" placeholder="输入要查找的部门名称" />
          </el-form-item>
        </el-form>
        <div>
          <el-button :icon="Sort" plain @click="onExpandCollapse">{{ isExpandAll ? '全部折叠' : '全部展开' }}</el-button>
          <el-button v-permissions="['system:dept:add']" type="primary" :icon="Plus" plain @click="onAdd">添加部门</el-button>
        </div>
      </div>
      <el-divider />
      <div v-loading="loading">
        <el-table
          v-if="refreshTable"
          :data="treeTable"
          style="width: 100%;"
          row-key="id"
          border
          :default-expand-all="isExpandAll"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        >
          <el-table-column prop="deptName" label="部门名称" width="180"></el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0">正常</el-tag>
              <el-tag v-else-if="row.status === 1" type="danger">禁用</el-tag>
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

<style scoped lang="scss">

</style>
