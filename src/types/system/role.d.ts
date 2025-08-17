import { type BaseEntity } from '@/types/api';

export interface Role extends BaseEntity {
  id: number;
  roleKey: string;
  roleName: string;
  description: string;
  status: number;
  dataScope: number;
}
