import {useUserStore} from "@/store";
import {ALL_PERMISSION} from "@/utils/constants";

export default {
    // 默认 v-permissions:or
    mounted(el, binding, vnode) {
        const { value, arg } = binding
        const permissions = useUserStore().permissions || []
        const mode = arg || 'or'

        // 检查标签值是否以数组的形式传入
        if (!Array.isArray(value)) {
            throw new Error('请设置操作权限标签值')
        }

        if (permissions.includes(ALL_PERMISSION)) {
            // 拥有所有权限，直接返回
            return
        }

        let hasPermission = false
        if (mode === 'and') {
            // 检查当前用户是否拥有指定的所有权限
            hasPermission = value.every(permission => permissions.includes(permission))
        } else if (mode === 'or') {
            // 检查当前用户是否有该权限
            hasPermission = permissions.some(permission => value.includes(permission))
        } else {
            throw new Error('未受支持的检查模式 ：' + mode)
        }
        if (!hasPermission) {
            // 如果没有权限，则删除当前dom
            el.parentNode && el.parentNode.removeChild(el)
        }
    }
}
