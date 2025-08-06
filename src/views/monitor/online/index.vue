<script setup lang="ts">
import {Refresh, Search} from "@element-plus/icons-vue";
import { onlineList, onlineKickout, onlineLogout } from '@/api/system/user'
import {onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import useLoading from "@/hooks/loading";
import {useResettableReactive} from "@/hooks/resettable";
import type {Online} from "@/types/system/online";

const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  list: [],
  total: 0,
  isQueryShow: true,
  queryParams: {
    nickname: null,

    page: 1,
    size: 10,
    sort: [],
  },
})

onMounted(() => {
  onRefresh()
})

function onQuery() {
  setLoading(true)
  onlineList(state.queryParams).then(res => {
    state.list = res.data.records
    state.total = res.data.total
  }).finally(() => {
    setLoading(false)
  })
}

function onRefresh() {
  reset('queryParams')
  onQuery()
}

function onLogout(row: Online) {
  ElMessageBox.confirm(`确认要强制注销"${ row.username }"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        onlineLogout(row.id).then(() => {
          ElMessage.success('强制注销Ta下线成功')
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

function onKictout(row: Online) {
  ElMessageBox.confirm(`确认要踢"${ row.username }"下线吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        onlineKickout(row.id).then(() => {
          ElMessage.success('踢Ta下线成功')
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

</script>

<template>
  <div class="page-container">
    <div class="page-body">
      <div class="query-wrapper">
        <el-form :model="state.queryParams" :inline="true">
          <el-form-item label="用户昵称">
            <el-input v-model="state.queryParams.nickname" placeholder="输入要查找的用户昵称" />
          </el-form-item>
        </el-form>
        <div>
          <el-button type="primary" :icon="Search" @click="onQuery">查询</el-button>
          <el-button :icon="Refresh" plain @click="onRefresh">重置</el-button>
        </div>
      </div>
      <el-divider />
      <div v-loading="loading">
        <el-table
          :data="state.list"
          style="width: 100%"
        >
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="username" label="登录名"></el-table-column>
          <el-table-column prop="nickname" label="用户昵称"></el-table-column>
          <el-table-column prop="deptName" label="部门"></el-table-column>
          <el-table-column prop="loginIp" label="登录IP"></el-table-column>
          <el-table-column prop="loginRegion" label="登录地点"></el-table-column>
          <el-table-column prop="loginTime" label="登录时间" width="150"></el-table-column>
          <el-table-column prop="browser" label="浏览器"></el-table-column>
          <el-table-column prop="os" label="操作系统"></el-table-column>
          <el-table-column v-permissions="['monitor:online:logout', 'monitor:online:kickout']" label="操作" fixed="right" width="140">
            <template #default="{ row }">
              <el-button v-permissions="['monitor:online:logout']" text type="primary" @click="onLogout(row)">强制注销</el-button>
              <el-button v-permissions="['monitor:online:kickout']" text type="primary" @click="onKictout(row)">踢Ta下线</el-button>
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
  </div>
</template>

<style scoped lang="scss">

</style>
