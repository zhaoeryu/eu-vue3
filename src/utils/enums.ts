/**
 * 设备类型
 */
export const DeviceTypeEnums = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile'
}

/**
 * 操作日志 - 业务类型
 */
export const BusinessTypeEnums = {
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
  EXEC_JOB: { label: '执行任务', value: 13 }
}

/**
 * 菜单类型
 */
export const MenuTypeEnums = {
  DIR: { label: '目录', value: 1 },
  MENU: { label: '菜单', value: 2 },
  BUTTON: { label: '按钮', value: 3 }
}

export const DataScopeEnums = {
  ALL: { label: '全部数据权限', value: 1 },
  CUSTOM: { label: '自定数据权限', value: 2 },
  DEPT: { label: '部门数据权限', value: 3 },
  DEPT_AND_CHILD: { label: '部门及以下数据权限', value: 4 },
  SELF: { label: '仅本人数据权限', value: 5 }
}

export const NoticeTypeEnums = {
  INFO: { label: '通知', value: 0 },
  ANNOUNCEMENT: { label: '公告', value: 1 }
}

/**
 * 根据value获取label
 * @param {Object} enums 枚举对象
 * @param {Number} value 要查找的value
 * @param {String} field 要返回的字段
 * @param {String} defaultValue 如果没有找到对应的label，返回默认值
 * @returns {String} label
 */
export function enumsParse(enums, value, field = 'label', defaultValue = null) {
  let fieldValue = null
  Object.keys(enums).forEach(key => {
    if (enums[key].value === value) {
      fieldValue = enums[key][field]
    }
  })
  return fieldValue || defaultValue
}
export function enumsParseLabel(enums, value, defaultValue = null) {
  return enumsParse(enums, value, 'label', defaultValue)
}

/**
 * enums 转换为 list
 * @param {Object} enums 待转换的enums
 * @returns {Array}
 */
export function enumsConvertToList(enums) {
  return Object.keys(enums).map(key => enums[key])
}
