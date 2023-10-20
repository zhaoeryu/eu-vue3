import hasRole from "@/directive/permission/role";
import hasPermissions from "@/directive/permission/permissions";
import type {App} from "vue";

export default {
    install: (Vue: App) => {
        // 注册指令
        // v-role="['xxx']"
        // v-role:or="['xxx']"
        // v-role:and="['xxx']"
        Vue.directive('role', hasRole)
        // v-permissions="['xxx']"
        // v-permissions:or="['xxx']"
        // v-permissions:and="['xxx']"
        Vue.directive('permissions', hasPermissions)
    }
}
