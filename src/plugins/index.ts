import type { App } from 'vue';

import VueDataDict from './dict';
import ElementPlus from './element-plus';
import Eu from './eu';
import ThirdParty from './third-party';

export default {
  install: (Vue: App) => {
    Vue.use(ElementPlus);
    Vue.use(ThirdParty);
    Vue.use(Eu);
    Vue.use(VueDataDict);
  },
};
