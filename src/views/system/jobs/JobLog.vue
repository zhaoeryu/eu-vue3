<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Download, Refresh, Search } from '@element-plus/icons-vue';

import { download } from '@/utils/request';
import { batchDel, page } from '@/api/system/jobLog';
import useVisible from '@/hooks/visible';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { Jobs, JobLog } from '@/types/system/jobs';

const { visible, setVisible } = useVisible(false);
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  queryParams: {
    jobId: null,
    startTime: null,
    endTime: null,
    page: 1,
    size: 10,
    sort: ['create_time,desc'],
  },

  raw: {} as Jobs,
});

const shortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 1000 * 24);
      return date;
    },
  },
  {
    text: '一周前',
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
      return date;
    },
  },
];

const title = computed(() => {
  return `执行日志 - ${state.raw.jobName}`;
});

function open(_job: Jobs) {
  reset();
  state.raw = _job;
  setVisible(true);

  onRefresh();
}

function onRefresh() {
  reset('queryParams');
  onQuery();
}

function onQuery() {
  setLoading(true);
  state.queryParams.jobId = state.raw.id;
  page(state.queryParams)
    .then((res) => {
      state.list = res.data.records;
      state.total = res.data.total;
    })
    .finally(() => {
      setLoading(false);
    });
}

function onExport() {
  download('/api/system/job-log/export', state.queryParams, `jobLog_${new Date().getTime()}.xlsx`);
}

function onRowDelete(row: JobLog) {
  ElMessageBox.confirm(`确认要删除"${row.id}"吗？`, '提示', {
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

defineExpose({
  open,
});
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="1200px" top="7vh">
    <div class="query-wrapper">
      <el-form :model="state.queryParams" :inline="true">
        <el-form-item label="执行时间">
          <el-date-picker v-model="state.queryParams.startTime" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DD HH:mm:ss" :shortcuts="shortcuts"> </el-date-picker>
          <span> ~ </span>
          <el-date-picker v-model="state.queryParams.endTime" type="datetime" placeholder="选择结束时间" value-format="YYYY-MM-DD HH:mm:ss" :shortcuts="shortcuts"> </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
          <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
        </el-form-item>
      </el-form>
      <div>
        <el-button v-permissions="['system:job-log:export']" type="warning" :icon="Download" plain @click="onExport">导出 </el-button>
      </div>
    </div>
    <div v-loading="loading">
      <el-table :data="state.list" style="width: 100%">
        <el-table-column prop="id" label="ID" width="160"></el-table-column>
        <el-table-column prop="jobName" label="任务名称"></el-table-column>
        <el-table-column label="执行类">
          <template #default="{ row }">
            <span v-if="row.invokeClassName">{{ row.invokeClassName }}</span>
            <span v-else>[Spring] {{ row.springBeanName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="methodName" label="执行方法">
          <template #default="{ row }">
            <span>{{ row.methodName }}</span>
            <template v-if="row.methodParams">
              <span>( {{ row.methodParams }} )</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="success" label="执行结果">
          <template #default="{ row }">
            <el-tag v-if="row.success" type="success">成功</el-tag>
            <el-tag v-else type="danger">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行时间" width="280">
          <template #default="{ row }">
            <span>{{ row.startTime }} ~ {{ row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="执行时长">
          <template #default="{ row }">
            <span>{{ row.execTime }}ms</span>
          </template>
        </el-table-column>
        <el-table-column v-permissions="['system:job-log:del']" label="操作">
          <template #default="{ row }">
            <el-button v-permissions="['system:job-log:del']" text type="primary" @click="onRowDelete(row)">删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-model:page="state.queryParams.page" v-model:limit="state.queryParams.size" :total="state.total" @pagination="onQuery" />
    </div>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
