import type {BaseEntity} from '@/types/api';

export interface Notice extends BaseEntity {
  id: string;
  title: string;
  type: number;
  description: string;
  content: string;
  status: number;
  publisher: string;
  publisherId: number;
}
