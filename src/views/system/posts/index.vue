<script setup lang="ts">
import ImportDialog from "@/components/ImportDialog.vue";
import PostEditDialog from "@/views/system/posts/PostEditDialog.vue";
import {onMounted, ref} from "vue";
import {batchDel, page} from "@/api/system/post";
import {download} from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import {Refresh, Search} from "@element-plus/icons-vue";

const DEFAULT_QUERY_PARAMS = {
  postName: null,
  page: 1,
  size: 10
}

const list = ref([])
const total = ref(0)
const loading = ref(false)
const isQueryShow = ref(true)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const multipleDisabled = ref(true)

const refTable = ref(null)
const refPostEditDialog = ref(null)
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
  refPostEditDialog.value.open({
    status: 0
  })
}

function onExport() {
  download('/api/system/post/export', queryParams.value, `post_${new Date().getTime()}.xlsx`)
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
  refPostEditDialog.value.open(row)
}

function onRowDelete(row) {
  ElMessageBox.confirm(`确认要删除"${ row.postName }"吗？`, '提示', {
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

</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper :show="isQueryShow">
        <el-form :model="queryParams" :inline="true">
          <el-form-item label="岗位名称">
            <el-input v-model="queryParams.postName" placeholder="输入要查找的岗位名称" />
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
            add: ['system:post:add'],
            del: ['system:post:del'],
            export: ['system:post:export'],
            import: ['system:post:import'],
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
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="postName" label="岗位名称"></el-table-column>
          <el-table-column prop="code" label="岗位编码"></el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0">正常</el-tag>
              <el-tag v-else-if="row.status === 1" type="danger">停用</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-permissions="['system:post:edit', 'system:post:del']" label="操作">
            <template #default="{ row }">
              <el-button v-permissions="['system:post:edit']" text type="primary" @click="onRowUpdate(row)">修改</el-button>
              <el-button v-permissions="['system:post:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
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

    <post-edit-dialog ref="refPostEditDialog" @complete="onRefresh" />

    <import-dialog
      ref="refImportDialog"
      upload-url="/api/system/post/import"
      tpl-export-url="/api/system/post/export-template"
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
