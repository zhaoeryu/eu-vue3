import type { App } from 'vue';

import hasRole from '@/directive/permission/role';
import hasPermissions from '@/directive/permission/permissions';

export default {
  install: (Vue: App) => {
    Vue.directive('role', hasRole);
    Vue.directive('permissions', hasPermissions);
  },
};
