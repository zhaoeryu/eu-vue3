<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import type { PopoverInstance } from 'element-plus';
import { computed, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@/store';

defineOptions({
  name: 'SidebarHeader',
});

const userStore = useUserStore();
const router = useRouter();
const popoverRef = useTemplateRef<PopoverInstance>('popoverRef');

const deptNames = computed(() => {
  return (userStore.user.deptNames ?? []).join(' / ') || '暂无部门';
});

const user = computed(() => userStore.user);
const onLogout = () => {
  ElMessageBox.confirm('即将退出系统，是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        userStore
          .logout()
          .then(() => {
            done();
            location.reload();
          })
          .finally(() => {
            instance.confirmButtonLoading = false;
          });
      } else {
        done();
      }
    },
  });
};

function onToPersonal() {
  router.push('/personal-center');
  popoverRef.value?.hide();
}
</script>

<template>
  <el-popover
    ref="popoverRef"
    placement="bottom-start"
    width="230"
    :open-delay="0"
    :close-delay="50"
    trigger="click"
  >
    <template #reference>
      <eu-avatar
        :src="user.avatar"
        :nickname="user.nickname"
        :size="30"
      />
    </template>
    <div class="eu-pop-inner">
      <el-row>
        <el-col :span="24">
          <div>登录名：</div>
          <div>{{ user.username || '-' }}</div>
        </el-col>
        <el-col :span="24">
          <div>姓名：</div>
          <div>{{ user.nickname || '-' }}</div>
        </el-col>
        <el-col :span="24">
          <div>邮箱：</div>
          <div>{{ user.email || '-' }}</div>
        </el-col>
        <el-col :span="24">
          <div>部门：</div>
          <div>{{ deptNames || '-' }}</div>
        </el-col>
      </el-row>
      <el-divider direction="horizontal"></el-divider>
      <el-row style="display: flex">
        <el-col :span="11">
          <el-button
            text
            type="primary"
            style="width: 100%"
            @click="onToPersonal"
          >个人中心</el-button>
        </el-col>
        <el-col :span="2">
          <el-divider
            direction="vertical"
            content-position="center"
          ></el-divider>
        </el-col>
        <el-col :span="11">
          <el-button
            text
            type="primary"
            style="width: 100%"
            @click="onLogout"
          >退出登录</el-button>
        </el-col>
      </el-row>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.eu-pop-inner {
  background-color: var(--theme-nav-second-bg);
  color: var(--color-text-2);
}

.el-row {
  .el-col {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 2em;
  }
}

.el-divider--horizontal {
  margin: 12px 0;
}
</style>
