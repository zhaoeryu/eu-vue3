export type T = ANY_OBJECT;

// 如果不想具体定义额外字段的类型，可以用索引签名允许任意字段：
export type ANY_OBJECT = Record<string, any>;

export type EnumItem<T = number> = {
  label: string;
  value: T;
  type?: string;
} & Partial<ANY_OBJECT>;

export interface Enum {
  findByValue: (value: any) => EnumItem | undefined;
  findByLabel: (label: string) => EnumItem | undefined;
  keys: () => string[];
  values: () => any[];
  options: () => EnumItem[];
  labels: () => string[];
  getLabelByValue: (value: any) => string | undefined;
  getValueByLabel: (label: string) => any;
  getKeyByValue: (value: any, key: string) => any;
  validate: (value: any) => boolean;
}
