import type {BaseEntity} from '@/types/api';

export interface Dict extends BaseEntity {
  id: number;
  dictKey: string;
  status: number;
}

export interface DictDetail extends BaseEntity {
  id: number;
  pid: number;
  dictKey: string;
  dictLabel: string;
  dictValue: string;
  status: number;
  sortNum: number;
}
