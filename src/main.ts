import { createApp } from 'vue'

// 重置样式
import 'normalize.css/normalize.css'
// 注册svg图标
import 'virtual:svg-icons-register'

import App from './App.vue'
import router from './router/routers'
import './router'
import store from './store'

const app = createApp(App)
app.use(store)
app.use(router)

// 注册指令
import directive from "@/directive";
app.use(directive)

// 注册插件
import plugins from "@/plugins";
app.use(plugins)

app.mount('#app')
