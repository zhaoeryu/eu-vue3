<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue';

export type Size = 'large' | 'default' | 'small' | number;
export type Shape = 'square' | 'circle';

export interface Props {
  src: string;
  nickname: string;
  size?: Size;
  fontSize?: number;
  shape?: Shape;
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 16,
  shape: 'square',
  size: 'default',
});

const showName = computed(() => {
  // 显示最后一个字符
  return props.nickname && props.nickname.slice(-1);
});

const avatarTextStyle = computed(() => {
  return {
    fontSize: `${props.fontSize}px`,
  };
});
</script>

<script lang="ts">
export default {
  name: 'EuAvatar',
};
</script>

<template>
  <el-avatar :shape="shape" :size="size" :src="src" style="vertical-align: middle" @error="() => true">
    <div :style="avatarTextStyle">{{ showName }}</div>
  </el-avatar>
</template>
