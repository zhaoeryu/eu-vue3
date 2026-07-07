import type { BaseEntity } from '@/types/api';

export interface SysConfig extends BaseEntity {
  configId: string;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
}
