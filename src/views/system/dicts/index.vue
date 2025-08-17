<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Search } from '@element-plus/icons-vue';
import type { TableInstance } from 'element-plus';

import DictDetailDrawer from '@/views/system/dicts/DictDetailDrawer.vue';
import DictEditDialog from '@/views/system/dicts/DictEditDialog.vue';
import { page, batchDel } from '@/api/system/dict';
import { download } from '@/utils/request';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import ImportDialog from '@/components/ImportDialog.vue';
import type { Dict } from '@/types/system/dict';
import { EnableFlagEnums } from '@/utils/enums';

const refDictEditDialog = useTemplateRef('refDictEditDialog');
const refDetailDrawer = useTemplateRef('refDetailDrawer');
const refTable = useTemplateRef<TableInstance>('refTable');
const refImportDialog = useTemplateRef<InstanceType<typeof ImportDialog>>('refImportDialog');
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    dictKey: null,

    page: 1,
    size: 10,
    sort: [],
  },
});

onMounted(() => {
  onRefresh();
});

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

function onAdd() {
  refDictEditDialog.value?.open({} as Dict);
}

function onExport() {
  download('/api/system/dict/export', state.queryParams, `dict_${new Date().getTime()}.xlsx`);
}

function onImport() {
  refImportDialog.value?.open();
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

function onSelectionChange(selection: Dict[]) {
  state.multipleDisabled = !selection.length;
}

function onRowDetail(row: Dict) {
  refDetailDrawer.value?.open(row.id, row.dictKey);
}

function onRowUpdate(row: Dict) {
  refDictEditDialog.value?.open(row);
}

function onRowDelete(row: Dict) {
  ElMessageBox.confirm(`确认要删除"${row.dictKey}"吗？`, '提示', {
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
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper :show="state.isQueryShow">
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item label="字典KEY" prop="dictKey">
            <el-input v-model="state.queryParams.dictKey" placeholder="输入要查找的字典KEY" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
            <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
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
            add: ['system:dict:add'],
            del: ['system:dict:del'],
            export: ['system:dict:export'],
            import: ['system:dict:import'],
          }"
          :ref-table="refTable"
          @add="onAdd"
          @batch-del="onBatchDel"
          @export="onExport"
          @import="onImport"
          @refresh="onRefresh"
        />
        <el-table ref="refTable" :data="state.list" style="width: 100%" @selection-change="onSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="dictKey" label="字典KEY"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column prop="status" label="是否启用">
            <template #default="{ row }">
              <enum-tag :value="row.status" :enums="EnableFlagEnums" />
            </template>
          </el-table-column>
          <el-table-column v-permissions="['system:dict-detail:list', 'system:dict:edit', 'system:dict:del']" label="操作" width="200">
            <template #default="{ row }">
              <el-button v-permissions="['system:dict-detail:list']" text type="primary" @click="onRowDetail(row)">详情 </el-button>
              <el-button v-permissions="['system:dict:edit']" text type="primary" @click="onRowUpdate(row)">修改</el-button>
              <el-button v-permissions="['system:dict:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-model:page="state.queryParams.page" v-model:limit="state.queryParams.size" :total="state.total" @pagination="onQuery" />
      </div>
    </div>

    <dict-edit-dialog ref="refDictEditDialog" @complete="onRefresh" />
    <dict-detail-drawer ref="refDetailDrawer" />

    <import-dialog ref="refImportDialog" upload-url="/api/system/dict/import" tpl-export-url="/api/system/dict/export-template" @complete="onRefresh" />
  </div>
</template>

<style scoped lang="scss"></style>
