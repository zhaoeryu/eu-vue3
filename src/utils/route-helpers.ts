// 路由处理相关的工具函数
import _ from 'lodash'
import { toArray } from 'tree-lodash'
import {
  isExternal,
  removeLeadingSlash,
  addLeadingSlash,
  pathTrim,
  removeEndSlash,
  getFirstChildrenFields,
  type TreeNode
} from './index'
import { MenuTypeEnums } from './enums'
import Layout from '@/layout/index.vue'
import MiddleDirectory from '@/layout/components/MiddleDirectory.vue'
import NotFound from "@/views/404.vue";
import {type Menu} from "@/types/system/menu";
import {type RouteNode, type RouteNodeMeta} from "@/types/route";
import {type ANY_OBJECT} from "@/types/generic";
const VIEW_MODULES: ANY_OBJECT = import.meta.glob('@/views/**/*.vue')

/**
 * 验证路由节点数据的有效性
 * @param {Object} node 路由节点
 * @returns {boolean} 是否有效
 */
export function isValidRouteNode(node: Menu) {
  return node &&
    typeof node === 'object' &&
    node.id &&
    node.path !== undefined
}

/**
 * 清理路由路径
 * @param {string} path 原始路径
 * @returns {string} 清理后的路径
 */
export function sanitizePath(path: string) {
  if (!path) {
    return ''
  }
  return String(path).replace(/^\/+/, '').replace(/\/+$/, '')
}

/**
 * 构建完整路径
 * @param {string} parentPath 父路径
 * @param {string} currentPath 当前路径
 * @returns {string} 完整路径
 */
export function buildFullPath(parentPath: string | null | undefined, currentPath: string) {
  if (isExternal(currentPath)) {
    return currentPath
  }

  const cleanParent = (parentPath || '').replace(/\/+$/, '')
  const cleanCurrent = sanitizePath(currentPath)

  if (!cleanParent) {
    return `/${cleanCurrent}`
  }

  return removeEndSlash(`${cleanParent}/${cleanCurrent}`)
}

/**
 * 创建路由元数据
 * @param {Object} item 菜单项
 * @returns {Object} 路由元数据
 */
export function createRouteNodeMeta(item: Menu): RouteNodeMeta {
  return {
    title: item.menuName || '',
    icon: item.menuIcon || '',
    affix: Boolean(item.affix),
    isChildMeta: false,
    permission: item.permission || '',
    keepAlive: Boolean(item.cache),
    dot: Boolean(item.dot),
    badge: item.badge || '',
    showHeader: Boolean(item.showHeader),
    showFooter: Boolean(item.showFooter),
    alwaysShow: Boolean(item.alwaysShow),
    sort: item.sortNum || 0,
    embed: Boolean(item.embed),
    embedUrl: item.embedUrl || '',
    hidden: !item.visible,
  }
}

/**
 * 格式化菜单项为路由项
 * @param {Object} item 菜单项
 * @returns {Object|null} 路由项
 */
export function formatMenuToRoute(item: Menu): RouteNode | null {
  if (!isValidRouteNode(item)) {
    return null
  }

  return {
    id: item.id,
    parentId: item.parentId,
    menuType: item.menuType,
    componentPath: item.component,
    hidden: !item.visible,
    fullPath: null,
    path: item.path || '',
    name: item.componentName,
    meta: createRouteNodeMeta(item),
    children: []
  }
}

/**
 * 处理目录节点
 * @param {Object} node 节点数据
 * @param {Object} parentNode 父节点数据
 * @returns {Object} 处理后的节点
 */
export function processDirectoryNode(node: RouteNode, parentNode: RouteNode | null) {
  if (!parentNode) {
    // 根目录节点
    node.component = Layout
  } else {
    // 中间目录节点
    node.path = removeLeadingSlash(node.path)
    node.component = MiddleDirectory
  }

  // redirect 到第一个子菜单
  const condition = (n: TreeNode) => n.menuType !== MenuTypeEnums.MENU.value
  const firstChildPath = getFirstChildrenFields(node, { fieldKey: 'path', condition }).join('/')
  node.redirect = pathTrim(addLeadingSlash(firstChildPath))

  // 目录下只有一个子节点时，菜单栏直接显示子节点内容
  const isSingleChild = node.children.length === 1
  if (isSingleChild && !node.meta.alwaysShow) {
    const child = node.children[0]
    node.meta = { ...child.meta }
    node.meta.isChildMeta = true
  }

  return node
}

