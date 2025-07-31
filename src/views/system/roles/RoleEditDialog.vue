<script setup lang="ts">
import {computed, nextTick, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import { add, getMenuIdsByRoleId, update } from '@/api/system/role'
import { list as menuList } from '@/api/system/menu'
import { handleTreeData } from '@/utils'
import {Search} from "@element-plus/icons-vue";

const DEFAULT_FORM = {
  roleName: null,
  description: null,
  roleKey: null,
  status: null,
  dataScope: 1,
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
const formExtra = ref(DEFAULT_FORM_EXTRA)
const formStepActive = ref(0)
const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入权限字符串', trigger: 'blur' }],
  status: [{ required: true, message: '请选择角色状态', trigger: 'blur' }]
}
const menuTree = ref([])
const menuOriginList = ref([])
const menuTreeLoading = ref(false)

const refForm = ref(null)
const refMenuTree = ref(null)
const title = computed(() => {
  return form.value.id ? '修改角色' : '新增角色'
})

watch(() => formExtra.value.filterKeyword, () => {
  refMenuTree.value.filter(formExtra.value.filterKeyword)
}, {
  flush: 'post'
})

function open(row) {
  form.value = Object.assign({...DEFAULT_FORM}, row)
  formExtra.value = {...DEFAULT_FORM_EXTRA}
  show.value = true

  menuList().then(res => {
    menuOriginList.value = res.data
    menuTree.value = handleTreeData(menuOriginList.value)
  })
}

function onNext() {
  refForm.value.validate(valid => {
    if (!valid) {
      return false
    }

    formStepActive.value++

    if (form.value.id) {
      formLoading.value = true
      getMenuIdsByRoleId(form.value.id).then(res => {
        try {
          (res.data || []).forEach(key => {
            refMenuTree.value.setChecked(key, true, false)
          })
        } catch (e) {
          console.error(e)
        }
      }).finally(() => {
        formLoading.value = false
      })
    }
  })
}

function onSubmit() {
  // 当前选中的菜单
  const checkedKeys = refMenuTree.value.getCheckedKeys()
  // 当前选中的菜单和半选中的菜单
  const halfCheckedKeys = refMenuTree.value.getHalfCheckedKeys()
  const checkedIds = [...checkedKeys, ...halfCheckedKeys]
  refForm.value.validate(valid => {
    if (!valid) {
      return false
    }

    formLoading.value = true

    const reqPayload = {
      ...form.value,
      // 1: 表示本次操作为分配菜单
      operAction: 1,
      menuIds: checkedIds
    }

    const reqPromise = form.value.id ? update(reqPayload) : add(reqPayload)
    reqPromise.then(() => {
      ElMessage.success(form.value.id ? '修改成功' : '新增成功')
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
  for (let i = 0; i < menuTree.value.length; i++) {
    refMenuTree.value.store.nodesMap[menuTree.value[i].id].expanded = checked;
  }
}
// 树权限（全选/全不选）
function handleCheckedTreeNodeAll(checked) {
  refMenuTree.value.setCheckedNodes(checked ? menuTree.value : [], false)
}

function onFilterNode(value, node) {
  if (!value) {
    return true
  }

  return node.menuName.indexOf(value) !== -1
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
    width="700px"
    class="eu-role-dialog"
    destroy-on-close
    @open="onDialogOpen"
  >
    <el-form ref="refForm" :model="form" :rules="rules" label-width="100px">
      <el-steps :active="formStepActive" :align-center="true" finish-status="success">
        <el-step title="角色信息"></el-step>
        <el-step title="功能权限"></el-step>
      </el-steps>
      <template v-if="formStepActive === 0">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="form.roleName" placeholder="请输入角色名称" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色描述" prop="description">
              <el-input v-model="form.description" placeholder="请输入角色描述" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限字符串" prop="roleKey">
              <el-input v-model="form.roleKey" placeholder="请输入权限字符串" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="0">正常</el-radio>
                <el-radio :label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      <template v-else-if="formStepActive === 1">
        <el-form-item label="菜单权限">
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
              :data="menuTree"
              show-checkbox
              ref="refMenuTree"
              node-key="id"
              empty-text="暂无数据"
              :check-strictly="!formExtra.checkStrictly"
              :filter-node-method="onFilterNode"
              :props="{ label: 'menuName', children: 'children' }"
          ></el-tree>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button v-if="formStepActive > 0" @click="formStepActive--">上一步</el-button>
      <div style="flex: 1;">
        <el-button @click="show = false">取 消</el-button>
        <el-button v-if="formStepActive < 1" class="eu-submit-btn" type="primary" @click="onNext">下一步</el-button>
        <el-button v-else :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
// 步骤条样式
.el-steps {
  margin-bottom: 24px;
  :deep(.el-step) {
    .el-step__icon {
      width: 20px;
      height: 20px;
      &.is-text {
        color: #fff;
        background-color: var(--color-primary);
        border-radius: 50%;
        border: 1px solid var(--color-primary);
      }
    }
    .el-step__title {
      font-size: 13px;
      &.is-success {
        color: #333;
      }
    }
    .el-step__line {
      background-color: unset !important;
    }
    .is-success {
      .el-step__line:before {
        background: var(--color-primary);
      }
    }
    .is-process {
      font-weight: unset;
      color: var(--color-primary);
      .el-step__line:before {
        background: -webkit-linear-gradient(left,var(--color-primary),#ebeff7);
        color: transparent;
      }
    }
    .is-wait {
      color: #999;
      .el-step__icon {
        background-color: transparent;
        &.is-text {
          color: #999;
          border-color: #d9d9d9;
        }
      }
    }
    .el-step__line:before {
      content: "";
      width: 150px;
      height: 1px;
      background: #ebeff7;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate3d(-50%,-50%,0);
    }
    .el-step__line-inner {
      display: none;
    }
  }
}
</style>
<style lang="scss">
.eu-role-dialog {
  .el-dialog__footer {
    border-top: 1px solid #e0e0e0;
    display: flex;
  }
  .el-dialog__body {
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>
