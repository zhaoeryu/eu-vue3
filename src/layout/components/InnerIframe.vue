<template>
  <div
    style="height: 100%;"
    v-loading="loading"
    element-loading-text="正在加载中..."
    element-loading-background="rgba(255, 255, 255, 0.8)"
  >
    <iframe
      style="width: 100%; height: 100%"
      :src="src"
      @load="onIframeLoad"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {useRoute} from "vue-router";
import useLoading from "@/hooks/loading";

const route = useRoute()
const { loading, setLoading } = useLoading(false)
const src = ref('')

watch(() => route.path, () => {
  setLoading(true)
  src.value = route.meta?.embedUrl as string
}, { immediate: true })

function onIframeLoad() {
  setLoading(false)
}
</script>
