<script lang="ts" setup>
import SecondSidebarItem from '@/layout/components/Sidebar/column/SecondSidebarItem.vue'
import {
  ref,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  nextTick,
  defineProps,
  useTemplateRef
} from 'vue'
import { smoothScrollToBottom, smoothScrollToTop } from '@/utils/sliding-scroll'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  secondNavList: {
    type: Array,
    required: true
  },
})

const secondNavUpIndicatorShow = ref(false)
const secondNavDownIndicatorShow = ref(false)
const navScrollRef = useTemplateRef('navScrollRef');
onMounted(async () => {
  await nextTick()
  onSelfNavScroll()
})
onBeforeMount(() => {
  window.addEventListener('resize', onSelfNavScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onSelfNavScroll)
})

function onSelfNavScroll() {
  onNavScroll({
    target: navScrollRef.value
  })
}
function onNavUpScroll({ target }) {
  smoothScrollToTop({
    duration: 300,
    element: target.parentNode.nextElementSibling
  })
}
function onNavDownScroll({ target }) {
  smoothScrollToBottom({
    duration: 300,
    element: target.parentNode.previousElementSibling
  })
}
function onNavScroll({ target }) {
  if (target.offsetHeight >= target.scrollHeight) {
    // 不需要滚动
    secondNavUpIndicatorShow.value = false
    secondNavDownIndicatorShow.value = false
    return
  }
  secondNavUpIndicatorShow.value = target.scrollTop > 0
  secondNavDownIndicatorShow.value = (target.scrollTop + target.offsetHeight) < target.scrollHeight
}

defineExpose({
  onSelfNavScroll
})
</script>

<template>
  <nav class="eu-nav-scroll-wrapper">
    <div class="eu-nav-up-indicator" :class="{ 'eu-nav-indicator-hide': !secondNavUpIndicatorShow }">
      <div class="eu-op" @click="onNavUpScroll">
        <el-icon><arrow-up/></el-icon>
      </div>
    </div>
    <ul class="eu-nav-scroll" ref="navScrollRef" @scroll="onNavScroll">
      <second-sidebar-item
        v-for="(item, index) in secondNavList"
        :item="item"
        :key="index"
        @item-click="$emit('item-click', $event)"
      />
    </ul>
    <div class="eu-nav-down-indicator" :class="{ 'eu-nav-indicator-hide': !secondNavDownIndicatorShow }">
      <div class="eu-op" @click="onNavDownScroll">
        <el-icon><arrow-down/></el-icon>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
// 滚动指示器
.eu-nav-scroll-wrapper {
  .eu-nav-up-indicator,.eu-nav-down-indicator {
    height: 64px;
    margin: 2px;
    display: flex;
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    transition: opacity .15s linear;
    .eu-op {
      cursor: pointer;
      height: 20px;
      line-height: 20px;
      width: 100%;
      background-color: rgba(0, 0, 0, .06);
      text-align: center;
      font-size: 14px;
      color: #333;
      >i {
        pointer-events: none;
      }
    }
  }
  .eu-nav-up-indicator {
    top: 0;
    align-items: flex-start;
    background: linear-gradient(0deg,rgba(255, 255, 255, 0), var(--theme-nav-second-bg) 70%);
  }
  .eu-nav-down-indicator {
    bottom: 0;
    align-items: flex-end;
    background: linear-gradient(-180deg,rgba(255, 255, 255, 0), var(--theme-nav-second-bg) 70%);
  }
}
.eu-nav-indicator-hide {
  opacity: 0 !important;
  height: 0 !important;
}
// 菜单滚动区域
.eu-nav-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  position: relative;
  &::-webkit-scrollbar{
    width: 0;
  }
}
// 折叠菜单
.sidebar-collapsed {
  .eu-nav-sidebar__second {
    width: 0 !important;
    overflow: hidden;
  }
}
// 隐藏二级菜单
.eu-nav-second-sidebar-hidden {
  .eu-nav-sidebar__second {
    width: 0 !important;
    overflow: hidden;
  }
}
</style>
