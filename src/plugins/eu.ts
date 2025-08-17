import type { App, Component } from 'vue';

import '@/assets/styles/element-plus.scss';
import '@/assets/styles/index.scss';

import SvgIcon from '@/components/SvgIcon.vue';
import EuAvatar from '@/components/EuAvatar.vue';
import MBlockHeader from '@/components/MBlockHeader.vue';
import EuEditor from '@/components/EuEditor.vue';
import Pagination from '@/components/Pagination.vue';
import EuTableToolbar from '@/components/Crud/EuTableToolbar.vue';
import QueryExpandWrapper from '@/components/Crud/QueryExpandWrapper.vue';
import UploadFile from '@/components/UploadFile.vue';
import EuLoading from '@/components/EuLoading.vue';
import MCornerDecoration from '@/components/MCornerDecoration.vue';
import EnumRadioGroup from '@/components/EnumRadioGroup.vue';
import EnumSelect from '@/components/EnumSelect.vue';
import EnumTag from '@/components/EnumTag.vue';
import EnumText from '@/components/EnumText.vue';
import EuDrawer from '@/components/EuDrawer.vue';
import DictSelect from '@/components/DictSelect.vue';
import DictTag from '@/components/DictTag.vue';
import DictText from '@/components/DictText.vue';
// 导入自定义的表单组件
import mFormItemComponents from '@/utils/m-form-item-components';

const components = {
  SvgIcon,
  EuAvatar,
  MBlockHeader,
  EuEditor,
  Pagination,
  EuTableToolbar,
  QueryExpandWrapper,
  UploadFile,
  EuLoading,
  MCornerDecoration,
  EnumRadioGroup,
  EnumSelect,
  EnumTag,
  EnumText,
  EuDrawer,
  DictSelect,
  DictTag,
  DictText,
} as {
  [key in string]: Component;
};

export default {
  install: (Vue: App) => {
    // 注册组件
    Object.keys(components).forEach((key) => {
      Vue.component(key, components[key]);
    });

    // 注册自定义的表单组件
    Object.keys(mFormItemComponents).forEach((key) => {
      Vue.component(key, mFormItemComponents[key]);
    });
  },
};
