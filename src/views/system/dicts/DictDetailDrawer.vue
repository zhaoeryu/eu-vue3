<script setup lang="ts">
import { page, batchDel } from '@/api/system/dictDetail'
import ImportDialog from "@/components/ImportDialog.vue";
import DictDetailEditDialog from '@/views/system/dicts/DictDetailEditDialog.vue'
import {computed, useTemplateRef} from "vue";
import {download} from "@/utils/request";
import {ElMessage, ElMessageBox, type TableInstance} from "element-plus";
import {Refresh, Search} from "@element-plus/icons-vue";
import useVisible from "@/hooks/visible";
import useLoading from "@/hooks/loading";
import {useResettableReactive} from "@/hooks/resettable";
import type { DictDetail } from "@/types/system/dict";
import type {ANY_OBJECT} from "@/types/generic";
import {EnableFlagEnums} from "@/utils/enums";

type State = {
  dictId: number | null;
  dictKey: string | null;
} & Partial<ANY_OBJECT>

const refTable = useTemplateRef<TableInstance>('refTable')
const refDictDetailEditDialog = useTemplateRef('refDictDetailEditDialog')
const refImportDialog = useTemplateRef<InstanceType<typeof ImportDialog>>('refImportDialog')
const { visible, setVisible } = useVisible(false)
const { loading, setLoading } = useLoading(false)
const [state, reset] = useResettableReactive<State>({
  list: [],
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    pid: null,
    dictKey: null,

    page: 1,
    size: 10,
    sort: ['sort_num,asc']
  },

  dictId: null,
  dictKey: null,
})

const pageTitle = computed(() => {
  return `字典详情${state.dictKey ? ` - ${state.dictKey}` : ''}`
})

function open(_dictId: number, _dictKey: string) {
  reset()
  state.dictId = _dictId
  state.dictKey = _dictKey
  setVisible(true)
  onRefresh()
}

function onQuery() {
  setLoading(true)
  state.queryParams.pid = state.dictId
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
  refDictDetailEditDialog.value?.open({
    pid: state.dictId,
    dictKey: state.dictKey
  } as DictDetail)
}

function onExport() {
  download('/api/system/dict-detail/export', state.queryParams, `dictDetail_${new Date().getTime()}.xlsx`)
}

function onImport() {
  refImportDialog.value?.open()
}

function onSelectionChange(selection: DictDetail[]) {
  state.multipleDisabled = !selection.length
}

function onRowUpdate(row: DictDetail) {
  refDictDetailEditDialog.value?.open(row)
}

function onRowDelete(row: DictDetail) {
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

defineExpose({
  open
})
</script>

<template>
  <el-drawer
    :title="pageTitle"
    v-model="visible"
    size="800px"
    direction="rtl"
  >
    <query-expand-wrapper :show="state.isQueryShow">
      <el-form :model="state.queryParams" :inline="true">
        <el-form-item label="字典KEY" prop="dictKey">
          <el-input v-model="state.queryParams.dictKey" placeholder="输入要查找的字典KEY" maxlength="30" />
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
        v-model:searchToggle="state.isQueryShow"
      />
      <el-table
        ref="refTable"
        :data="state.list"
        @selection-change="onSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="dictLabel" label="字典Label"></el-table-column>
        <el-table-column prop="dictValue" label="字典Value"></el-table-column>
        <el-table-column prop="sortNum" label="字典排序"></el-table-column>
        <el-table-column prop="status" label="是否启用">
          <template #default="{ row }">
            <enum-tag :value="row.status" :enums="EnableFlagEnums" />
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
        v-model:page="state.queryParams.page"
        v-model:limit="state.queryParams.size"
        :total="state.total"
        @pagination="onQuery"
      />
    </div>

    <dict-detail-edit-dialog ref="refDictDetailEditDialog" @complete="onRefresh" />
    <import-dialog
      ref="refImportDialog"
      :req-data="{
        dictId: state.dictId,
        dictKey: state.dictKey
      }"
      upload-url="/api/system/dict-detail/import"
      tpl-export-url="/api/system/dict-detail/export-template"
      @complete="onRefresh"
    />
  </el-drawer>
</template>

<style scoped lang="scss">

</style>
