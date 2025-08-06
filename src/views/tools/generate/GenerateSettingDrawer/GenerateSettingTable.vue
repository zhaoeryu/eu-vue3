<script setup lang="ts">
import {computed, inject, type Ref, useTemplateRef} from "vue";
import type {State} from "@/views/tools/generate/GenerateSettingDrawer/index.vue";
import type {FormInstance} from "element-plus";
import {InfoFilled} from "@element-plus/icons-vue";

const generateInfo = inject<State>('generateInfo')!;
const refForm = useTemplateRef<FormInstance>('refForm')
const rules = {
  tableComment: [
    {required: true, message: '请输入表注释', trigger: 'blur'},
  ],
  packageName: [
    {required: true, message: '请输入包路径', trigger: 'blur'},
  ],
  moduleName: [
    {required: true, message: '请输入模块名', trigger: 'blur'},
  ],
}

const fieldOptions = computed(() => {
  return generateInfo.list.map(item => item.javaField)
})

function validate() {
  return new Promise((resolve, reject) => {
    refForm.value?.validate(valid => {
      if (!valid) {
        reject()
      } else {
        resolve({})
      }
    })
  })
}

defineExpose({
  validate
})
</script>

<template>
  <el-form ref="refForm" :model="generateInfo.form" :rules="rules" label-width="150px">
    <div class="grid grid-cols-3">
      <el-form-item prop="tableComment" label="表注释">
        <el-input v-model="generateInfo.form.tableComment" placeholder="请输入表注释"></el-input>
      </el-form-item>
      <el-form-item prop="packageName" label="包路径">
        <template #label>
          <span>包路径</span>
          <el-tooltip class="item" effect="dark" content="生成代码所在的包路径，默认：cn.eu.business" placement="top">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </template>
        <el-input v-model="generateInfo.form.packageName" placeholder="请输入包路径"></el-input>
      </el-form-item>
      <el-form-item prop="moduleName" label="模块名">
        <template #label>
          <span>模块名</span>
          <el-tooltip class="item" effect="dark" content="生成代码所在的模块名，例如：eu-admin、eu-oss等，默认：eu-admin" placement="top">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </template>
        <el-input v-model="generateInfo.form.moduleName" placeholder="请输入模块名"></el-input>
      </el-form-item>
      <el-form-item prop="funcGroup" label="功能分组">
        <template #label>
          <span>功能分组</span>
          <el-tooltip class="item" effect="dark" placement="top">
            <template #content>
              <p>对功能进行分组，例如：功能分组=oss</p>
              <ul>
                <li>请求路径：/api/<strong>oss</strong>/test</li>
                <li>权限字符串：<strong>oss</strong>:test:del</li>
                <li>生成文件路径：api/<strong>oss</strong>/test.js</li>
              </ul>
            </template>
            <i class="el-icon-info"></i>
          </el-tooltip>
        </template>
        <el-input v-model="generateInfo.form.funcGroup" placeholder="请输入功能分组"></el-input>
      </el-form-item>
      <el-form-item prop="author" label="作者">
        <el-input v-model="generateInfo.form.author" placeholder="请输入作者"></el-input>
      </el-form-item>
      <el-form-item prop="delShowField" label="删除时显示的字段">
        <template #label>
          <span>删除时显示的字段</span>
          <el-tooltip class="item" effect="dark" placement="top">
            <template #content>
              <p>确认要删除"${ row.$delShowField }"吗？</p>
            </template>
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </template>
        <el-select v-model="generateInfo.form.delShowField" placeholder="请选择删除时显示的字段" filterable clearable>
          <el-option v-for="item in fieldOptions" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
<!--      <el-form-item prop="i18nEnable" label="开启i18n">-->
<!--        <el-switch v-model="generateInfo.form.i18nEnable"></el-switch>-->
<!--      </el-form-item>-->
<!--      <el-form-item prop="crudEditMode" label="crud编辑模式">-->
<!--        <el-radio-group v-model="generateInfo.form.crudEditMode">-->
<!--          <el-radio value="dialog">弹窗</el-radio>-->
<!--          <el-radio value="page">页面</el-radio>-->
<!--        </el-radio-group>-->
<!--      </el-form-item>-->
<!--      <el-form-item v-if="generateInfo.form.crudEditMode === 'page'" prop="detailHeaderFieldKey" label="详情页头部字段">-->
<!--        <el-select v-model="generateInfo.form.detailHeaderFieldKey" placeholder="请选择删除时显示的字段" filterable clearable>-->
<!--          <el-option v-for="item in fieldOptions" :key="item" :label="item" :value="item"></el-option>-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item prop="genMode" label="生成模式">
        <el-radio-group v-model="generateInfo.form.genMode">
          <el-radio :value="0">本地生成</el-radio>
          <el-radio :value="1">下载</el-radio>
        </el-radio-group>
      </el-form-item>
    </div>
  </el-form>
</template>

<style scoped lang="scss">

</style>
