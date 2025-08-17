import type { DirectiveBinding } from 'vue';

import { PermissionModeEnums } from '@/utils/enums';
import { hasRole } from '@/utils/permission';

export default {
  // 默认 v-role:or
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, arg } = binding;
    const mode = arg || PermissionModeEnums.OR;

    if (!Object.values(PermissionModeEnums).includes(mode)) {
      throw new Error('请设置正确的权限检查模式');
    }

    // 检查标签值是否以数组的形式传入
    if (!Array.isArray(value)) {
      throw new Error('请设置操作角色标签值');
    }

    // 检查当前用户是否拥有指定的角色
    const isHave = hasRole(value, mode);

    if (!isHave) {
      // 如果没有权限，则删除当前dom
      el.parentNode && el.parentNode.removeChild(el);
    }
  },
};
