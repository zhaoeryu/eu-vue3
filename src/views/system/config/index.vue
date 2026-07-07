<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { TableInstance } from 'element-plus';
import { onMounted, useTemplateRef } from 'vue';

import { batchDel, page } from '@/api/system/config';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { SysConfig } from '@/types/system/config';
import { download } from '@/utils/request';
import ConfigEditDialog from '@/views/system/config/ConfigEditDialog.vue';

const refConfigEditDialog = useTemplateRef<InstanceType<typeof ConfigEditDialog>>('refConfigEditDialog');
const refTable = useTemplateRef<TableInstance>('refTable');
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    configName: null,
    configKey: null,
    configType: null,

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
  refConfigEditDialog.value?.open({} as SysConfig);
}

function onExport() {
  download('/api/system/config/export', state.queryParams, `config_${new Date().getTime()}.xlsx`);
}

function onBatchDel() {
  const ids = refTable.value?.getSelectionRows().map((item) => item.configId) ?? [];
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

function onSelectionChange(selection: SysConfig[]) {
  state.multipleDisabled = !selection.length;
}

function onRowUpdate(row: SysConfig) {
  refConfigEditDialog.value?.open(row);
}

function onRowDelete(row: SysConfig) {
  ElMessageBox.confirm(`确认要删除"${row.configName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        batchDel([row.configId])
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
        <el-form
          :model="state.queryParams"
          :inline="true"
        >
          <el-form-item label="参数名称">
            <el-input
              v-model="state.queryParams.configName"
              placeholder="输入要查找的参数名称"
            />
          </el-form-item>
          <el-form-item label="参数键名">
            <el-input
              v-model="state.queryParams.configKey"
              placeholder="输入要查找的参数键名"
            />
          </el-form-item>
          <el-form-item label="系统内置">
            <el-select
              v-model="state.queryParams.configType"
              placeholder="请选择"
              clearable
              style="width: 120px"
            >
              <el-option label="是" value="Y" />
              <el-option label="否" value="N" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="Search"
              @click="onQuery"
            >查询</el-button>
            <el-button
              :icon="Refresh"
              plain
              @click="onRefresh"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </query-expand-wrapper>
      <div v-loading="loading">
        <eu-table-toolbar
          v-model:search-toggle="state.isQueryShow"
          :multiple-disabled="state.multipleDisabled"
          :opt-show="{
            sort: false,
            import: false,
          }"
          :permission="{
            add: ['system:config:add'],
            del: ['system:config:del'],
            export: ['system:config:export'],
          }"
          :ref-table="refTable"
          @add="onAdd"
          @batch-del="onBatchDel"
          @export="onExport"
          @refresh="onRefresh"
        />
        <el-table
          ref="refTable"
          :data="state.list"
          style="width: 100%"
          @selection-change="onSelectionChange"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column
            prop="configName"
            label="参数名称"
          ></el-table-column>
          <el-table-column
            prop="configKey"
            label="参数键名"
          ></el-table-column>
          <el-table-column
            prop="configValue"
            label="参数键值"
          ></el-table-column>
          <el-table-column
            prop="configType"
            label="系统内置"
          >
            <template #default="{ row }">
              <el-tag v-if="row.configType === 'Y'" type="success">是</el-tag>
              <el-tag v-else type="info">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="remark"
            label="备注"
          ></el-table-column>
          <el-table-column
            v-permissions="['system:config:edit', 'system:config:del']"
            label="操作"
          >
            <template #default="{ row }">
              <el-button
                v-permissions="['system:config:edit']"
                text
                type="primary"
                @click="onRowUpdate(row)"
              >修改</el-button>
              <el-button
                v-if="row.configType !== 'Y'"
                v-permissions="['system:config:del']"
                text
                type="primary"
                @click="onRowDelete(row)"
              >删除</el-button>
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

    <config-edit-dialog
      ref="refConfigEditDialog"
      @complete="onRefresh"
    />
  </div>
</template>

<style scoped lang="scss"></style>
