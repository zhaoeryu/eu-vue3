<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { Refresh, Search } from '@element-plus/icons-vue';
import type { TableInstance } from 'element-plus';

import { page } from '@/api/system/sysOperLog';
import { BusinessTypeEnums } from '@/utils/enums';
import { download } from '@/utils/request';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import EnumSelect from '@/components/EnumSelect.vue';
import EnumTag from '@/components/EnumTag.vue';

const DEFAULT_PAGE = {
  page: 1,
  size: 10,
  sort: ['create_time,desc'],
};

const refTable = useTemplateRef<TableInstance>('refTable');
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  isQueryShow: true,
  queryParams: {
    title: null,
    businessType: null,
    operName: null,
    reqUrl: null,
    status: null,

    ...DEFAULT_PAGE,
  },

  errorStackDialog: {
    show: false,
    content: null as string | null,
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

function onExport() {
  download('/api/system/sysOperLog/export', state.queryParams, `操作日志_${new Date().getTime()}.xlsx`);
}

function onRowStackView(row: { errorStack: string | null }) {
  state.errorStackDialog.show = true;
  state.errorStackDialog.content = row.errorStack;
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
          <el-form-item label="操作模块" prop="title">
            <el-input v-model="state.queryParams.title" placeholder="请输入操作模块" clearable />
          </el-form-item>
          <el-form-item label="业务类型" prop="businessType">
            <enum-select v-model="state.queryParams.businessType" :enums="BusinessTypeEnums" placeholder="请选择业务类型" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="操作人名称" prop="operName">
            <el-input v-model="state.queryParams.operName" placeholder="请输入操作人名称" clearable />
          </el-form-item>
          <el-form-item label="操作状态" prop="status">
            <el-select v-model="state.queryParams.status" placeholder="请选择操作状态" clearable style="width: 150px">
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
          v-model:sort="state.queryParams.sort"
          v-model:search-toggle="state.isQueryShow"
          :opt-show="{
            add: false,
            del: false,
            import: false,
          }"
          :permission="{
            export: ['system:operLog:export'],
          }"
          :ref-table="refTable"
          @export="onExport"
          @refresh="onRefresh"
          @sort="onSortComplete"
        />
        <el-table ref="refTable" :data="state.list" style="width: 100%">
          <el-table-column type="index" label="#" />
          <el-table-column type="expand">
            <template #default="{ row }">
              <div style="padding-top: 20px; line-height: 1.75rem">
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
                    <el-button style="margin-left: 16px" icon="el-icon-view" type="primary" text @click="onRowStackView(row)">查看异常堆栈</el-button>
                  </el-col>
                </el-row>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作模块" prop="title" min-width="140" />
          <el-table-column label="业务类型" prop="businessType" min-width="100">
            <template #default="{ row }">
              <enum-tag :value="row.businessType" :enums="BusinessTypeEnums" />
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
        <pagination v-model:page="state.queryParams.page" v-model:limit="state.queryParams.size" :total="state.total" @pagination="onQuery" />
      </div>
    </div>

    <el-dialog v-model="state.errorStackDialog.show" title="异常堆栈" width="80%" top="7vh">
      <pre class="p-4 text-gray-400 text-xs" style="white-space: pre-wrap">{{ state.errorStackDialog.content || '暂无堆栈信息' }}</pre>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.el-divider--horizontal {
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
