import { useUserStore } from '@/store';
import { ALL_PERMISSION, ALL_ROLE } from '@/utils/constants';
import { PermissionModeEnums } from '@/utils/enums';

/**
 * 检查当前用户是否拥有指定的权限
 * @param {Array} permissions 需要检查的权限列表
 * @param {string} mode 权限检查模式：PermissionModeEnums
 * @returns {boolean} 是否拥有指定的权限
 */
export function hasPermission(permissions: string[], mode = PermissionModeEnums.OR): boolean {
  if (!Array.isArray(permissions)) {
    return false;
  }
  const havePermissions = new Set(useUserStore().permissions || []);
  if (havePermissions.has(ALL_PERMISSION)) {
    // 拥有所有权限，直接返回
    return true;
  }
  if (mode === PermissionModeEnums.AND) {
    return permissions.every((permission) => havePermissions.has(permission));
  }
  return permissions.some((permission) => havePermissions.has(permission));
}

/**
 * 检查当前用户是否拥有指定的角色
 * @param {Array} roles 需要检查的角色列表
 * @param {string} mode 角色检查模式：PermissionModeEnums
 * @returns {boolean} 是否拥有指定的角色
 */
export function hasRole(roles: string[], mode = PermissionModeEnums.OR) {
  if (!Array.isArray(roles)) {
    return false;
  }
  const haveRoles = new Set(useUserStore().roles || []);

  if (haveRoles.has(ALL_ROLE)) {
    // 拥有所有角色，直接返回
    return true;
  }

  if (mode === PermissionModeEnums.AND) {
    return roles.every((role) => haveRoles.has(role));
  }
  return roles.some((role) => haveRoles.has(role));
}
