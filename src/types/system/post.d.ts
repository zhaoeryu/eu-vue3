import type {BaseEntity} from '@/types/api';

export interface Post extends BaseEntity {
  id: number;
  postName: string;
  code: string;
  status: number;
}
