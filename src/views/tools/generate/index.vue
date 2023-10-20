<script setup lang="ts">
import { page, syncTable } from '@/api/system/generate'
import GeneratePreview from '@/views/tools/generate/GeneratePreview.vue'
import GenerateSettingDrawer from '@/views/tools/generate/GenerateSettingDrawer.vue'
import {onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {download} from "@/utils/request";
import {Refresh, Search} from "@element-plus/icons-vue";

const DEFAULT_QUERY_PARAMS = {
  tableName: null,
  tableComment: null,
  page: 1,
  size: 10
}

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = ref(DEFAULT_QUERY_PARAMS)

const refGeneratePreview = ref(null)
const refGenerateSettingDrawer = ref(null)

onMounted(() => {
  onRefresh()
})

function onQuery() {
  loading.value = true
  page(queryParams.value).then(res => {
    list.value = res.data.records.map(item => {
      item._genLoading = false
      return item
    })
    total.value = res.data.total
  }).finally(() => {
    loading.value = false
  })
}

function onRefresh() {
  queryParams.value = { ...DEFAULT_QUERY_PARAMS }
  onQuery()
}

function onRowPreview(row) {
  refGeneratePreview.value.open(row)
}

function onRowSetting(row) {
  refGenerateSettingDrawer.value.open(row)
}

function onRowSync(row) {
  ElMessageBox.confirm('同步后会覆盖已配置信息，确定要同步吗？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        syncTable({
          tableName: row.tableName,
        }).then(() => {
          ElMessage.success('同步成功')
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

function onRowGen(row) {
  download('/api/gen/gen', {
    tableName: row.tableName
  }, `${row.tableName}.zip`)
}
</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <query-expand-wrapper>
        <el-form :model="queryParams" :inline="true">
          <el-form-item label="表名称">
            <el-input v-model="queryParams.tableName" placeholder="输入要查找的表名称" clearable />
          </el-form-item>
          <el-form-item label="表描述">
            <el-input v-model="queryParams.tableComment" placeholder="输入要查找的表描述" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
            <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
          </el-form-item>
        </el-form>
      </query-expand-wrapper>
      <div v-loading="loading">
        <el-table
          ref="table"
          :data="list"
          style="width: 100%"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="tableName" label="表名称"></el-table-column>
          <el-table-column prop="tableComment" label="表描述"></el-table-column>
          <el-table-column prop="createTime" label="表创建时间"></el-table-column>
          <el-table-column prop="updateTime" label="最近一次更新"></el-table-column>
          <el-table-column
            v-permissions="['tools:generate:preview', 'tools:generate:config', 'tools:generate:sync', 'tools:generate:generate']"
            label="操作"
            width="260"
          >
            <template #default="{ row }">
              <el-button v-permissions="['tools:generate:preview']" text type="primary" @click="onRowPreview(row)">预览</el-button>
              <el-button v-permissions="['tools:generate:config']" text type="primary" @click="onRowSetting(row)">配置</el-button>
              <el-button v-permissions="['tools:generate:sync']" text type="primary" @click="onRowSync(row)">同步</el-button>
              <el-button v-permissions="['tools:generate:generate']" text type="primary" :loading="row._genLoading" @click="onRowGen(row)">生成</el-button>
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

    <generate-preview ref="refGeneratePreview" />
    <generate-setting-drawer ref="refGenerateSettingDrawer" />
  </div>
</template>

<style scoped lang="scss">

</style>
