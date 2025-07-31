import hasRole from "@/directive/permission/role";
import hasPermissions from "@/directive/permission/permissions";
import type {App} from "vue";

export default {
  install: (Vue: App) => {
    Vue.directive('role', hasRole)
    Vue.directive('permissions', hasPermissions)
  }
}
