<script setup lang="ts">
import ImportDialog from "@/components/ImportDialog.vue";
import DictDetailDrawer from '@/views/system/dicts/DictDetailDrawer.vue'
import DictEditDialog from '@/views/system/dicts/DictEditDialog.vue'
import {page, batchDel} from '@/api/system/dict'
import {onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {Refresh, Search} from "@element-plus/icons-vue";
import {download} from "@/utils/request";

const DEFAULT_QUERY_PARAMS = {
  dictKey: null,
  page: 1,
  size: 10,
}

const list = ref([])
const total = ref(0)
const loading = ref(false)
const isQueryShow = ref(true)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const multipleDisabled = ref(true)

const refDictEditDialog = ref(null)
const refDetailDrawer = ref(null)
const refTable = ref(null)
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
  refDictEditDialog.value.open({
    status: 0
  })
}

function onExport() {
  download('/api/system/dict/export', queryParams.value, `dict_${new Date().getTime()}.xlsx`)
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

function onRowDetail(row) {
  refDetailDrawer.value.open(row.id, row.dictKey)
}

function onRowUpdate(row) {
  refDictEditDialog.value.open(row)
}

function onRowDelete(row) {
  ElMessageBox.confirm(`确认要删除"${row.dictKey}"吗？`, '提示', {
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
          <el-form-item label="字典KEY" prop="dictKey">
            <el-input v-model="queryParams.dictKey" placeholder="输入要查找的字典KEY" />
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
            add: ['system:dict:add'],
            del: ['system:dict:del'],
            export: ['system:dict:export'],
            import: ['system:dict:import'],
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
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="dictKey" label="字典KEY"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column prop="status" label="是否启用">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0">正常</el-tag>
              <el-tag v-else type="danger">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-permissions="['system:dict-detail:list', 'system:dict:edit', 'system:dict:del']"
              label="操作" width="200">
            <template #default="{ row }">
              <el-button v-permissions="['system:dict-detail:list']" text type="primary" @click="onRowDetail(row)">详情
              </el-button>
              <el-button v-permissions="['system:dict:edit']" text type="primary" @click="onRowUpdate(row)">修改</el-button>
              <el-button v-permissions="['system:dict:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
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

    <dict-edit-dialog ref="refDictEditDialog" @complete="onRefresh" />

    <dict-detail-drawer ref="refDetailDrawer" />

    <import-dialog
        ref="refImportDialog"
        upload-url="/api/system/dict/import"
        tpl-export-url="/api/system/dict/export-template"
        @complete="onRefresh"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
