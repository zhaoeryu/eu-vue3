import type {App} from "vue";
import VueDataDict from 'vue3-data-dict'
import { listByDictKey } from '@/api/system/dictDetail'

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
                    request(dictMeta) {
                        return listByDictKey(dictMeta.type)
                    },
                    responseConverter(response, dictMeta) {
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
