import type { App } from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

export default {
  install: (Vue: App) => {
    Vue.use(ElementPlus, {
      // size: 'small',
      locale: zhCn,
    });
  },
};
