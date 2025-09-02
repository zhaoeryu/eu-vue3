<script setup lang="ts">
import { computed } from 'vue';

import EuAvatar from '@/components/EuAvatar.vue';
import { useUserStore } from '@/store';
import { timeGreeting } from '@/utils';

const userStore = useUserStore();

const greetings = [
  '每天醒来都能感受到阳光的温暖和欢笑的洋溢，愿你的每一天都充满阳光和快乐！',
  '希望你的每一天都洋溢着无比的快乐，愿你的笑容始终灿烂如阳光！',
  '愿你每一天都充满喜悦和成功的味道，让每个日子都成为你生命中美好的记忆！',
  '愿你的每一天都充满希望和机遇，迎接新的挑战，创造更美好的明天！',
  '愿你每天都能享受生活的美好与快乐，让每分每秒都充满愉悦和满足！',
  '希望你的每一天都充满满满的幸福和爱，将快乐洒满身边的每个人！',
  '愿你的每一天都充满动力和勇气，实现自己的梦想和追求！',
  '祝福你每天都收获满满的笑声和欢乐，让快乐成为你生命中永恒的伴侣！',
  '希望你的每一天都是一个新的开始和充满无限可能的起点，创造属于你的辉煌！',
  '愿你的每一天都沐浴在幸福和成功的光芒中，享受生活带给你的一切美好！',
  '愿你每一天都有勇气面对挑战，有智慧解决问题，有力量追求梦想！',
  '希望你的每一天都充满爱和温暖，让身边的人感受到你的美好和关怀！',
  '愿你每天都能饱含热情和活力，迸发出无穷的创造力和惊人的成就！',
  '愿你的每一天都充满惊喜和好运，让幸福如影随形，时刻陪伴左右！',
  '希望你每天都能享受到生活中最美好的事物，将快乐扩散给身边的每个人！',
  '愿你每一天都充满和平与宁静，让内心的平静成为你最强大的力量！',
  '愿你的每一天都洋溢着微笑和希望，让快乐成为你生命中永恒的信仰！',
  '希望你的每一天都有无数的理由感到幸福和满足，享受生活中的点点滴滴！',
  '愿你每天都能散发出正能量和善意，将世界变得更加美好和温暖！',
  '希望你的每一天都充满成长和进步，勇敢迎接新的挑战，创造属于你的辉煌！',
  '愿你的每一天都洒满欢笑和欢乐，将快乐的种子撒向生活的每个角落！',
];

// 从数组中随机选择一条问候语
const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

const user = computed(() => userStore.user);
const greeting1 = computed(() => `${timeGreeting()}，${userStore.user.nickname || '用户'}`);
const greeting2 = computed(() => randomGreeting);
</script>

<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col
        :span="18"
        :xs="24"
      >
        <div class="statistics-overview">
          <div class="statistics-overview-header">
            <div class="statistics-overview-header__body">
              <eu-avatar
                v-if="user"
                shape="circle"
                :size="72"
                :font-size="28"
                src=""
                :nickname="user.nickname"
              />
              <div style="margin-left: 24px; flex: 1">
                <div class="statistics-overview-header__body__greeting1">{{ greeting1 }}</div>
                <div class="statistics-overview-header__body__greeting2">{{ greeting2 }}</div>
              </div>
            </div>
            <el-divider />
          </div>
          <div class="m-grid-table">
            <div>
              <div>未开始</div>
              <div>9</div>
            </div>
            <div>
              <div>进行中</div>
              <div>9</div>
            </div>
            <div>
              <div>已完成</div>
              <div>9</div>
            </div>
          </div>
        </div>
        <div class="business-overview">
          <div class="business-overview-header">
            <div class="business-overview-header__title">
              <span>实时概况</span>
              <span
                style="margin-left: 16px; font-size: 14px; font-weight: 400; color: rgb(var(--gray-5))">更新于：2023/07/07
                23:59:59</span>
            </div>
            <div class="business-overview-header__layout">布局</div>
          </div>
          <div class="business-overview-body">
            <div class="business-overview-body-list">
              <div
                v-for="(item, index) in 6"
                :key="index"
                class="business-overview-body__item"
              >
                <div>
                  <div style="font-size: 14px; color: var(--eu-color-text-secondary)">本月目标</div>
                  <div style="font-size: 12px; color: rgb(var(--gray-5))">昨日 0.00</div>
                </div>
                <div>
                  <div style="font-size: 20px; font-weight: 700; color: var(--eu-color-text-secondary)">12</div>
                  <div style="font-size: 14px; color: rgb(var(--red-5))">12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col
        :span="6"
        :xs="24"
      >
        <div class="panel">
          <div class="panel__title">
            <div>快捷操作</div>
            <div class="text-primary">查看更多</div>
          </div>
          <el-row :gutter="20">
            <el-col
              v-for="item in 9"
              :key="item"
              :span="8"
            >
              <div class="wrapper">
                <div class="icon">
                  <svg-icon icon-class="monitor" />
                </div>
                <div class="text">用户管理</div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="panel">
          <div class="panel__title">
            <div>公告</div>
            <div class="text-primary">查看更多</div>
          </div>
          <ul class="panel__list">
            <li
              v-for="(item, index) in 5"
              :key="index"
              class="panel__list-item"
            >
              <el-tag size="small">通知</el-tag>
              <span style="font-size: 13px; margin: 0 6px">7/{{ item + 1 }}系统升级计划通知,本次升级新增xx功能</span>
            </li>
          </ul>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
