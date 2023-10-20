<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: null
  },
  question: {
    type: String,
    default: null
  }
})
</script>

<template>
  <div class="m-block-header">
    <div class="m-block-header__title">
      <slot v-if="$slots.title" name="title" />
      <h3 v-else>{{ title }}</h3>
    </div>
    <div v-if="$slots.question || question" class="m-block-header__pop">
      <el-tooltip effect="dark" :content="question" placement="top-start">
        <template v-if="$slots.question" v-slot:content>
          <slot name="question" />
        </template>
        <i class="el-icon-question" />
      </el-tooltip>
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
  background-color: #f7f7f7;
  display: flex;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 12px;
  height: 40px;
  box-sizing: border-box;
  font-size: 14px;
  .m-block-header__title {
    display: flex;
    align-items: center;
    &:before {
      content: "";
      width: 3px;
      height: 14px;
      background-color: #155bd4;
      margin-right: 8px;
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
