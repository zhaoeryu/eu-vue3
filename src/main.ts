import { createApp } from 'vue';

// 重置样式
import 'normalize.css/normalize.css';
// 注册svg图标
import 'virtual:svg-icons-register';
import directive from '@/directive';
import plugins from '@/plugins';

import store from './store';
import App from './App.vue';
import router from './router/routers';
import './router';

const app = createApp(App);
app.use(store);
app.use(router);
app.use(directive);
app.use(plugins);

app.mount('#app');
