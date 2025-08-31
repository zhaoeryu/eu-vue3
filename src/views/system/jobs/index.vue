<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { TableInstance } from 'element-plus';
import { onMounted, useTemplateRef } from 'vue';

import { page, batchDel, execJob, pauseOrResume } from '@/api/system/job';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { Jobs } from '@/types/system/jobs';
import { download } from '@/utils/request';
import JobEditDialog from '@/views/system/jobs/JobEditDialog.vue';
import JobLog from '@/views/system/jobs/JobLog.vue';

const refJobEditDialog = useTemplateRef<InstanceType<typeof JobEditDialog>>('refJobEditDialog');
const refJobLog = useTemplateRef<InstanceType<typeof JobLog>>('refJobLog');
const refTable = useTemplateRef<TableInstance>('refTable');
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  isQueryShow: true,
  multipleDisabled: true,
  queryParams: {
    jobName: null,

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
  refJobEditDialog.value?.open({} as Jobs);
}

function onExport() {
  download('/api/system/job/export', state.queryParams, `job_${new Date().getTime()}.xlsx`);
}

function onBatchDel() {
  const ids = refTable.value?.getSelectionRows().map((item) => item.id) ?? [];
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

function onSelectionChange(selection: Jobs[]) {
  state.multipleDisabled = !selection.length;
}

function onRowUpdate(row: Jobs) {
  refJobEditDialog.value?.open(row);
}

function onRowDelete(row: Jobs) {
  ElMessageBox.confirm(`确认要删除"${row.jobName}"吗？`, '提示', {
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

function onRowRun(row: Jobs) {
  ElMessageBox.confirm(`确认要立即执行吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        execJob(row.id)
          .then(() => {
            ElMessage.success('执行成功');
            done();
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

function onStatusChange(row: Jobs) {
  const status = row.status;
  ElMessageBox.confirm(`确认要${status === 0 ? '暂停' : '恢复'}"${row.jobName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        pauseOrResume(row)
          .then(() => {
            ElMessage.success(`${status === 0 ? '暂停' : '恢复'}成功`);
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

function onRowLog(row: Jobs) {
  refJobLog.value?.open(row);
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
          <el-form-item label="任务名称">
            <el-input
              v-model="state.queryParams.jobName"
              placeholder="输入要查找的任务名称"
            />
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
            export: false,
            import: false,
            sort: false,
          }"
          :permission="{
            add: ['system:job:add'],
            del: ['system:job:del'],
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
            prop="jobName"
            label="任务名称"
          ></el-table-column>
          <el-table-column
            prop="jobGroup"
            label="任务分组"
          ></el-table-column>
          <el-table-column
            prop="cron"
            label="cron"
          ></el-table-column>
          <el-table-column label="执行类">
            <template #default="{ row }">
              <span v-if="row.invokeClassName">{{ row.invokeClassName }}</span>
              <span v-else>[Spring] {{ row.springBeanName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="methodName"
            label="执行方法"
          >
            <template #default="{ row }">
              <span>{{ row.methodName }}</span>
              <template v-if="row.methodParams">
                <span>( {{ row.methodParams }} )</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
          >
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="0"
                :inactive-value="1"
                @change="onStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-permissions="['system:job:run', 'system:job-log:list', 'system:job:edit', 'system:job:del']"
            label="操作"
            width="200"
          >
            <template #default="{ row }">
              <el-button
                v-permissions="['system:job:run']"
                text
                type="primary"
                @click="onRowRun(row)"
              >立即执行</el-button>
              <el-button
                v-permissions="['system:job-log:list']"
                text
                type="primary"
                @click="onRowLog(row)"
              >日志</el-button>
              <el-button
                v-permissions="['system:job:edit']"
                text
                type="primary"
                @click="onRowUpdate(row)"
              >修改</el-button>
              <el-button
                v-permissions="['system:job:del']"
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

    <job-edit-dialog
      ref="refJobEditDialog"
      @complete="onRefresh"
    />

    <job-log ref="refJobLog" />
  </div>
</template>

<style scoped lang="scss"></style>
