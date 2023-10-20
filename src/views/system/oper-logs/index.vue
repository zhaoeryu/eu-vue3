<script setup lang="ts">
import { page } from '@/api/system/sysOperLog'
import {BusinessTypeEnums, enumsConvertToList, enumsParseLabel} from '@/utils/enums'
import {computed, onMounted, ref} from "vue";
import {download} from "@/utils/request";
import {Refresh, Search} from "@element-plus/icons-vue";

const DEFAULT_QUERY_PARAMS = {
  page: 1,
  size: 10,
  sort: ['create_time,desc'],
  title: null,
  businessType: null,
  operName: null,
  reqUrl: null,
  status: null,
}

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = ref(DEFAULT_QUERY_PARAMS)
const isQueryShow = ref(true)
const errorStackDialog = ref({
  show: false,
  content: null
})

const refTable = ref(null)

const businessTypeList = computed(() => {
  return enumsConvertToList(BusinessTypeEnums)
})

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

function onExport() {
  download('/api/system/sysOperLog/export', queryParams.value, `操作日志_${new Date().getTime()}.xlsx`)
}

function onRowStackView(row) {
  errorStackDialog.value.show = true
  errorStackDialog.value.content = row.errorStack
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
          <el-form-item label="操作模块" prop="title">
            <el-input v-model="queryParams.title" placeholder="请输入操作模块" clearable />
          </el-form-item>
          <el-form-item label="业务类型" prop="businessType">
            <el-select v-model="queryParams.businessType" placeholder="请选择业务类型" clearable>
              <el-option v-for="item in businessTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作人名称" prop="operName">
            <el-input v-model="queryParams.operName" placeholder="请输入操作人名称" clearable />
          </el-form-item>
          <el-form-item label="操作状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择操作状态" clearable>
              <el-option label="成功" :value="0" />
              <el-option label="失败" :value="1" />
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
          :opt-show="{
            add: false,
            del: false,
            import: false
          }"
          :permission="{
            export: ['system:operLog:export']
          }"
          v-model:sort="queryParams.sort"
          v-model:searchToggle="isQueryShow"
          :ref-table="refTable"
          @export="onExport"
          @refresh="onRefresh"
          @sort="onSortComplete"
        />
        <el-table
          ref="refTable"
          :data="list"
          style="width: 100%"
        >
          <el-table-column type="index" label="#" />
          <el-table-column type="expand">
            <template #default="{ row }">
              <div style="padding-top: 20px;line-height: 1.75rem;">
                <el-row :gutter="16">
                  <el-col :span="2" class="text-gray-600">请求url：</el-col>
                  <el-col :span="22" class="text-gray-400">{{ row.reqUrl }}</el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="2" class="text-gray-600">HttpMethod：</el-col>
                  <el-col :span="22" class="text-gray-400">{{ row.reqMethod }}</el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="2" class="text-gray-600">请求参数：</el-col>
                  <el-col :span="22" class="text-gray-400">{{ row.reqParams }}</el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="2" class="text-gray-600">执行方法：</el-col>
                  <el-col :span="22" class="text-gray-400">{{ row.method }}</el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="2" class="text-gray-600">响应结果：</el-col>
                  <el-col :span="22" class="text-gray-400">{{ row.respResult }}</el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="2" class="text-gray-600">操作人部门：</el-col>
                  <el-col :span="22" class="text-gray-400">{{ row.deptName }}</el-col>
                </el-row>
                <el-row v-if="row.status === 1" :gutter="16">
                  <el-col :span="2" class="text-gray-600">异常消息：</el-col>
                  <el-col :span="22" class="text-gray-400">
                    <span>{{ row.errorMsg }}</span>
                    <el-button style="margin-left: 16px;" icon="el-icon-view" type="text" @click="onRowStackView(row)">查看异常堆栈</el-button>
                  </el-col>
                </el-row>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作模块" prop="title" min-width="140" />
          <el-table-column label="业务类型" prop="businessType" min-width="100">
            <template #default="{ row }">
              <el-tag type="info">{{ enumsParseLabel(BusinessTypeEnums, row.businessType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作人" prop="operName" min-width="70" />
          <el-table-column label="请求IP" prop="reqIp" min-width="100" />
          <el-table-column label="请求地域" prop="reqRegion" min-width="80" />
          <el-table-column label="浏览器" prop="browser" min-width="80" />
          <el-table-column label="操作系统" prop="os" min-width="80" />
          <el-table-column label="操作结果" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">{{ row.status === 0 ? '成功' : '失败' }}</el-tag>
              <span>&nbsp;{{ row.execTime / 1000 }} s</span>
            </template>
          </el-table-column>
          <el-table-column label="操作时间" prop="createTime" min-width="160" />
        </el-table>
        <pagination
          v-model:page="queryParams.page"
          v-model:limit="queryParams.size"
          :total="total"
          @pagination="onQuery"
        />
      </div>
    </div>

    <el-dialog title="异常堆栈" v-model="errorStackDialog.show" width="80%" top="7vh">
      <pre class="p-4 text-gray-400 text-xs whitespace-pre-wrap">{{ errorStackDialog.content || '暂无堆栈信息' }}</pre>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.el-divider--horizontal{
  margin-top: 0;
  margin-bottom: 18px;
}
.text-gray-600 {
  color: rgb(75 85 99);
}
.text-gray-400 {
  color: rgb(156 163 175);
}
</style>
