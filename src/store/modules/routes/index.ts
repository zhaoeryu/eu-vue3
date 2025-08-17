import { defineStore } from 'pinia';
import { fromArray } from 'tree-lodash';
import _ from 'lodash';

import { getRouters } from '@/api/system/menu';
import { layoutRouteList } from '@/router/routers';
import { MenuTypeEnums } from '@/utils/enums';
import { formatMenuToRoute, buildFullPath, processDirectoryNode, processMenuNode } from '@/utils/route-helpers';
import { type RouteNode } from '@/types/route';
import { type Menu } from '@/types/system/menu';

interface RoutesState {
  routes: RouteNode[];
}

const useRouteStore = defineStore('route', {
  state: (): RoutesState => ({
    routes: [],
  }),
  getters: {},
  actions: {
    generateRoutes(): Promise<RouteNode[]> {
      return new Promise((resolve, reject) => {
        getRouters()
          .then((res) => {
            const menus = res.data || [];

            // 将后台返回的菜单数据转换为vue-router的格式
            const routers = convertMenuToVueRouterFormat(menus);
            const constantRouteList = handleConstantRouteList(layoutRouteList as RouteNode[]);
            routers.unshift(...constantRouteList);

            // 兜底方案（放到最后）：当用户访问的路由不存在时，跳转到 404 页面
            routers.push({
              path: '/:pathMatch(.*)*',
              redirect: '/404',
              hidden: true,
            } as RouteNode);

            const routes = routers;
            this.routes = routers;
            resolve(routes);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

/**
 * 处理后台返回的菜单数据，将其转换为vue-router的格式
 * @param {Array} menus 后台返回的菜单数据
 * @returns {Array} vue-router格式的路由数组
 */
function convertMenuToVueRouterFormat(menus: Menu[]): RouteNode[] {
  if (!Array.isArray(menus) || menus.length === 0) {
    return [];
  }

  // 使用 lodash 链式操作优化数据处理流程
  const processedMenus = _(menus)
    .sortBy('sortNum')
    .map(formatMenuToRoute)
    .filter((item) => item !== null)
    .value() as RouteNode[];

  const tree = fromArray<'id', 'parentId', 'children'>(processedMenus, {
    itemKey: 'id',
    parentKey: 'parentId',
    childrenKey: 'children',
  }) as RouteNode[];

  return _.sortBy(
    tree.map((node) => processNode(node, null)),
    'meta.sort',
  );
}

/**
 * 处理常量路由列表
 * @param {Array} menus 常量路由菜单
 * @returns {Array} 处理后的路由数组
 */
function handleConstantRouteList(menus: RouteNode[]) {
  return menus.map((node) => processNode(node, null, true));
}

/**
 * 处理节点数据
 * @param {Object} node 节点数据
 * @param {Object} parentNode 父节点数据
 * @param {boolean} isConstant 是否是常量路由
 * @returns {Object} 处理后的节点
 */
function processNode(node: RouteNode, parentNode: RouteNode | null, isConstant = false): RouteNode {
  // 计算 fullPath
  const fullPath = getFullPath(parentNode, node);

  // 节点类型处理
  const processed = isConstant ? { ...node, fullPath } : handleNodeByType({ ...node, fullPath }, parentNode);

  // 统一 children 处理
  const children = Array.isArray(processed.children) ? processed.children : [];
  const hasChildren = children.length > 0;

  // 递归处理 children
  return {
    ...processed,
    children: hasChildren ? children.map((child: RouteNode) => processNode(child, processed, isConstant)) : [],
  };
}

/**
 * 获取完整路径
 * @param {Object} parentNode 父节点
 * @param {Object} node 当前节点
 * @returns {string} 完整路径
 */
function getFullPath(parentNode: RouteNode | null, node: RouteNode) {
  const parentPath = parentNode ? parentNode.fullPath : '';
  return buildFullPath(parentPath, node.path);
}

/**
 * 根据节点类型处理节点
 * @param {Object} node 节点数据
 * @param {Object} parentNode 父节点数据
 * @returns {Object} 处理后的节点
 */
function handleNodeByType(node: RouteNode, parentNode: RouteNode | null) {
  const { menuType } = node;

  switch (menuType) {
    case MenuTypeEnums.DIR.value:
      return processDirectoryNode(node, parentNode);
    case MenuTypeEnums.MENU.value:
      return processMenuNode(node, parentNode);
    default:
      console.warn('未知的节点类型: %s', menuType);
      return node;
  }
}

export default useRouteStore;
