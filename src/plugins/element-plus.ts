import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import type { App } from 'vue';
import VxeUIAll from 'vxe-pc-ui';
import VxeUITable from 'vxe-table';

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'vxe-pc-ui/es/style.css';
import 'vxe-table/es/style.css';

export default {
  install: (Vue: App) => {
    Vue.use(ElementPlus, {
      // size: 'small',
      locale: zhCn,
    });
    Vue.use(VxeUIAll);
    Vue.use(VxeUITable);
  },
};
