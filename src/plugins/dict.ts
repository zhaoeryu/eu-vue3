import type { App } from 'vue';
import VueDataDict from 'vue3-data-dict';

import useDict from '@/hooks/dict';
import type { DictDetail } from '@/types/system/dict';
import type { ResultBody } from '@/types/api';

export default {
  install: (Vue: App) => {
    Vue.use(VueDataDict, {
      metas: {
        '*': {
          request(dictMeta: any) {
            return useDict().fetchOptions(dictMeta.type);
          },
          responseConverter(response: ResultBody<DictDetail[]>, dictMeta: any) {
            return (response.data || []).map((item) => VueDataDict.convertData(item, dictMeta));
          },
          labelField: 'dictLabel',
          valueField: 'dictValue',
          lazy: false,
          lookup: false,
        },
      },
    });
  },
};
