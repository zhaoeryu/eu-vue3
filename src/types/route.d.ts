import type { RouteRecordRaw, RouteMeta } from 'vue-router';

export interface RouteNodeMeta extends RouteMeta {
  title: string;
  icon: string;
  affix: boolean;
  isChildMeta: boolean;
  permission: string;
  keepAlive: boolean;
  dot: boolean;
  badge: string;
  showHeader: boolean;
  showFooter: boolean;
  alwaysShow: boolean;
  sort: number;
  embed: boolean;
  embedUrl: string;
  hidden: boolean;
}

export interface RouteNode extends Omit<RouteRecordRaw, 'meta' | 'children' | 'component'> {
  id: number;
  parentId?: number;
  menuType: number;
  componentPath?: string;
  component?: RouteRecordRaw['component'] | object;
  hidden: boolean;
  fullPath?: string | null;
  path: string;
  name?: string;
  meta: RouteNodeMeta;
  children: RouteNode[];
  redirect?: string;
}
