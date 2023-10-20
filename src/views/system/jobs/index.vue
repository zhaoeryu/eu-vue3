<script setup lang="ts">
import {onMounted, ref} from "vue";
import JobEditDialog from "@/views/system/jobs/JobEditDialog.vue";
import JobLog from "@/views/system/jobs/JobLog.vue";
import { page, batchDel, execJob, pauseOrResume } from '@/api/system/job'
import {download} from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import {Refresh, Search} from "@element-plus/icons-vue";

const DEFAULT_QUERY_PARAMS = {
  jobName: null,
  page: 1,
  size: 10,
}

const list = ref([])
const total = ref(0)
const loading = ref(false)
const isQueryShow = ref(true)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const multipleDisabled = ref(true)

const refTable = ref(null)
const refJobEditDialog = ref(null)
const refJobLog = ref(null)

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
  refJobEditDialog.value.open()
}

function onExport() {
  download('/api/system/job/export', queryParams.value, `job_${new Date().getTime()}.xlsx`)
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

function onRowUpdate(row) {
  refJobEditDialog.value.open(row)
}

function onRowDelete(row) {
  ElMessageBox.confirm(`确认要删除"${ row.jobName }"吗？`, '提示', {
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

function onRowRun(row) {
  ElMessageBox.confirm(`确认要立即执行吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        execJob(row.id).then(() => {
          ElMessage.success('执行成功')
          done()
        }).finally(() => {
          instance.confirmButtonLoading = false;
        })
      } else {
        done()
      }
    }
  });
}

function onStatusChange(row) {
  const status = row.status
  ElMessageBox.confirm(`确认要${status === 0 ? '暂停' : '恢复'}"${ row.jobName }"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        pauseOrResume(row).then(() => {
          ElMessage.success(`${status === 0 ? '暂停' : '恢复'}成功`)
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

function onRowLog(row) {
  refJobLog.value.open(row)
}
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper :show="isQueryShow">
        <el-form :model="queryParams" :inline="true">
          <el-form-item label="任务名称">
            <el-input v-model="queryParams.jobName" placeholder="输入要查找的任务名称" />
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
            export: false,
            import: false,
            sort: false
          }"
          :permission="{
            add: ['system:job:add'],
            del: ['system:job:del'],
          }"
          :ref-table="refTable"
          @add="onAdd"
          @batchDel="onBatchDel"
          @export="onExport"
          @refresh="onRefresh"
          v-model:searchToggle="isQueryShow"
        />
        <el-table
          ref="refTable"
          :data="list"
          @selection-change="onSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="jobName" label="任务名称"></el-table-column>
          <el-table-column prop="jobGroup" label="任务分组"></el-table-column>
          <el-table-column prop="cron" label="cron"></el-table-column>
          <!--        <el-table-column prop="misfirePolicy" label="执行策略">-->
          <!--          <template #default="{ row }">-->
          <!--            <el-tag v-if="row.misfirePolicy === 0">默认</el-tag>-->
          <!--            <el-tag v-else-if="row.misfirePolicy === 1" type="primary">立即触发执行</el-tag>-->
          <!--            <el-tag v-else-if="row.misfirePolicy === 2" type="primary">触发一次执行</el-tag>-->
          <!--            <el-tag v-else-if="row.misfirePolicy === 3" type="primary">不触发立即执行</el-tag>-->
          <!--          </template>-->
          <!--        </el-table-column>-->
          <!--        <el-table-column prop="concurrent" label="允许并发">-->
          <!--          <template #default="{ row }">-->
          <!--            <el-tag v-if="row.concurrent === 0">否</el-tag>-->
          <!--            <el-tag v-else-if="row.concurrent === 1" type="danger">是</el-tag>-->
          <!--          </template>-->
          <!--        </el-table-column>-->
          <el-table-column label="执行类">
            <template #default="{ row }">
              <span v-if="row.invokeClassName">{{ row.invokeClassName }}</span>
              <span v-else>[Spring] {{ row.springBeanName }}</span>
            </template>
          </el-table-column>
          <!--        <el-table-column prop="springBeanName" label="SpringBean"></el-table-column>-->
          <el-table-column prop="methodName" label="执行方法">
            <template #default="{ row }">
              <span>{{ row.methodName }}</span>
              <template v-if="row.methodParams">
                <span>( {{ row.methodParams }} )</span>
              </template>
            </template>
          </el-table-column>
          <!--        <el-table-column prop="pauseAfterFailure" label="失败后暂停">-->
          <!--          <template #default="{ row }">-->
          <!--            <el-tag v-if="row.pauseAfterFailure === 0">否</el-tag>-->
          <!--            <el-tag v-else-if="row.pauseAfterFailure === 1" type="danger">是</el-tag>-->
          <!--          </template>-->
          <!--        </el-table-column>-->
          <!--        <el-table-column prop="alarmEmail" label="告警邮箱"></el-table-column>-->
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="0" :inactive-value="1" @change="onStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column v-permissions="['system:job:run', 'system:job-log:list', 'system:job:edit', 'system:job:del']" label="操作" width="200">
            <template #default="{ row }">
              <el-button v-permissions="['system:job:run']" text type="primary" @click="onRowRun(row)">立即执行</el-button>
              <el-button v-permissions="['system:job-log:list']" text type="primary" @click="onRowLog(row)">日志</el-button>
              <el-button v-permissions="['system:job:edit']" text type="primary" @click="onRowUpdate(row)">修改</el-button>
              <el-button v-permissions="['system:job:del']" text type="primary" @click="onRowDelete(row)">删除</el-button>
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

    <job-edit-dialog ref="refJobEditDialog" @complete="onRefresh" />

    <job-log ref="refJobLog" />
  </div>
</template>

<style scoped lang="scss">

</style>
