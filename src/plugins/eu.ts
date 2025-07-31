import type {App} from "vue";

import SvgIcon from "@/components/SvgIcon.vue";
import EuAvatar from "@/components/EuAvatar.vue";
import MBlockHeader from "@/components/MBlockHeader.vue";
import EuEditor from "@/components/EuEditor.vue";
import Pagination from "@/components/Pagination.vue";
import EuTableToolbar from "@/components/Crud/EuTableToolbar.vue";
import QueryExpandWrapper from "@/components/Crud/QueryExpandWrapper.vue";
import UploadFile from "@/components/UploadFile.vue";
import EuLoading from "@/components/EuLoading.vue";
import MCornerDecoration from "@/components/MCornerDecoration.vue";

import '@/assets/styles/element-plus.scss'
import '@/assets/styles/index.scss'

export default {
  install: (Vue: App) => {
    Vue.component('svg-icon', SvgIcon)
    Vue.component('eu-avatar', EuAvatar)
    Vue.component('m-block-header', MBlockHeader)
    Vue.component('eu-editor', EuEditor)
    Vue.component('pagination', Pagination)
    Vue.component('eu-table-toolbar', EuTableToolbar)
    Vue.component('query-expand-wrapper', QueryExpandWrapper)
    Vue.component('upload-file', UploadFile)
    Vue.component('eu-loading', EuLoading)
    Vue.component('m-corner-decoration', MCornerDecoration)
  }
}
