import type { DeviceType } from '@/store/modules/settings';
import type { EnumItem } from '@/types/generic';

/**
 * 创建枚举的工厂函数
 * @param obj 枚举对象
 * @returns 带有辅助方法的枚举对象
 */
export function createEnum<T extends Record<string, EnumItem<any>>>(obj: T): T & {
  findByValue: (value: any) => EnumItem | undefined;
  findByLabel: (label: string) => EnumItem | undefined;
  keys: () => string[];
  options: () => EnumItem[];
  values: () => any[];
  labels: () => string[];
  getLabelByValue: (value: any) => string | undefined;
  getValueByLabel: (label: string) => any;
  getKeyByValue: (value: any, key: string) => any;
  validate: (value: any) => boolean;
} {
  const enumObj = { ...obj } as any;

  /**
   * 根据值查找枚举项
   */
  enumObj.findByValue = (value: any) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    return Object.values(obj).find((item) => item.value === value);
  };

  /**
   * 根据标签查找枚举项
   */
  enumObj.findByLabel = (label: string) => {
    if (label === null || label === undefined) {
      return undefined;
    }
    return Object.values(obj).find((item) => item.label === label);
  };

  /**
   * 获取所有键
   */
  enumObj.keys = () => {
    return Object.keys(obj);
  };

  /**
   * 获取所有键
   */
  enumObj.options = () => {
    return Object.values(obj);
  };

  /**
   * 获取所有标签
   */
  enumObj.labels = () => {
    return Object.values(obj).map(({ label }) => label);
  };

  /**
   * 获取所有值
   */
  enumObj.values = () => {
    return Object.values(obj).map(({ value }) => value);
  };

  /**
   * 根据值获取标签
   */
  enumObj.getLabelByValue = (value: any) => {
    return enumObj.findByValue(value)?.label;
  };

  /**
   * 根据标签获取值
   */
  enumObj.getValueByLabel = (label: string) => {
    return enumObj.findByLabel(label)?.value;
  };

  /**
   * 根据值获取指定属性
   */
  enumObj.getKeyByValue = (value: any, key: string) => {
    return enumObj.findByValue(value)?.[key];
  };

  /**
   * 判断值是否在枚举中
   */
  enumObj.validate = (value: any) => {
    return Object.values(obj).some((item) => item.value === value);
  };

  return enumObj;
}

/**
 * 设备类型
 */
export const DeviceTypeEnums = createEnum({
  DESKTOP: { label: '桌面', value: 'desktop' as DeviceType },
  MOBILE: { label: '移动', value: 'mobile' as DeviceType },
});

/**
 * 权限判断模式
 */
export const PermissionModeEnums = createEnum({
  AND: { label: '且', value: 'and' },
  OR: { label: '或', value: 'or' },
});

/**
 * 操作日志 - 业务类型
 */
export const BusinessTypeEnums = createEnum({
  OTHER: { label: '其他', value: 0 },
  QUERY: { label: '查询', value: 1 },
  INSERT: { label: '新增', value: 2 },
  UPDATE: { label: '修改', value: 3 },
  DELETE: { label: '删除', value: 4 },
  EXPORT: { label: '导出', value: 5 },
  EXPORT_TEMPLATE: { label: '导出模版', value: 6 },
  IMPORT: { label: '导入', value: 7 },
  LOGIN: { label: '登录', value: 8 },
  LOGOUT: { label: '登出', value: 9 },
  KICKOUT: { label: '踢人下线', value: 10 },
  FORCE_LOGOUT: { label: '强制注销', value: 11 },
  PAUSE_RESUME_JOB: { label: '暂停/恢复任务', value: 12 },
  EXEC_JOB: { label: '执行任务', value: 13 },
});

/**
 * 菜单类型
 */
export const MenuTypeEnums = createEnum({
  DIR: { label: '目录', value: 1, type: 'info' },
  MENU: { label: '菜单', value: 2 },
  BUTTON: { label: '按钮', value: 3, type: 'success' },
});

export const DataScopeEnums = createEnum({
  ALL: { label: '全部数据权限', value: 1 },
  CUSTOM: { label: '自定数据权限', value: 2 },
  DEPT: { label: '部门数据权限', value: 3 },
  DEPT_AND_CHILD: { label: '部门及以下数据权限', value: 4 },
  SELF: { label: '仅本人数据权限', value: 5 },
});

export const NoticeTypeEnums = createEnum({
  INFO: { label: '通知', value: 0 },
  ANNOUNCEMENT: { label: '公告', value: 1 },
});

export const EnableFlagEnums = createEnum({
  ENABLE: { label: '启用', value: 0 },
  DISABLE: { label: '禁用', value: 1, type: 'danger' },
});

export const BooleanFlagEnums = createEnum({
  NO: { label: '否', value: 0 },
  YES: { label: '是', value: 1 },
});
