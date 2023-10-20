<script setup>
import SecondSidebarItem from '@/layout/components/Sidebar/SecondSidebarItem.vue'
import { ref } from 'vue'
const props = defineProps({
  secondNavList: {
    type: Array,
    required: true
  },
  rootPath: {
    type: String,
    required: false
  }
})
const secondNavUpIndicatorShow = ref(false)
const secondNavDownIndicatorShow = ref(false)
function onNavUpScroll() {

}
function onNavDownScroll() {

}
function onNavScroll() {

}
</script>

<template>
  <nav class="eu-nav-scroll-wrapper">
    <div class="eu-nav-up-indicator" :class="{ 'eu-nav-indicator-hide': !secondNavUpIndicatorShow }">
      <div class="eu-op" @click="onNavUpScroll">
        <i class="el-icon-arrow-up"></i>
      </div>
    </div>
    <ul class="eu-nav-scroll" @scroll="onNavScroll">
      <second-sidebar-item
        v-for="(item, index) in secondNavList"
        :item="item"
        :root-path="rootPath"
        :key="index"
        @item-click="$emit('item-click', $event)"
      />
    </ul>
    <div class="eu-nav-down-indicator" :class="{ 'eu-nav-indicator-hide': !secondNavDownIndicatorShow }">
      <div class="eu-op" @click="onNavDownScroll">
        <i class="el-icon-arrow-down"></i>
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
    background: linear-gradient(0deg,rgba(255, 255, 255, 0),#fff 44%);
  }
  .eu-nav-down-indicator {
    bottom: 0;
    align-items: flex-end;
    background: linear-gradient(-180deg,rgba(255, 255, 255, 0),#fff 44%);
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
  }
}
// 隐藏二级菜单
.eu-nav-second-sidebar-hidden {
  .eu-nav-sidebar__second {
    width: 0 !important;
  }
}
</style>
