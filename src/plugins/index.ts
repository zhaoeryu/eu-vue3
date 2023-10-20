import type {App} from "vue";

import ElementPlus from './element-plus'
import ThirdParty from "./third-party";
import Eu from './eu'
import VueDataDict from './dict'

export default {
    install: (Vue: App) => {
        Vue.use(ElementPlus)
        Vue.use(ThirdParty)
        Vue.use(Eu)
        Vue.use(VueDataDict)
    }
}