// 数据统计总览
.statistics-overview {
  background-color: var(--eu-color-bg-primary);
  padding: 20px 0;
}

.statistics-overview-header {
  padding: 0 24px;
}

.statistics-overview-header__body {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .statistics-overview-header__body__greeting1 {
    font-weight: 500;
    font-size: 18px;
    line-height: 28px;
    color: var(--eu-color-text-primary);
    margin-bottom: 12px;
  }

  .statistics-overview-header__body__greeting2 {
    font-size: 14px;
    line-height: 22px;
    color: var(--eu-color-text-secondary);
  }
}

.el-tag {
  border: none;
  border-radius: 2px;
}

.m-grid-table {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  >div {
    position: relative;
    padding: 12px;
    margin: 0 12px;
    font-size: 14px;
    color: var(--eu-color-text-secondary);

    :last-child {
      font-size: 26px;
      color: var(--eu-color-text-secondary);
      padding-top: 12px;
    }

    &:hover {
      background-color: var(--eu-color-bg-tertiary);
    }
  }

  >div+div {
    &:before {
      content: '';
      position: absolute;
      top: 10%;
      left: -12px;
      bottom: 0;
      width: 1px;
      height: 80%;
      background-color: var(--eu-color-border-primary);
    }
  }
}

.panel {
  background: var(--eu-color-bg-primary);
  padding: 20px;

  &+.panel {
    margin-top: 20px;
  }

  .panel__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;

    :first-child {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-top: 20px;
  }

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    text-align: center;
  }

  .text {
    font-size: 12px;
    text-align: center;
    color: var(--eu-color-text-primary);
  }

  .panel__list {
    padding-top: 20px;
    color: var(--eu-color-text-primary);
  }

  .panel__list-item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5em;
  }
}

// 实时概况
.business-overview {
  background: var(--eu-color-bg-primary);
  margin-top: 16px;
  padding-top: 24px;
}

.business-overview-header {
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.business-overview-header__title {
  font-size: 16px;
  font-weight: 500;
}

.business-overview-header__layout {
  font-size: 14px;
  color: #999;

  &:hover {
    cursor: pointer;
    color: var(--eu-color-primary);
  }
}

.business-overview-body {
  padding: 12px 0;
}

.business-overview-body-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-row-gap: 12px;
  box-sizing: border-box;
}

.business-overview-body__item {
  margin: 0 12px;
  padding: 12px;

  &:hover {
    background: var(--eu-color-bg-tertiary);
  }

  &:nth-child(3n + 2) {
    position: relative;

    &:before {
      content: '';
      position: absolute;
      left: -12px;
      top: 0;
      bottom: 0;
      width: 1px;
      height: 100%;
      background: var(--eu-color-border-primary);
    }

    &:after {
      content: '';
      position: absolute;
      right: -12px;
      top: 0;
      bottom: 0;
      width: 1px;
      height: 100%;
      background: var(--eu-color-border-primary);
    }
  }

  >div:first-child {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  >div:last-child {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
  }
}

.business-overview-body__item-action {
  color: #909399;

  &:hover {
    cursor: pointer;
    color: var(--eu-color-text-primary) !important;
  }
}
</style>
