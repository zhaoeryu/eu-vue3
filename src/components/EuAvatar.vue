<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  nickname: {
    type: String,
    default: ''
  },
  size: {
    type: [Number, String],
    validator(val) {
      if (typeof val === 'string') {
        return ['large', 'medium', 'small'].includes(val);
      }
      return typeof val === 'number';
    },
    default: 30
  },
  fontSize: {
    type: Number,
    default: 16
  },
  shape: {
    type: String,
    default: 'square'
  }
})

const showName = computed(() => {
  // 显示最后一个字符
  return props.nickname && props.nickname.slice(-1)
})

const avatarTextStyle = computed(() => {
  return {
    fontSize: `${props.fontSize}px`
  }
})
</script>

<template>
  <el-avatar :shape="shape" :size="size" :src="src" style="vertical-align: middle;" @error="() => true">
    <div :style="avatarTextStyle">{{ showName }}</div>
  </el-avatar>
</template>
