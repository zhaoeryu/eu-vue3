import type { Enum, EnumItem } from '@/types/generic';
import type { DeviceType } from '@/store/modules/settings';

/**
 * 设备类型
 */
export const DeviceTypeEnums = {
  DESKTOP: 'desktop' as DeviceType,
  MOBILE: 'mobile' as DeviceType,
};

/**
 * 权限判断模式
 */
export const PermissionModeEnums = {
  AND: 'and',
  OR: 'or',
};

/**
 * 操作日志 - 业务类型
 */
export const BusinessTypeEnums: Enum = {
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
};

/**
 * 菜单类型
 */
export const MenuTypeEnums: Enum = {
  DIR: { label: '目录', value: 1, type: 'info' },
  MENU: { label: '菜单', value: 2 },
  BUTTON: { label: '按钮', value: 3, type: 'success' },
};

export const DataScopeEnums: Enum = {
  ALL: { label: '全部数据权限', value: 1 },
  CUSTOM: { label: '自定数据权限', value: 2 },
  DEPT: { label: '部门数据权限', value: 3 },
  DEPT_AND_CHILD: { label: '部门及以下数据权限', value: 4 },
  SELF: { label: '仅本人数据权限', value: 5 },
};

export const NoticeTypeEnums: Enum = {
  INFO: { label: '通知', value: 0 },
  ANNOUNCEMENT: { label: '公告', value: 1 },
};

export const EnableFlagEnums: Enum = {
  ENABLE: { label: '启用', value: 0 },
  DISABLE: { label: '禁用', value: 1, type: 'danger' },
};

export const BooleanFlagEnums: Enum = {
  NO: { label: '否', value: 0 },
  YES: { label: '是', value: 1 },
};

/**
 * 根据value获取label
 * @param {Object} enums 枚举对象
 * @param {Number} value 要查找的value
 * @param {String} field 要返回的字段
 * @param {String} defaultValue 如果没有找到对应的label，返回默认值
 * @returns {String} label
 */
export function enumsParse(enums: Enum, value: number | string | null, field = 'label', defaultValue = null) {
  let fieldValue = null;
  Object.keys(enums).forEach((key) => {
    if (enums[key].value === value) {
      fieldValue = enums[key][field];
    }
  });
  return fieldValue || defaultValue;
}
export function enumsParseLabel(enums: Enum, value: number | string | null, defaultValue = null) {
  return enumsParse(enums, value, 'label', defaultValue);
}

/**
 * enums 转换为 list
 * @param {Object} enums 待转换的enums
 * @returns {Array}
 */
export function enumsConvertToList(enums: Enum): EnumItem[] {
  return Object.keys(enums).map((key) => enums[key]);
}

export function enumsFindByValue(enums: Enum, value: number | string | boolean | null): EnumItem | null {
  return enumsConvertToList(enums).find((item) => item.value === value) || null;
}
