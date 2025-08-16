<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch, watchEffect} from 'vue'
import { Command, useCommandState } from 'vue-command-palette'
import CmdkButton from '@/components/cmdk/CmdkButton.vue';
import {useMagicKeys} from "@vueuse/core";
import {useRouteStore, useSettingsStore, useUserStore} from "@/store";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import {defaultSetting} from "@/settings";
import CmdkIconEnter from "@/components/cmdk/CmdkIconEnter.vue";
import CmdkDialogFooter from "@/components/cmdk/CmdkDialogFooter.vue";
import SvgIcon from "@/components/SvgIcon.vue";
import {isExternal} from "@/utils";
import {isDark} from "@/utils/darkMode";
import type {RouteNode} from "@/types/route";

const visible = ref(false)
const keyword = ref('')

const keys = useMagicKeys()
const routeStore = useRouteStore()
const settingsStore = useSettingsStore()

const CmdK = keys['Meta+K']
const Escape = keys['Escape']

const db = ref<CmdkItem[]>([])
const router = useRouter()

type CmdkItem = {
  key: string
  label: string
  children: any[]
}

watch(CmdK, v => {
  if (v) {
    visible.value = true
  }
})

watch(Escape, v => {
  if (v) {
    visible.value = false
  }
})

const preferences = [
  {
    key: 'theme',
    label: '切换主题',
    labelList: ['切换主题']
  },
  {
    key: 'tabsView',
    label: '显示/隐藏标签选项卡',
    labelList: ['显示/隐藏标签选项卡']
  }
]

const system = [
  {
    key: 'logout',
    label: '退出登录',
    labelList: ['退出登录']
  }
]

const about = [
  {
    key: 'github',
    label: 'Github源码',
    labelList: ['Github源码'],
    value: defaultSetting.githubUrl
  },
  {
    key: 'gitee',
    label: 'Gitee源码',
    labelList: ['Gitee源码'],
    value: defaultSetting.giteeUrl
  },
  {
    key: 'doc',
    label: '帮助文档',
    labelList: ['帮助文档'],
    value: defaultSetting.systemHelpDocUrl
  }
]

// 初始化可搜索的库
onMounted(() => {
  const _routes = generateRoute(routeStore.routes.filter(item => !item.hidden), [], {})
  db.value = [
    {
      key: 'route',
      label: '路由',
      children: [
        ..._routes
      ]
    },
    {
      key: 'preferences',
      label: '偏好设置',
      children: [
        ...preferences
      ]
    },
    {
      key: 'system',
      label: '系统',
      children: [
        ...system
      ]
    },
    {
      key: 'about',
      label: '关于',
      children: [
        ...about
      ]
    }
  ]
})

// @ts-ignore
function generateRoute(_routes: RouteNode[], _result, parentItem) {
  _routes.forEach(item => {
    const isLink = isExternal(item.path)
    let parentPath = parentItem.key ? parentItem.key + '/' : ''
    const _item = {
      key: isLink ? item.path : (parentPath + item.path),
      label: item.meta.title,
      labelList: [...(parentItem.labelList || []), item.meta.title]
    }
    _result.push(_item)
    if (item.children && item.children.length) {
      if (
        item.children.length === 1 &&
        // 首页
        (item.path === '/' ||
          // 如果是两级菜单，且first.redirect === first.path === second.path
          // 这种情况是一级菜单的类型为菜单，创建router的时候包装了一层Layout，故这里只需要显示一级菜单即可
          (item.redirect === item.path &&
        item.redirect ===  item.children[0].path))) {
        // do nothing
      } else {
        _result.push(...generateRoute(item.children.filter(child => !child.hidden), [], _item))
      }
    }
  })
  return _result
}

function onItemSelect(item: any, group: CmdkItem) {
  switch (group.key) {
    case 'route':
      if (isExternal(item.key)) {
        window.open(item.key,  '_blank')
      } else {
        router.push(item.key)
      }
      break;
    case 'preferences':
      switch (item.key) {
        case 'theme':
          settingsStore.saveTheme({
            darkMode: isDark() ? 'light' : 'dark'
          })
          break;
        case 'tabsView':
          settingsStore.saveTheme({
            showTabsBar: !settingsStore.theme.showTabsBar
          })
          break;
      }
      break;
    case 'system':
      switch (item.key) {
        case 'logout':
          logout()
          break;
      }
      break;
    case 'about':
      window.open(item.value,  '_blank')
      break;
  }
  visible.value = false
}

function logout() {
  setTimeout(() => {
    ElMessageBox.confirm('即将退出系统，是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          useUserStore().logout().then(() => {
            done()
            location.reload()
          }).finally(() => {
            instance.confirmButtonLoading = false
          })
        } else {
          done()
        }
      }
    }).finally(() => {
      // nothing
    })
  }, 100)
}
</script>

<template>
  <cmdk-button @search="visible = true;" />
  <Command.Dialog
    :visible="visible"
    theme="eu"
  >
    <template #header>
      <svg-icon icon-class="search" class-name="search-icon" />
      <Command.Input v-model:value="keyword" placeholder="搜索" />
    </template>
    <template #body>
      <Command.List>
        <Command.Empty>没有"{{ keyword }}"的搜索结果.</Command.Empty>

        <Command.Group
          v-for="(group, groupIndex) in db"
          :key="groupIndex"
          :heading="group.label"
        >
          <Command.Item
            v-for="(child, childIndex) in group.children"
            :key="childIndex"
            :data-value="child.labelList.join(',')"
            @select="onItemSelect(child, group)"
          >
            <div class="command-palette-item__body">
              <div>
                <template
                  v-for="(label, labelIndex) in child.labelList"
                  :key="labelIndex"
                >
                  <span>{{ label }}</span>
                  <svg-icon v-if="labelIndex + 1 < child.labelList.length" icon-class="arrow-right" style="margin: 0 1em;" />
                </template>
              </div>
              <cmdk-icon-enter class="command-palette-item__body__enter" />
            </div>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </template>
    <template #footer>
      <cmdk-dialog-footer />
    </template>
  </Command.Dialog>
</template>

<style lang="scss">
@use '@/assets/styles/cmdk-global';
@use '@/assets/styles/cmdk-eu';
</style>
