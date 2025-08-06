<template>
  <editor
    v-model="model"
    :init="init"
    :enabled="!disabled"
    :id="tinymceId"
  />
</template>
<script setup lang="ts">
import { uploadFile } from '@/api/upload'
import {reactive, watch, ref, defineProps } from "vue";

import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/icons/default/icons";
import "tinymce/models/dom"; // 一定要引入
import "tinymce/themes/silver"; // 界面UI主题
import "tinymce/plugins/image";
import "tinymce/plugins/table";
import "tinymce/plugins/lists"; // 列表插件
import "tinymce/plugins/wordcount"; // 文字计数
import "tinymce/plugins/preview"; // 预览
import "tinymce/plugins/emoticons"; // emoji表情
import "tinymce/plugins/emoticons/js/emojis.js"; //必须引入这个文件才有表情图库
import "tinymce/plugins/code"; // 编辑源码
import "tinymce/plugins/link"; // 链接插件
import "tinymce/plugins/advlist"; //高级列表
import "tinymce/plugins/codesample"; //代码示例
import "tinymce/plugins/autoresize"; // 自动调整编辑器大小
import "tinymce/plugins/quickbars"; // 光标处快捷提示
import "tinymce/plugins/nonbreaking"; //插入不间断空格
import "tinymce/plugins/searchreplace"; //查找替换
import "tinymce/plugins/autolink"; //自动链接
import "tinymce/plugins/directionality"; //文字方向
import "tinymce/plugins/visualblocks"; //显示元素范围
import "tinymce/plugins/visualchars"; //显示不可见字符
import "tinymce/plugins/charmap"; // 特殊符号
import "tinymce/plugins/nonbreaking"; //插入不间断空格
import "tinymce/plugins/insertdatetime"; //插入日期时间
import "tinymce/plugins/importcss"; //引入自定义样式的css文件
import "tinymce/plugins/accordion"; // 可折叠数据手风琴模式
import "tinymce/plugins/anchor"; //锚点
import "tinymce/plugins/fullscreen";

const tinymceId = ref(
  "vue-tinymce-" + +new Date() + ((Math.random() * 1000).toFixed(0) + "")
);

tinymce._setBaseUrl('/tinymce')
const content_style =
  `
  p { margin: 5px 0px;}
`

const model = defineModel<string>()

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Please enter content...'
  },
  height: {
    type: String,
    default: '400px'
  },
  minHeight: {
    type: Number,
    default: 400
  },
  // 编辑器初始可编辑状态
  editable_root: {
    type: Boolean,
    default: true,
  },
  toolbar: {
    type: String,
    default: 'fullscreen searchreplace | bold italic underline strikethrough forecolor backcolor | link unlink | alignleft aligncenter alignright alignjustify | bullist numlist | image table | formatselect | fontsizeselect | outdent indent'
  },
  plugins: {
    type: String,
    default: 'lists advlist image table autolink preview code fullscreen link searchreplace'
  }
});

//定义一个对象 init初始化
const init = reactive({
  selector: "#" + tinymceId.value, //富文本编辑器的id,
  license_key: 'gpl',
  language_url: "/tinymce/langs/zh_CN.js", // 语言包的路径，具体路径看自己的项目
  language: "zh_CN",
  skin_url: '/tinymce/skins/ui/oxide',
  placeholder: props.placeholder,
  editable_root: props.editable_root,
  height: props.height,
  branding: false, // 是否禁用“Powered by TinyMCE”
  promotion: false, //去掉 upgrade
  // toolbar_sticky: true,
  // toolbar_sticky_offset: 100,
  // menubar: "edit view insert format tools table",
  paste_data_images: true, //允许粘贴图像
  image_dimensions: false, //去除宽高属性
  plugins: props.plugins, //这里的数据是在props里面就定义好了的
  toolbar: props.toolbar, //这里的数据是在props里面就定义好了的
  // 取消图片资源路径转换
  convert_urls: false,
  // table边框位0是否展示网格线
  // visual: false,
  // 超链接默认打开方式
  link_default_target: "_blank",
  link_context_toolbar: true,
  font_size_formats: "12px 14px 16px 18px 24px 36px 48px 64px 72px", //文字大小
  image_caption: true,
  editimage_cors_hosts: ["picsum.photos"],
  noneditable_class: "mceNonEditable",
  toolbar_mode: "wrap", // 工具栏模式 floating / sliding / scrolling / wrap
  // 默认样式
  content_style: content_style,
  image_advtab: true,
  importcss_append: true,
  paste_webkit_styles: "all",
  paste_merge_formats: true,
  nonbreaking_force_tab: false,
  paste_auto_cleanup_on_paste: false,
  file_picker_types: "file",
  // 编辑器高度自适应
  autoresize_bottom_margin: 20,
  min_height: props.minHeight,
  content_css: "/tinymce/skins/content/default/content.css", //以css文件方式自定义可编辑区域的css样式，css文件需自己创建并引入
  //图片上传  -实列 具体请根据官网补充-
  images_upload_handler: (blobInfo: {
    blob: () => Blob;
  }, progress: number) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', blobInfo.blob());
      uploadFile(formData).then(res => {
        resolve(res.link)
      }).catch(e => {
        reject({
          message: e.message,
          remove: true,
        })
      })
    })
  },
});

</script>

<script lang="ts">
export default {
  name: 'EuEditor'
}
</script>
