<script setup lang="ts">
import {inject, onMounted} from "vue";
import type {State} from "@/views/tools/generate/GenerateSettingDrawer/index.vue";
import {useResettableReactive} from "@/hooks/resettable";
import { queryTypeList as queryTypeListApi, formTypeList as formTypeListApi } from '@/api/system/generate'
import { page as dictPage } from '@/api/system/dict'
import type {GenerateColumn} from "@/types/system/generate";
import {ElMessage} from "element-plus";
import mFormItemComponents from '@/utils/m-form-item-components'
import type {Dict} from "@/types/system/dict";
import businessEnums from "@/utils/business-enums";

const generateInfo = inject<State>('generateInfo')!;
const [state, reset] = useResettableReactive({
  queryTypeList: [],
  dictList: [] as Dict[],
  formTypeList: [] as {
    label: string
    value: string
  }[]
})

onMounted(() => {
  onLoadParams()
})

function onRowSort(row: GenerateColumn & {
  _sort: string;
  _sort_visible: boolean;
}) {
  // 转换为数字，防止输入字符串
  const targetSort = Number(row._sort);

  // 校验目标序号合法性
  if (
    isNaN(targetSort) ||
    targetSort < 1 ||
    targetSort > generateInfo.list.length
  ) {
    ElMessage.warning('请输入有效的排序序号');
    return;
  }

  // 隐藏排序输入框
  row._sort_visible = false;

  // 找到当前行在list中的索引
  const oldIndex = generateInfo.list.findIndex(item => item === row);
  if (oldIndex === -1) {
    return;
  }

  // 如果目标位置和当前索引一样，无需移动
  if (oldIndex === targetSort - 1) {
    return;
  }

  // 移除当前行
  const [movedRow] = generateInfo.list.splice(oldIndex, 1);

  // 计算插入位置
  // 目标序号-1为目标索引
  let insertIndex = targetSort - 1;
  // 如果是从上往下移动（oldIndex < insertIndex），
  // 由于移除后数组变短，插入点要-1
  if (oldIndex < insertIndex) {
    insertIndex = insertIndex - 1;
  }
  // 这样无论是上移还是下移，移动后的字段都在目标位置的上方
  generateInfo.list.splice(insertIndex, 0, movedRow);

  // 重新赋值columnSort
  generateInfo.list.forEach((item, idx) => {
    item.columnSort = idx + 1;
    // @ts-ignore
    delete item._sort
  });
}
function onLoadParams() {
  // 查询方式
  queryTypeListApi().then(res => {
    state.queryTypeList = res.data || []
  })
  // 字典
  dictPage({
    page: 1,
    size: 999
  }).then(res => {
    state.dictList = res.data.records || []
  })
  // 自定义表单类型
  const formTypeList = Object.keys(mFormItemComponents).map(item => ({
    label: item,
    value: item
  }))
  // 表单类型
  formTypeListApi().then(res => {
    state.formTypeList = [...(res.data || []), ...formTypeList]
  })
}

</script>

