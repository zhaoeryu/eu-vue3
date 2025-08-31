export type T = ANY_OBJECT;

// 如果不想具体定义额外字段的类型，可以用索引签名允许任意字段：
export type ANY_OBJECT = Record<string, any>;

export type EnumItem<T = number> = {
  label: string;
  value: T;
  type?: string;
} & Partial<ANY_OBJECT>;

export type Enum<T = number> = Record<string, EnumItem<T>>;
