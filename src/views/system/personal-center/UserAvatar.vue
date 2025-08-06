<script setup lang="ts">
import 'vue-cropper/dist/index.css'
import { VueCropper }  from "vue-cropper";
import {computed, reactive, ref, useTemplateRef} from "vue";
import {useUserStore} from "@/store";
import {dataURLtoFile, requireImage} from "@/utils";
import {ElMessage} from "element-plus";
import {uploadFile} from "@/api/upload";
import {uploadAvatar} from "@/api/system/user";
import {Minus, Plus, RefreshLeft, RefreshRight, UploadFilled} from "@element-plus/icons-vue";
import useLoading from "@/hooks/loading";
import useVisible from "@/hooks/visible";

const refCropper = useTemplateRef('refCropper')
const { loading, setLoading } = useLoading(false)
const { visible: dialogVisible, setVisible: setDialogVisible } = useVisible(false)
const { visible, setVisible } = useVisible(false)

type CropperOptions = {
  img: string | ArrayBuffer | null;
  autoCrop: boolean;
  autoCropWidth: number;
  autoCropHeight: number;
  fixedBox: boolean;
  outputType: string;
}

const options = reactive<CropperOptions>({
  //裁剪图片的地址
  img: null,
  // 是否默认生成截图框
  autoCrop: true,
  // 默认生成截图框宽度
  autoCropWidth: 200,
  // 默认生成截图框高度
  autoCropHeight: 200,
  // 固定截图框大小 不允许改变
  fixedBox: true,
  // 默认生成截图为PNG格式
  outputType: 'png'
})

type PrevView = {
  url: string;
  img: string;
  value: string;
}

const previews = ref<PrevView>({} as PrevView)

const userStore = useUserStore()
const avatar = computed(() => {
  return userStore.user && userStore.user.avatar || requireImage('@/assets/images/default_avatar.png')
})


function onUploadAvatar() {
  options.img = avatar.value
  setDialogVisible(true)
}

function modalOpened() {
  setVisible(true)
}

function realTime(data: PrevView) {
  previews.value = data
}
function closeDialog() {
  setVisible(false)
}

function requestUpload() {}

function beforeUpload(file: Blob) {
  if (file.type.indexOf('image/') === -1) {
    ElMessage.error('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。');
  } else {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      options.img = reader.result;
    };
  }
}
function rotateLeft() {
  refCropper.value.rotateLeft()
}

function rotateRight() {
  refCropper.value.rotateRight()
}
function changeScale(num: number) {
  refCropper.value.changeScale(num || 1)
}
function onSave() {
  setLoading(true)
  refCropper.value.getCropData((data: string) => {
    const formData = new FormData();
    formData.append('file', dataURLtoFile(data, 'avatar.png'));
    uploadFile(formData).then(res => {
      uploadAvatar({
        avatar: res.link
      }).then(() => {
        ElMessage.success('头像修改成功')
        userStore.getInfo()
        setDialogVisible(false)
      }).finally(() => {
        setLoading(false)
      })
    }).catch(() => {
      setLoading(false)
    })
  })
}
</script>

<template>
  <div class="user-avatar">
    <div class="user-avatar-img" @click="onUploadAvatar">
      <el-avatar shape="square" :size="100" :src="avatar" />
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="修改头像"
      width="800px"
      class="user-avatar-upload-dialog"
      @opened="modalOpened"
      @close="closeDialog"
    >
      <el-row>
        <el-col :span="12" :style="{ height: '350px' }">
          <vue-cropper
            v-if="visible"
            ref="refCropper"
            :img="options.img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            :outputtype="options.outputType"
            :max-img-size="210"
            @real-time="realTime"
          />
        </el-col>
        <el-col :span="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <div style="display: flex">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
            style="margin-right: 30px"
            accept="image/*"
          >
            <el-button style="width: 150px">
              选 择
              <el-icon><UploadFilled/></el-icon>
            </el-button>
          </el-upload>
          <el-button :icon="Plus" @click="changeScale(1)"></el-button>
          <el-button :icon="Minus" @click="changeScale(-1)"></el-button>
          <el-button :icon="RefreshLeft" @click="rotateLeft()"></el-button>
          <el-button :icon="RefreshRight" @click="rotateRight()"></el-button>
        </div>
        <div style="flex: 1;">
          <el-button @click="setDialogVisible(false)">取 消</el-button>
          <el-button :loading="loading" type="primary" @click="onSave">保 存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.user-avatar {
  .user-avatar-img {
    position: relative;
    cursor: pointer;
    height: 100px;
    width: 100px;
    &:hover:before {
      content: '+';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #00000080;
      border-radius: 4px;
      line-height: 100px;
      width: 100px;
      text-align: center;
      color: #fff;
      font-size: 40px;
    }
  }
  .avatar-upload-preview {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    border-radius: 4px;
    box-shadow: 0 0 4px #ccc;
    overflow: hidden;
  }
}

:deep(.user-avatar-upload-dialog) {
  .el-dialog__footer {
    display: flex;
  }
}
</style>