<template>
  <el-table
    :data="generateInfo.list"
    style="width: 100%"
  >
    <el-table-column prop="columnSort" label="序号" width="60" fixed="left" />

    <!-- 数据库字段列组 -->
    <el-table-column label="数据库字段" fixed="left">
      <el-table-column prop="columnName" label="字段名" width="120" show-overflow-tooltip />
      <el-table-column prop="columnType" label="字段类型" width="110" />
      <el-table-column prop="columnComment" label="注释" width="100" show-overflow-tooltip />
    </el-table-column>

    <!-- Java配置列组 -->
    <el-table-column label="Java配置">
      <el-table-column prop="javaField" label="字段名" width="120" show-overflow-tooltip />
      <el-table-column prop="javaType" label="字段类型" width="120" show-overflow-tooltip />
      <el-table-column prop="finalColumnComment" label="注释" width="120">
        <template #default="{ row }">
          <el-input v-model="row.finalColumnComment" placeholder="请点击填写..." maxlength="32" />
        </template>
      </el-table-column>
      <el-table-column prop="excelExport" label="导出" width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.excelExport" />
        </template>
      </el-table-column>
    </el-table-column>

    <!-- 列表配置列组 -->
    <el-table-column label="列表配置">
      <el-table-column prop="tableShow" label="列表" width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.tableShow" />
        </template>
      </el-table-column>
      <el-table-column prop="defaultVisible" label="可见" width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.defaultVisible" />
        </template>
      </el-table-column>
      <el-table-column prop="tableShowField" label="表格字段" width="140">
        <template #default="{ row }">
          <el-input v-model="row.tableShowField" placeholder="请点击填写..." maxlength="32" />
        </template>
      </el-table-column>
      <el-table-column prop="queryType" label="查询方式" width="100">
        <template #default="{ row }">
          <el-select v-model="row.queryType" placeholder="请点击选择..." clearable>
            <el-option v-for="item in state.queryTypeList" :key="item" :label="item" :value="item" />
          </el-select>
        </template>
      </el-table-column>
<!--      <el-table-column prop="areaQuery" label="区域查询" width="60">-->
<!--        <template #default="{ row }">-->
<!--          <el-checkbox v-model="row.areaQuery" />-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="tableHeaderQuery" label="表头查询" width="60">-->
<!--        <template #default="{ row }">-->
<!--          <el-checkbox v-model="row.tableHeaderQuery" />-->
<!--        </template>-->
<!--      </el-table-column>-->
    </el-table-column>

    <!-- 表单配置列组 -->
    <el-table-column label="表单配置">
      <el-table-column prop="jsType" label="Js类型" width="100" />
      <el-table-column prop="formShow" label="表单" width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.formShow" />
        </template>
      </el-table-column>
      <el-table-column prop="formType" label="表单类型" width="140">
        <template #default="{ row }">
          <el-select v-model="row.formType" placeholder="选择表单类型" clearable filterable>
            <el-option v-for="item in state.formTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="notNull" label="必填" width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.notNull" />
        </template>
      </el-table-column>
    </el-table-column>

    <!-- 数据源配置列组 -->
    <el-table-column label="数据源配置">
      <el-table-column prop="dictKey" label="字典" width="140">
        <template #default="{ row }">
          <el-select v-model="row.dictKey" placeholder="请点击选择..." clearable filterable>
            <el-option
              v-for="item in state.dictList"
              :key="item.dictKey"
              :label="item.dictKey"
              :value="item.dictKey"
            >
              <span style="float: left">{{ item.dictKey }}</span>
              <span v-if="item.remark" style="float: right; color: #8492a6; font-size: 13px">&nbsp;&nbsp;{{ item.remark || '-' }}</span>
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="enumKey" label="枚举" width="140">
        <template #default="{ row }">
          <el-select v-model="row.enumKey" placeholder="请点击选择..." clearable filterable>
            <el-option
              v-for="item in Object.keys(businessEnums)"
              :key="item"
              :label="item"
              :value="item"
            >
              <span>{{ item }}</span>
            </el-option>
          </el-select>
        </template>
      </el-table-column>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column label="操作" width="100" fixed="right">
      <template #default="{ row }">
        <el-popover
          placement="left"
          width="200"
          :key="row.columnName"
          trigger="click"
          :visible="row._sort_visible"
        >
          <div class="padding-bottom-sm">
            <el-input v-model="row._sort" placeholder="想插入的序号" type="number" />
          </div>
          <div style="text-align: right; margin: 0">
            <el-button text @click="row._sort_visible = false">取消</el-button>
            <el-button type="primary" @click="onRowSort(row)">确定</el-button>
          </div>
          <template #reference>
            <el-button text type="primary" @click="row._sort_visible = true">设置排序</el-button>
          </template>
        </el-popover>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">

</style>
