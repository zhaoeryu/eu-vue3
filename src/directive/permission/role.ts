import {useUserStore} from "@/store";
import {ALL_ROLE} from "@/utils/constants";

export default {
    // 默认 v-role:or
    mounted(el, binding, vnode) {
        const { value, arg } = binding
        const roles = useUserStore().roles || []
        const mode = arg || 'or'

        // 检查标签值是否以数组的形式传入
        if (!Array.isArray(value)) {
            throw new Error('请设置操作角色标签值')
        }

        if (roles.includes(ALL_ROLE)) {
            // 拥有所有角色，直接返回
            return
        }

        let hasRole = false
        if (mode === 'and') {
            // 检查当前用户是否拥有指定的所有角色
            hasRole = value.every(role => roles.includes(role))
        } else if (mode === 'or') {
            // 检查当前用户是否有该角色
            hasRole = roles.some(role => value.includes(role))
        } else {
            throw new Error('未受支持的检查模式 ：' + mode)
        }
        if (!hasRole) {
            // 如果没有权限，则删除当前dom
            el.parentNode && el.parentNode.removeChild(el)
        }
    }
}
