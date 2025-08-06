<script setup lang="ts">
import ImportDialog from "@/components/ImportDialog.vue";
import PostEditDialog from "@/views/system/posts/PostEditDialog.vue";
import {onMounted, useTemplateRef} from "vue";
import {batchDel, page} from "@/api/system/post";
import {download} from "@/utils/request";
import {ElMessage, ElMessageBox, type TableInstance} from "element-plus";
import {Refresh, Search} from "@element-plus/icons-vue";
import useLoading from "@/hooks/loading";
import {useResettableReactive} from "@/hooks/resettable";
import {EnableFlagEnums} from "@/utils/enums";
import type {Post} from "@/types/system/post";

const refPostEditDialog = useTemplateRef<InstanceType<typeof PostEditDialog>>('refPostEditDialog')
const refTable = useTemplateRef<TableInstance>('refTable')
const refImportDialog = useTemplateRef<InstanceType<typeof ImportDialog>>('refImportDialog')
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    postName: null,

    page: 1,
    size: 10,
    sort: [],
  },
})

onMounted(() => {
  onRefresh()
})

function onQuery() {
  setLoading(true)
  page(state.queryParams).then(res => {
    state.list = res.data.records
    state.total = res.data.total
  }).finally(() => {
    setLoading(false)
  })
}
function onRefresh() {
  reset('queryParams')
  onQuery()
}

function onAdd() {
  refPostEditDialog.value?.open({} as Post)
}

function onExport() {
  download('/api/system/post/export', state.queryParams, `post_${new Date().getTime()}.xlsx`)
}

function onImport() {
  refImportDialog.value?.open()
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

function onSelectionChange(selection: Post[]) {
  state.multipleDisabled = !selection.length
}

function onRowUpdate(row: Post) {
  refPostEditDialog.value?.open(row)
}

function onRowDelete(row: Post) {
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
      <query-expand-wrapper :show="state.isQueryShow">
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item label="岗位名称">
            <el-input v-model="state.queryParams.postName" placeholder="输入要查找的岗位名称" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
            <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
          </el-form-item>
        </el-form>
      </query-expand-wrapper>
      <div v-loading="loading">
        <eu-table-toolbar
          :multiple-disabled="state.multipleDisabled"
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
          v-model:searchToggle="state.isQueryShow"
        />
        <el-table
          ref="refTable"
          :data="state.list"
          @selection-change="onSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="postName" label="岗位名称"></el-table-column>
          <el-table-column prop="code" label="岗位编码"></el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <enum-tag :value="row.status" :enums="EnableFlagEnums" />
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
          v-model:page="state.queryParams.page"
          v-model:limit="state.queryParams.size"
          :total="state.total"
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
