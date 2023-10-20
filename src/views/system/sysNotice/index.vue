<script setup lang="ts">
import SysNoticeEditDialog from "@/views/system/sysNotice/SysNoticeEditDialog.vue";
import SysNoticeViewDialog from "@/views/system/sysNotice/SysNoticeViewDialog.vue";
import {onMounted, ref} from "vue";
import {batchDel, page} from "@/api/system/sysNotice";
import {download} from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import {Refresh, Search} from "@element-plus/icons-vue";
import {enumsParseLabel, NoticeTypeEnums} from '@/utils/enums'

const DEFAULT_QUERY_PARAMS = {
  title: null,
  type: null,
  status: null,
  page: 1,
  size: 10,
  sort: ['create_time,desc']
}

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const isQueryShow = ref(true)
const multipleDisabled = ref(true)

const refTable = ref(null)
const refSysNoticeEditDialog = ref(null)
const refSysNoticeViewDialog = ref(null)

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
  queryParams.value = { ...DEFAULT_QUERY_PARAMS }
  onQuery()
}

function onAdd() {
  refSysNoticeEditDialog.value.open({
    status: 0
  })
}

function onExport() {
  download('/api/system/sysNotice/export', queryParams.value, `通知公告_${new Date().getTime()}.xlsx`)
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
  refSysNoticeEditDialog.value.open(row)
}

function onRowDelete(row) {
  ElMessageBox.confirm(`确认要删除"${ row.title }"吗？`, '提示', {
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

function onRowDetail(row) {
  refSysNoticeViewDialog.value.open(row)
}

function parseRowType(row) {
  return enumsParseLabel(NoticeTypeEnums, row.type, '')
}

function onSortComplete() {
  queryParams.value.page = DEFAULT_QUERY_PARAMS.page
  onQuery()
}

</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper :show="isQueryShow">
        <el-form :model="queryParams" :inline="true">
          <el-form-item label="标题" prop="title">
            <el-input v-model="queryParams.title" placeholder="请输入标题" clearable />
          </el-form-item>
          <el-form-item label="公告类型" prop="type">
            <el-select v-model="queryParams.type" placeholder="请选择公告类型" clearable filterable>
              <el-option v-for="item in NoticeTypeEnums" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="公告状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择公告状态" clearable filterable>
              <el-option label="正常" :value="0" />
              <el-option label="禁用" :value="1" />
            </el-select>
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
            import: false
          }"
          :permission="{
            add: ['system:sysNotice:add'],
            del: ['system:sysNotice:del'],
            export: ['system:sysNotice:export'],
          }"
          v-model:sort="queryParams.sort"
          v-model:searchToggle="isQueryShow"
          :ref-table="refTable"
          @add="onAdd"
          @batchDel="onBatchDel"
          @export="onExport"
          @refresh="onRefresh"
          @sort="onSortComplete"
        />
        <el-table
          ref="refTable"
          :data="list"
          @selection-change="onSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="title" label="标题"></el-table-column>
          <el-table-column prop="type" label="公告类型">
            <template #default="{ row }">
              <el-tag>{{ parseRowType(row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="公告描述"></el-table-column>
          <el-table-column prop="status" label="公告状态">
            <template #default="{ row }">
              <el-tag v-if="row.status === 0">正常</el-tag>
              <el-tag v-else type="danger">禁用</el-tag>
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
        <pagination
          v-model:page="queryParams.page"
          v-model:limit="queryParams.size"
          :total="total"
          @pagination="onQuery"
        />
      </div>
    </div>

    <sys-notice-edit-dialog ref="refSysNoticeEditDialog" @complete="onRefresh" />
    <sys-notice-view-dialog ref="refSysNoticeViewDialog" />

  </div>
</template>

<style scoped lang="scss">

</style>
