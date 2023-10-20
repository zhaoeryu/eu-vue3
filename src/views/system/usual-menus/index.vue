<script setup lang="ts">
import { list as menuList } from '@/api/system/menu'
import { getParentFieldsByLeafId, handleTreeData, isExternal, pathTrim } from '@/utils'
import {Search} from "@element-plus/icons-vue";
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {useRouteStore} from "@/store";
import {ElMessage} from "element-plus";

const routeStore = useRouteStore()

const menuFilterKeyword = ref(null)
const menuTree = ref([])
const menuOriginList = ref([])
const menuTreeLoading = ref(false)
const loading = ref(false)

const usualMenus = computed(() => {
  return routeStore.usualMenus
})

const refMenu = ref(null)

watch(() => menuFilterKeyword.value, val => {
  refMenu.value.filter(val);
}, {
  flush: 'post'
})

onMounted(() => {
  menuList({}).then(res => {
    menuOriginList.value = res.data.filter(item => item.menuType !== 3)
    menuTree.value = handleTreeData(menuOriginList.value)
    nextTick(() => {
      usualMenus.value.forEach(item => {
        refMenu.value.setChecked(item.id, true, false)
      })
    })
  })
})

function onFilterNode(value, node) {
  if (!value) {
    return true
  }
  return node.menuName.indexOf(value) !== -1;
}

function onSave() {
  const checkedMenus = refMenu.value.getCheckedNodes()

  checkedMenus.forEach(item => {
    if (isExternal(item.path)) {
      item.fullPath = item.path
      return
    }
    const parentPaths = getParentFieldsByLeafId(menuTree.value, item.id, {
      fieldKey: 'path'
    })
    item.fullPath = pathTrim(['/', ...parentPaths].join('/'))
  })

  if (!checkedMenus.length) {
    return
  }

  loading.value = true

  const usualMenus = checkedMenus.map(item => {
    return {
      id: item.id,
      path: item.path,
      fullPath: item.fullPath,
      name: item.componentName,
      meta: {
        title: item.menuName
      },
      component: item.component
    }
  })

  routeStore.setUsualMenus(usualMenus)
  loading.value = false
  ElMessage.success('保存成功')
}

</script>

<template>
  <div class="page-container usual-container">
    <div class="preview-body">
      <div class="nav-header">
        <div></div>
      </div>
      <ul class="nav-list">
        <li>
          <svg-icon icon-class="pushpin" style="display: inline-block;width: 1.3em;height: 1.3em;text-align: center;margin-right: 8px;" />
          <span style="background: unset;">快捷</span>
        </li>
        <li v-for="item in 5" :key="item">
          <i></i>
          <span></span>
        </li>
      </ul>
    </div>
    <div class="pop-nav-body">
      <ul>
        <li v-for="(item, index) in usualMenus" :key="index">{{ item.meta && item.meta.title || 'unknown' }}</li>
      </ul>
    </div>
    <div class="operation-body">
      <div class="operation-body__header">
        <div>选择菜单</div>
        <el-input placeholder="输入关键字进行搜索" v-model="menuFilterKeyword" style="width: 200px;" clearable>
          <template #prefix>
            <el-icon><Search/></el-icon>
          </template>
        </el-input>
      </div>
      <el-tree
        :data="menuTree"
        show-checkbox
        ref="refMenu"
        node-key="id"
        empty-text="暂无数据"
        :check-strictly="true"
        :filter-node-method="onFilterNode"
        :default-expand-all="true"
        :props="{ label: 'menuName', children: 'children' }"
      ></el-tree>
      <div class="operation-body__footer">
        <el-button>取消</el-button>
        <el-button :loading="loading" type="primary" style="width: 150px;" @click="onSave">确定</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.usual-container {
  height: 100%;
}
.preview-body {
  position: absolute;
  right: 70%;
  transform: translateX(-50%);
  width: var(--sidebar-first-width, 124px);
  background-color: #1e222d;
  height: 100%;
  display: flex;
  flex-direction: column;

  .nav-header {
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    >div {
      background-color: rgb(134, 142, 150);
      width: 50px;
      height: 50px;
      border-radius: 8px;
    }
  }
  .nav-list {
    flex: 1;
    font-size: 14px;
    color: #FFF;
    li {
      height: 40px;
      border-radius: 2px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 0 4px;
      i {
        display: inline-block;
        width: 20px;
        height: 20px;
        background-color: #5f677d;
        margin-right: 8px;
        border-radius: 2px;
      }
      span {
        display: inline-block;
        width: 55px;
        height: 20px;
        background-color: #5f677d;
        border-radius: 2px;
        line-height: 20px;
      }
    }
  }
}
.operation-body {
  position: absolute;
  right: 0;
  top: 0;
  min-width: 500px;
  overflow: hidden;
  background-color: var(--theme-base-second-bg);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  .el-tree {
    flex: 1;
    overflow-y: auto;
    padding: 20px 20px 0;
  }
  .operation-body__header {
    padding: 16px 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
  }
  .operation-body__footer {
    border-top: 1px solid #ebeef5;
    padding: 0 20px;
    box-sizing: border-box;
    height: 60px;
    width: 100%;
    // 上边框阴影
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    line-height: 60px;
    text-align: right;
  }
}
.pop-nav-body {
  position: absolute;
  right: calc(70% - var(--sidebar-first-width, 124px));
  width: 150px;
  transform: translateX(-15%);
  background: var(--theme-nav-pop-bg);
  color: var(--theme-nav-pop-color);
  padding: 20px 30px;
  box-sizing: border-box;
  border-radius: 2px;
  font-size: 14px;
  li {
    height: 40px;
    line-height: 40px;
  }
  &:before {
    content: '';
    border-width: 6px;
    border-style: solid;
    position: absolute;
    top: 95px;
    left: -12px;
    border-color: transparent;
    border-right-color: var(--theme-nav-pop-bg, #5f5f66) !important;
  }
}
</style>
