import type {App} from "vue";
// @ts-ignore 忽略类型检查
import VueDataDict from 'vue3-data-dict'
import useDict from "@/hooks/dict";

export default {
  install: (Vue: App) => {
    Vue.use(VueDataDict, {
      // onCreated(dict) {
      //     console.log('dict created: %o', dict)
      // },
      // onReady(dict) {
      //     console.log('dict ready: %o', dict)
      // },
      // DEFAULT_LABEL_FIELDS: ['label', 'name', 'title'],
      // DEFAULT_VALUE_FIELDS: ['value', 'id', 'uid', 'key'],
      metas: {
        '*': {
          request(dictMeta: any) {
            return useDict().fetchOptions(dictMeta.type)
          },
          // @ts-ignore 忽略类型检查
          responseConverter(response, dictMeta) {
            // @ts-ignore 忽略类型检查
            return (response.data || []).map(item => VueDataDict.convertData(item, dictMeta))
          },
          labelField: 'dictLabel',
          valueField: 'dictValue',
          lazy: false,
          lookup: false,
        }
      }
    })
  }
}
