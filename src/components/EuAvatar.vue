<script setup lang="ts">
import {computed, defineProps, withDefaults} from "vue";

type Size = 'large' | 'medium' | 'small' | number
type Shape = 'square' | 'circle'

interface Props {
  src: string;
  nickname: string;
  size?: Size;
  fontSize?: number;
  shape?: Shape;
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 16,
  shape: 'square'
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

<script lang="ts">
export default {
  name: 'EuAvatar'
}
</script>

<template>
  <el-avatar :shape="shape" :size="size" :src="src" style="vertical-align: middle;" @error="() => true">
    <div :style="avatarTextStyle">{{ showName }}</div>
  </el-avatar>
</template>
