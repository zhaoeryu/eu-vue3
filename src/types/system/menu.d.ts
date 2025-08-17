import { type BaseEntity } from '@/types/api';

export interface Menu extends BaseEntity {
  id: number;
  menuName: string;
  menuIcon?: string;
  sortNum: number;
  permission?: string;
  path?: string;
  componentName?: string;
  component?: string;
  status: number;
  affix: boolean;
  visible: boolean;
  cache?: boolean;
  embed?: boolean;
  embedUrl?: string;
  dot?: boolean;
  badge?: string;
  menuType: number;
  parentId?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  alwaysShow?: boolean;
}

export type MenuTree = Menu & {
  children: MenuTree[];
  _parentIds?: number[];
};
