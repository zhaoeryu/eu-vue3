<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';

export interface Props {
  title: string;
  content?: string | null;
  question?: string | null;
  background?: boolean;
}
withDefaults(defineProps<Props>(), {
  background: true,
  content: null,
  question: null,
});
</script>

<script lang="ts">
export default {
  name: 'MBlockHeader',
};
</script>

<template>
  <div
    class="m-block-header"
    :class="{
      background: background,
    }"
  >
    <div class="m-block-header__title">
      <slot v-if="$slots.title" name="title" />
      <h3 v-else>{{ title }}</h3>
    </div>
    <div v-if="$slots.question || question" class="m-block-header__pop">
      <el-tooltip effect="dark" :content="question" placement="top-start">
        <template v-if="$slots.question" #content>
          <slot name="question" />
        </template>
        <i class="el-icon-question" />
      </el-tooltip>
    </div>
    <div class="text-block-header__sub-title">
      <slot v-if="$slots.subTitle" name="subTitle" />
    </div>
    <div v-if="$slots.content || content" class="m-block-header__content">
      <slot v-if="$slots.content" name="content" />
      <span v-else>{{ content }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
html.dark {
  .m-block-header {
    background-color: var(--color-bg-3);
  }
}
* ~ .m-block-header {
  margin-top: 16px;
}
.m-block-header {
  //background-color: #f7f7f7;
  display: flex;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  //margin-bottom: 16px;
  padding: 10px 12px;
  height: 40px;
  box-sizing: border-box;
  font-size: 14px;
  &.background {
    background-color: var(--color-fill-2);
    margin-bottom: 16px;
  }
  .m-block-header__title {
    display: flex;
    align-items: center;
    &:before {
      content: '';
      width: 3px;
      height: 14px;
      background-color: #155bd4;
      margin-right: 8px;
      border-radius: 4px;
    }
    h3 {
      font-size: 14px;
      line-height: 20px;
      color: var(--color-text-1);
      font-weight: 500;
      margin: 0;
      padding: 0;
    }
  }
  .text-block-header__sub-title {
    margin-left: 16px;
  }
  .m-block-header__pop {
    color: #ccc;
    font-size: 16px;
    margin-left: 8px;
    cursor: pointer;
  }
  .m-block-header__content {
    flex-grow: 1;
    justify-content: flex-end;
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}
</style>
