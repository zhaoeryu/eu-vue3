<template>
  <div
    style="height: 100%;"
    v-loading="loading"
    element-loading-text="正在加载中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
  >
    <iframe
      :id="iframeId"
      style="width: 100%; height: 100%"
      :src="src"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { Md5 } from 'ts-md5';
import {computed, onMounted, ref} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()

const loading = ref(false)
const src = computed(() => route.meta.embedUrl)
const iframeId = computed(() => 'iframe_' + Md5.hashStr(src.value))

onMounted(() => {
  const iframe = document.querySelector('#' + iframeId.value);
  // iframe页面loading控制
  if (iframe.attachEvent) {
    loading.value = true;
    iframe.attachEvent('onload', function () {
      loading.value = false;
    });
  } else {
    loading.value = true;
    iframe.onload = function () {
      loading.value = false;
    };
  }
})
</script>
