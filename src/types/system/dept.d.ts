import type {BaseEntity} from '@/types/api';

export interface Dept extends BaseEntity {
  id: number;
  deptName: string;
  status: number;
  sortNum: number;
  parentId: number | null;
  parentIds?: string;
}

export type DeptTree = Dept & {
  children: DeptTree[];
};
