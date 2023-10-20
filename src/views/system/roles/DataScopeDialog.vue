<script setup lang="ts">
import {ElMessage} from "element-plus";
import {nextTick, ref, watch} from "vue";
import {Search} from "@element-plus/icons-vue";
import { getDeptIdsByRoleId, update } from '@/api/system/role'
import { DataScopeEnums as dataScopeEnums } from '@/utils/enums'
import { list as deptListApi } from '@/api/system/dept'
import { handleTreeData } from '@/utils'

const DEFAULT_FORM = {
  dataScope: null
}
const DEFAULT_FORM_EXTRA = {
  expand: false,
  checkedAll: false,
  checkStrictly: true,
  filterKeyword: null
}


const emit = defineEmits(['complete'])

const show = ref(false)
const formLoading = ref(false)
const form = ref(DEFAULT_FORM)
const rules = {
  dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }]
}
const formExtra = ref(DEFAULT_FORM_EXTRA)
const deptList = ref([])
const deptTree = ref([])
const title = ref('分配数据权限')

const refForm = ref(null)
const refDeptTree = ref(null)

watch(() => formExtra.value.filterKeyword, () => {
  refDeptTree.value.filter(formExtra.value.filterKeyword)
}, {
  flush: 'post'
})

function open(row) {
  form.value = Object.assign({...DEFAULT_FORM}, row)
  show.value = true

  formLoading.value = true
  Promise.all([
    deptListApi({}),
    getDeptIdsByRoleId(form.value.id)
  ]).then(res => {
    deptList.value = res[0].data
    deptTree.value = handleTreeData(deptList.value)

    nextTick(() => {
      try {
        (res[1].data || []).forEach(key => {
          refDeptTree.value.setChecked(key, true, false)
        })
      } catch (e) {
        console.error(e)
      }
    })
  }).finally(() => {
    formLoading.value = false
  })
}

function onSubmit() {
  refForm.value.validate(valid => {
    if (!valid) {
      return false
    }

    let checkedIds = []
    if (dataScopeEnums.CUSTOM.value === form.value.dataScope) {
      const checkedKeys = refDeptTree.value.getCheckedKeys()
      const halfCheckedKeys = refDeptTree.value.getHalfCheckedKeys()
      checkedIds = [...checkedKeys, ...halfCheckedKeys]
    }

    const reqPayload = {
      ...form.value,
      // 2: 表示本次操作为分配数据权限
      operAction: 2,
      deptIds: checkedIds
    }

    formLoading.value = true
    update(reqPayload).then(() => {
      ElMessage.success('操作成功')
      show.value = false
      emit('complete')
    }).finally(() => {
      formLoading.value = false
    })
  })
}

function onDialogOpen() {
  nextTick(() => {
    if (refForm.value) {
      refForm.value.clearValidate()
    }
  })
}

// 树权限（展开/折叠）
function handleCheckedTreeExpand(checked) {
  for (let i = 0; i < deptList.value.length; i++) {
    refDeptTree.value.setChecked(deptList.value[i].id, checked, false)
  }
}
// 树权限（全选/全不选）
function handleCheckedTreeNodeAll(checked) {
  refDeptTree.value.setCheckedNodes(checked ? deptList.value : [], false)
}

function onFilterNode(value, node) {
  if (!value) {
    return true
  }

  return node.deptName.indexOf(value) !== -1
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
      :title="title"
      v-model="show"
      :close-on-click-modal="false"
      width="770px"
      @open="onDialogOpen"
  >
    <template #header>
      <div>
        <span class="el-dialog__title">{{ title }}</span>
        <span> - [{{ form.roleName }}]</span>
      </div>
    </template>
    <el-form ref="refForm" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="权限范围" prop="dataScope">
        <el-radio-group v-model="form.dataScope">
          <el-radio-button
              v-for="item in dataScopeEnums"
              :key="item.value"
              :label="item.value"
          >{{ item.label }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.dataScope === dataScopeEnums.CUSTOM.value" label="数据权限">
        <div style="display: flex;margin-bottom: 12px;">
          <div style="flex: 1;">
            <el-checkbox v-model="formExtra.expand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
            <el-checkbox v-model="formExtra.checkedAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
            <el-checkbox v-model="formExtra.checkStrictly">父子联动</el-checkbox>
          </div>
          <el-input placeholder="输入关键字进行搜索" v-model="formExtra.filterKeyword" style="width: 200px;" clearable>
            <template #prefix>
              <el-icon><Search/></el-icon>
            </template>
          </el-input>
        </div>
        <el-tree
            :data="deptTree"
            show-checkbox
            ref="refDeptTree"
            node-key="id"
            empty-text="暂无数据"
            :check-strictly="!formExtra.checkStrictly"
            :filter-node-method="onFilterNode"
            default-expand-all
            :props="{ label: 'deptName', children: 'children' }"
        ></el-tree>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="show = false">取 消</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
