import type {App} from "vue";

import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

export default {
    install: (Vue: App) => {
        Vue.use(ElementPlus, {
            // size: 'small',
            locale: zhCn
        })
    }
}
