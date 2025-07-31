<script setup lang="ts">
import { page, batchDel } from '@/api/system/dictDetail'
import ImportDialog from "@/components/ImportDialog.vue";
import DictDetailEditDialog from '@/views/system/dicts/DictDetailEditDialog.vue'
import {computed, ref} from "vue";
import {download} from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import {Refresh, Search} from "@element-plus/icons-vue";

const DEFAULT_QUERY_PARAMS = {
  pid: null,
  dictKey: null,
  page: 1,
  size: 10,
  sort: 'sort_num,asc'
}

const show = ref(false)
const list = ref([])
const total = ref(0)
const loading = ref(false)
const isQueryShow = ref(true)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const multipleDisabled = ref(true)
const dictId = ref(null)
const dictKey = ref(null)

const refTable = ref(null)
const refDictDetailEditDialog = ref(null)
const refImportDialog = ref(null)

const pageTitle = computed(() => {
  return `字典详情${dictKey.value ? ` - ${dictKey.value}` : ''}`
})

function open(_dictId: string | number, _dictKey: string) {
  dictId.value = _dictId
  dictKey.value = _dictKey
  show.value = true

  onRefresh()
}

function onQuery() {
  loading.value = true
  queryParams.value.pid = dictId.value
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
  refDictDetailEditDialog.value.open({
    pid: dictId.value,
    status: 0,
    dictKey: dictKey.value
  })
}

function onExport() {
  download('/api/system/dict-detail/export', queryParams.value, `dictDetail_${new Date().getTime()}.xlsx`)
}

function onImport() {
  refImportDialog.value.open()
}

function onSelectionChange(selection) {
  multipleDisabled.value = !selection.length
}

function onRowUpdate(row) {
  refDictDetailEditDialog.value.open(row)
}

function onRowDelete(row) {
  ElMessageBox.confirm(`确认要删除"${ row.dictLabel }"吗？`, '提示', {
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

defineExpose({
  open
})
</script>

<template>
  <el-drawer
    :title="pageTitle"
    v-model="show"
    size="800px"
    direction="rtl"
  >
    <query-expand-wrapper :show="isQueryShow">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="字典KEY" prop="dictKey">
          <el-input v-model="queryParams.dictKey" placeholder="输入要查找的字典KEY" maxlength="30" />
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
          add: ['system:dict-detail:add'],
          del: ['system:dict-detail:del'],
          export: ['system:dict-detail:export'],
          import: ['system:dict-detail:import'],
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
        <el-table-column prop="dictLabel" label="字典Label"></el-table-column>
        <el-table-column prop="dictValue" label="字典Value"></el-table-column>
        <el-table-column prop="sortNum" label="字典排序"></el-table-column>
        <el-table-column prop="status" label="是否启用">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0">正常</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column v-permissions="['system:dict-detail:edit', 'system:dict-detail:del']" label="操作" width="200">
          <template #default="{ row }">
            <el-button v-permissions="['system:dict-detail:edit']" text type="primary" @click="onRowUpdate(row)">修改</el-button>
            <el-button v-permissions="['system:dict-detail:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
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

    <dict-detail-edit-dialog ref="refDictDetailEditDialog" @complete="onRefresh" />
    <import-dialog
      ref="refImportDialog"
      :req-data="{
        dictId,
        dictKey
      }"
      upload-url="/api/system/dict-detail/import"
      tpl-export-url="/api/system/dict-detail/export-template"
      @complete="onRefresh"
    />
  </el-drawer>
</template>

<style scoped lang="scss">

</style>
