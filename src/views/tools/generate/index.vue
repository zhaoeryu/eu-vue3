<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, useTemplateRef } from 'vue';

import { page, syncTable } from '@/api/system/generate';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { GenerateTable } from '@/types/system/generate';
import { download } from '@/utils/request';
import GeneratePreview from '@/views/tools/generate/GeneratePreview.vue';
import GenerateSettingDrawer from '@/views/tools/generate/GenerateSettingDrawer/index.vue';

type GenerateRow = GenerateTable & {
  _genLoading: boolean;
};

const refGeneratePreview = useTemplateRef<InstanceType<typeof GeneratePreview>>('refGeneratePreview');
const refGenerateSettingDrawer = useTemplateRef<InstanceType<typeof GenerateSettingDrawer>>('refGenerateSettingDrawer');
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [] as GenerateRow[],
  total: 0,
  isQueryShow: true,
  queryParams: {
    tableName: null,
    tableComment: null,

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
      state.list = res.data.records.map((item) => {
        return {
          ...item,
          _genLoading: false,
        } as GenerateRow;
      });
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

function onRowPreview(row: GenerateRow) {
  refGeneratePreview.value?.open(row);
}

function onRowSetting(row: GenerateRow) {
  refGenerateSettingDrawer.value?.open(row);
}

function onRowSync(row: GenerateRow) {
  ElMessageBox.confirm('同步后会覆盖已配置信息，确定要同步吗？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        syncTable({
          tableName: row.tableName,
        })
          .then(() => {
            ElMessage.success('同步成功');
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

function onRowGen(row: GenerateRow) {
  row._genLoading = true;
  download(
    '/api/gen/gen',
    {
      tableName: row.tableName,
    },
    `${row.tableName}.zip`,
  ).finally(() => {
    row._genLoading = false;
  });
}
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper>
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item label="表名称">
            <el-input v-model="state.queryParams.tableName" placeholder="输入要查找的表名称" clearable />
          </el-form-item>
          <el-form-item label="表描述">
            <el-input v-model="state.queryParams.tableComment" placeholder="输入要查找的表描述" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
            <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
          </el-form-item>
        </el-form>
      </query-expand-wrapper>
      <div v-loading="loading">
        <el-table ref="table" :data="state.list" style="width: 100%">
          <el-table-column prop="tableName" label="表名称"></el-table-column>
          <el-table-column prop="tableComment" label="表描述"></el-table-column>
          <el-table-column prop="createTime" label="表创建时间"></el-table-column>
          <el-table-column prop="updateTime" label="最近一次更新"></el-table-column>
          <el-table-column v-permissions="['tools:generate:preview', 'tools:generate:config', 'tools:generate:sync', 'tools:generate:generate']" label="操作" width="260">
            <template #default="{ row }">
              <el-button v-permissions="['tools:generate:preview']" text type="primary" @click="onRowPreview(row)">预览</el-button>
              <el-button v-permissions="['tools:generate:config']" text type="primary" @click="onRowSetting(row)">配置</el-button>
              <el-button v-permissions="['tools:generate:sync']" text type="primary" @click="onRowSync(row)">同步</el-button>
              <el-button v-permissions="['tools:generate:generate']" text type="primary" :loading="row._genLoading" @click="onRowGen(row)">生成</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-model:page="state.queryParams.page" v-model:limit="state.queryParams.size" :total="state.total" @pagination="onQuery" />
      </div>
    </div>

    <generate-preview ref="refGeneratePreview" />
    <generate-setting-drawer ref="refGenerateSettingDrawer" />
  </div>
</template>

<style scoped lang="scss"></style>
