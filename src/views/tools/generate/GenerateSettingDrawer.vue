<script setup lang="ts">
import { tableInfo, syncTable, saveTable, saveColumns, queryTypeList as queryTypeListApi, formTypeList as formTypeListApi } from '@/api/system/generate'
import { page as dictPage } from '@/api/system/dict'

import { ref, reactive, onMounted, watch, computed } from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import {Finished, Refresh} from "@element-plus/icons-vue";

const show = ref(false)
const loading = ref(false)
const list = ref([])
const gen = ref({})
const activeName = ref('column')
const tableForm = ref({})
const tableRules = ref({})
const formLoading = ref(false)
const queryTypeList = ref([])
const dictList = ref([])
const formTypeList = ref([])

const refForm = ref(null)
const refTable = ref(null)

const pageTitle = computed(() => {
  return '生成配置 - ' + gen.value.tableName
})
const fieldOptions = computed(() => {
  return list.value.map(item => item.javaField)
})

function open(row) {
  show.value = true
  gen.value = row

  onLoadParams()
  onRefresh()
}

function onRefresh() {
  loading.value = true
  tableInfo({
    tableName: gen.value.tableName
  }).then(res => {
    tableForm.value = res.data.table
    list.value = res.data.columns
  }).finally(() => {
    loading.value = false
  })
}
function onLoadParams() {
  // 查询方式
  queryTypeListApi().then(res => {
    queryTypeList.value = res.data || []
  })
  // 字典
  dictPage({
    page: 1,
    size: 999
  }).then(res => {
    dictList.value = res.data.records || []
  })
  // 表单类型
  formTypeListApi().then(res => {
    formTypeList.value = res.data || []
  })
}
function onSave() {
  if (activeName.value === 'table') {
    refForm.value.validate(valid => {
      if (!valid) return
      formLoading.value = true
      saveTable(tableForm.value).then(() => {
        ElMessage.success('保存成功')
        onRefresh()
      }).finally(() => {
        formLoading.value = false
      })
    })
    return
  }

  // 保存列配置
  formLoading.value = true
  saveColumns(list.value).then(() => {
    ElMessage.success('保存成功')
    onRefresh()
  }).finally(() => {
    formLoading.value = false
  })
}

function onSync() {
  ElMessageBox.confirm('同步后会覆盖已配置信息，确定要同步吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        syncTable({
          tableName: gen.value.tableName
        }).then(() => {
          ElMessage.success('同步成功')
          onRefresh()
        }).finally(() => {
          instance.confirmButtonLoading = false;
        })
      } else {
        done()
      }
    }
  });
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    :title="pageTitle"
    v-model="show"
    width="90%"
    top="3vh"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
  >
    <div v-loading="loading" style="position: relative;">
      <el-tabs v-model="activeName">
        <el-tab-pane label="表配置" name="table">
          <div style="display: flex;justify-content: center;">
            <el-form ref="refForm" :model="tableForm" :rules="tableRules" label-width="150px" style="width: 500px;">
              <el-form-item prop="tableComment" label="表注释">
                <el-input v-model="tableForm.tableComment" placeholder="请输入表注释"></el-input>
              </el-form-item>
              <el-form-item prop="packageName" label="包路径">
                <template #label>
                  <span>包路径</span>
                  <el-tooltip class="item" effect="dark" content="生成代码所在的包路径，默认：cn.eu.business" placement="top">
                    <i class="el-icon-info"></i>
                  </el-tooltip>
                </template>
                <el-input v-model="tableForm.packageName" placeholder="请输入包路径"></el-input>
              </el-form-item>
              <el-form-item prop="moduleName" label="模块名">
                <template #label>
                  <span>模块名</span>
                  <el-tooltip class="item" effect="dark" content="生成代码所在的模块名，例如：eu-admin、eu-oss等，默认：eu-admin" placement="top">
                    <i class="el-icon-info"></i>
                  </el-tooltip>
                </template>
                <el-input v-model="tableForm.moduleName" placeholder="请输入模块名"></el-input>
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
                <el-input v-model="tableForm.funcGroup" placeholder="请输入功能分组"></el-input>
              </el-form-item>
              <el-form-item prop="author" label="作者">
                <el-input v-model="tableForm.author" placeholder="请输入作者"></el-input>
              </el-form-item>
              <el-form-item prop="delShowField" label="删除时显示的字段">
                <template #label>
                  <span>删除时显示的字段</span>
                  <el-tooltip class="item" effect="dark" placement="top">
                    <template #content>
                      <p>确认要删除"${ row.$delShowField }"吗？</p>
                    </template>
                    <i class="el-icon-info"></i>
                  </el-tooltip>
                </template>
                <el-select v-model="tableForm.delShowField" placeholder="请选择删除时显示的字段" filterable clearable>
                  <el-option v-for="item in fieldOptions" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="genMode" label="生成模式">
                <el-radio-group v-model="tableForm.genMode">
                  <el-radio :label="0">本地生成</el-radio>
                  <el-radio :label="1">下载</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="列配置" name="column">
          <el-table
            ref="refTable"
            :data="list"
            style="width: 100%"
          >
            <el-table-column prop="columnSort" label="序号" width="50"></el-table-column>
            <el-table-column prop="columnName" label="字段名"></el-table-column>
            <el-table-column prop="columnType" label="db字段类型"></el-table-column>
            <el-table-column prop="javaType" label="java字段类型"></el-table-column>
            <el-table-column prop="javaField" label="java字段名"></el-table-column>
            <el-table-column prop="columnComment" label="描述">
              <template #default="{ row }">
                <el-input v-model="row.columnComment" placeholder="输入描述" maxlength="32"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="excelExport" label="导出" width="50">
              <template #default="{ row }">
                <el-checkbox v-model="row.excelExport"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="tableShow" label="列表" width="50">
              <template #default="{ row }">
                <el-checkbox v-model="row.tableShow"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="formShow" label="表单" width="50">
              <template #default="{ row }">
                <el-checkbox v-model="row.formShow"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="notNull" label="不为空" width="60">
              <template #default="{ row }">
                <el-checkbox v-model="row.notNull"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column prop="queryType" label="查询方式" width="100">
              <template #default="{ row }">
                <el-select v-model="row.queryType" placeholder="选择查询方式" clearable>
                  <el-option v-for="item in queryTypeList" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="formType" label="表单类型" width="110">
              <template #default="{ row }">
                <el-select v-model="row.formType" placeholder="选择表单类型" clearable>
                  <el-option v-for="item in formTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="dict" label="关联字典">
              <template #default="{ row }">
                <el-select v-model="row.dictKey" placeholder="选择关联字典" clearable>
                  <el-option
                    v-for="item in dictList"
                    :key="item.dictKey"
                    :label="item.remark || item.dictKey"
                    :value="item.dictKey"
                  >
                    <span style="float: left">{{ item.remark || item.dictKey }}</span>
                    <span v-if="item.remark" style="float: right; color: #8492a6; font-size: 13px">&nbsp;&nbsp;{{ item.dictKey }}</span>
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <div style="position: absolute;top: 0;right: 0;">
        <el-button
          type="warning"
          :icon="Refresh"
          plain
          @click="onSync"
        >同 步</el-button>
        <el-button
          type="primary"
          :icon="Finished"
          :loading="formLoading"
          @click="onSave"
        >保 存</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.el-drawer__header {
  margin-bottom: 12px;
}
</style>
