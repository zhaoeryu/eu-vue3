<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { ElMessage, ElMessageBox, type TableInstance } from 'element-plus';
import { Refresh, Search } from '@element-plus/icons-vue';

import SysNoticeEditDialog from '@/views/system/sysNotice/SysNoticeEditDialog.vue';
import SysNoticeViewDialog from '@/views/system/sysNotice/SysNoticeViewDialog.vue';
import { batchDel, page } from '@/api/system/sysNotice';
import { download } from '@/utils/request';
import { EnableFlagEnums, NoticeTypeEnums } from '@/utils/enums';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { Notice } from '@/types/system/notice';
import EnumTag from '@/components/EnumTag.vue';
import EnumSelect from '@/components/EnumSelect.vue';

const DEFAULT_PAGE = {
  page: 1,
  size: 10,
  sort: ['create_time,desc'],
};

const refSysNoticeEditDialog = useTemplateRef<InstanceType<typeof SysNoticeEditDialog>>('refSysNoticeEditDialog');
const refSysNoticeViewDialog = useTemplateRef<InstanceType<typeof SysNoticeViewDialog>>('refSysNoticeViewDialog');
const refTable = useTemplateRef<TableInstance>('refTable');
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [] as Notice,
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    title: null,
    type: null,
    status: null,

    ...DEFAULT_PAGE,
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
  refSysNoticeEditDialog.value?.open({
    status: EnableFlagEnums.ENABLE.value,
    type: NoticeTypeEnums.INFO.value,
  } as Notice);
}

function onExport() {
  download('/api/system/sysNotice/export', state.queryParams, `通知公告_${new Date().getTime()}.xlsx`);
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

function onSelectionChange(selection: Notice[]) {
  state.multipleDisabled = !selection.length;
}

function onRowUpdate(row: Notice) {
  refSysNoticeEditDialog.value?.open(row);
}

function onRowDelete(row: Notice) {
  ElMessageBox.confirm(`确认要删除"${row.title}"吗？`, '提示', {
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

function onRowDetail(row: Notice) {
  refSysNoticeViewDialog.value?.open(row);
}

function onSortComplete() {
  state.queryParams.page = DEFAULT_PAGE.page;
  onQuery();
}
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper :show="state.isQueryShow">
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item label="标题" prop="title">
            <el-input v-model="state.queryParams.title" placeholder="请输入标题" clearable />
          </el-form-item>
          <el-form-item label="公告类型" prop="type">
            <enum-select v-model="state.queryParams.type" placeholder="请选择公告类型" clearable :enums="NoticeTypeEnums" style="width: 200px" />
          </el-form-item>
          <el-form-item label="公告状态" prop="status">
            <enum-select v-model="state.queryParams.status" placeholder="请选择公告状态" clearable :enums="EnableFlagEnums" style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
            <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
          </el-form-item>
        </el-form>
      </query-expand-wrapper>
      <div v-loading="loading">
        <eu-table-toolbar
          v-model:sort="state.queryParams.sort"
          v-model:search-toggle="state.isQueryShow"
          :multiple-disabled="state.multipleDisabled"
          :opt-show="{
            import: false,
          }"
          :permission="{
            add: ['system:sysNotice:add'],
            del: ['system:sysNotice:del'],
            export: ['system:sysNotice:export'],
          }"
          :ref-table="refTable"
          @add="onAdd"
          @batch-del="onBatchDel"
          @export="onExport"
          @refresh="onRefresh"
          @sort="onSortComplete"
        />
        <el-table ref="refTable" :data="state.list" style="width: 100%" @selection-change="onSelectionChange">
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="title" label="标题"></el-table-column>
          <el-table-column prop="type" label="公告类型">
            <template #default="{ row }">
              <enum-tag :value="row.type" :enums="NoticeTypeEnums" />
            </template>
          </el-table-column>
          <el-table-column prop="description" label="公告描述"></el-table-column>
          <el-table-column prop="status" label="公告状态">
            <template #default="{ row }">
              <enum-tag :value="row.status" :enums="EnableFlagEnums" />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间"></el-table-column>
          <el-table-column prop="updateTime" label="修改时间"></el-table-column>
          <el-table-column v-permissions="['system:sysNotice:edit', 'system:sysNotice:del']" label="操作">
            <template #default="{ row }">
              <el-button v-permissions="['system:sysNotice:edit']" text type="primary" @click="onRowUpdate(row)">修改</el-button>
              <el-button v-permissions="['system:sysNotice:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
              <el-button text type="primary" @click="onRowDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-model:page="state.queryParams.page" v-model:limit="state.queryParams.size" :total="state.total" @pagination="onQuery" />
      </div>
    </div>

    <sys-notice-edit-dialog ref="refSysNoticeEditDialog" @complete="onRefresh" />
    <sys-notice-view-dialog ref="refSysNoticeViewDialog" />
  </div>
</template>

<style scoped lang="scss"></style>