/**
 * 处理菜单节点
 * @param {Object} node 节点数据
 * @param {Object} parentNode 父节点数据
 * @returns {Object} 处理后的节点
 */
export function processMenuNode(node: RouteNode, parentNode: RouteNode | null) {
  if (isExternal(node.path)) {
    // 外链处理
    node.path = removeLeadingSlash(node.path, true)
  } else if (!parentNode) {
    // 根节点为菜单，包装 Layout
    return wrapMenuWithLayout(node)
  } else {
    // 普通菜单节点
    node.path = removeLeadingSlash(node.path)
    node.component = loadComponent(node)
  }

  return node
}

/**
 * 将菜单节点包装在Layout中
 * @param {Object} node 菜单节点
 * @returns {Object} 包装后的节点
 */
export function wrapMenuWithLayout(node: RouteNode) {
  const childNode = _.cloneDeep(node)

  // 清理父节点属性
  delete node.name
  node.path = addLeadingSlash(node.path)
  node.redirect = node.path
  node.component = Layout

  // 设置子节点属性
  childNode.path = ''
  childNode.children = []

  // 处理所有子节点
  node.children = [childNode, ...(node.children || [])].map(item => ({
    ...item,
    component: loadComponent(item)
  }))

  return node
}

/**
 * 组件加载函数
 * @param {Object} menu 菜单项
 * @returns {Object} 组件
 */
export function loadComponent(menu: RouteNode) {
  // 内嵌iframe
  if (_.get(menu, 'meta.embed') === true) {
    // @ts-ignore
    return () => import('/src/layout/components/InnerIframe.vue')
  }

  // 外链不需要组件
  if (isExternal(menu.path)) {
    return null
  }

  // 没有组件路径
  if (!menu.componentPath) {
    return null
  }

  // 动态加载组件
  let viewPath = removeLeadingSlash(menu.componentPath)
  // 判断viewPath是否以/index结尾，如果不是则添加/index
  if (!viewPath.endsWith('/index')) {
    viewPath += '/index'
  }
  viewPath = `/src/views/${viewPath}.vue`
  const isExist = Object.keys(VIEW_MODULES).some(item => item === viewPath)
  if (isExist) {
    return VIEW_MODULES[viewPath]
  }
  return NotFound
}

/**
 * 获取和指定菜单匹配度最高的菜单
 * @param {string} activeMenu 指定菜单路径
 * @param {Array} menuList 菜单列表
 * @returns {string|null} 匹配度最高的path
 */
export function getMaxMatchedMenu(activeMenu: string, menuList: RouteNode[]) {
  // 参数验证
  if (!activeMenu || !Array.isArray(menuList) || menuList.length === 0) {
    return null
  }

  // 预处理：获取所有有效的菜单路径
  // @ts-ignore
  const validMenuPaths: string[] = toArray(menuList)
    .filter(item => item && item.fullPath)
    .map(item => String(item.fullPath))

  if (validMenuPaths.length === 0) {
    return null
  }

  // 找到匹配的菜单并计算匹配度
  let bestMatch = null
  let maxSegments = 0

  for (const path of validMenuPaths) {
    if (isMenuSegmentMatch(activeMenu, path)) {
      const segments = path.split('/').length
      if (segments > maxSegments) {
        maxSegments = segments
        bestMatch = path
      }
    }
  }

  return bestMatch
}

/**
 * 匹配两个菜单路径
 * @param {string} curMenu 当前菜单路径
 * @param {string} matchMenu 匹配菜单路径
 * @returns {boolean} 是否匹配
 */
export function isMenuSegmentMatch(curMenu: string, matchMenu: string) {
  // 参数验证
  if (!curMenu || !matchMenu || typeof curMenu !== 'string' || typeof matchMenu !== 'string') {
    return false
  }

  // 如果当前菜单不是以匹配菜单开头，直接返回false
  if (!curMenu.startsWith(matchMenu)) {
    return false
  }

  // 分割路径进行比较
  const curParts = curMenu.split('/')
  const matchParts = matchMenu.split('/')

  // 匹配菜单必须是当前菜单的父级路径
  if (matchParts.length === curParts.length) {
    return false
  }

  // 检查匹配菜单的每个部分是否与当前菜单对应部分一致
  return matchParts.every((part, index) => part === curParts[index])
}
