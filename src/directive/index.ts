import type { App } from 'vue';

import hasPermissions from '@/directive/permission/permissions';
import hasRole from '@/directive/permission/role';

export default {
  install: (Vue: App) => {
    Vue.directive('role', hasRole);
    Vue.directive('permissions', hasPermissions);
  },
};
