<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue';
import { ElMessage, type FormInstance, type TreeInstance, type TreeKey } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

import { add, getMenuIdsByRoleId, update } from '@/api/system/role';
import { list as menuList } from '@/api/system/menu';
import { handleTreeData } from '@/utils';
import useVisible from '@/hooks/visible';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import type { MenuTree } from '@/types/system/menu';
import EnumRadioGroup from '@/components/EnumRadioGroup.vue';
import { EnableFlagEnums } from '@/utils/enums';

const emit = defineEmits(['complete']);

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入权限字符串', trigger: 'blur' }],
  status: [{ required: true, message: '请选择角色状态', trigger: 'blur' }],
};
const DEFAULT_FORM = {
  id: null,
  roleName: null,
  description: null,
  roleKey: null,
  status: null,
  dataScope: 1,
};
const DEFAULT_FORM_EXTRA = {
  expand: false,
  checkedAll: false,
  checkStrictly: true,
  filterKeyword: null,
};

const refForm = useTemplateRef<FormInstance>('refForm');
const refMenuTree = useTemplateRef<TreeInstance>('refMenuTree');
const { visible, setVisible } = useVisible(false);
const { loading: formLoading, setLoading: setFormLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  form: {
    ...DEFAULT_FORM,
  },

  formStepActive: 0,
  formExtra: {
    ...DEFAULT_FORM_EXTRA,
  },

  menuTree: [] as MenuTree[],
  menuOriginList: [],
});

const title = computed(() => {
  return state.form.id ? '修改角色' : '新增角色';
});

watch(
  () => state.formExtra.filterKeyword,
  () => {
    refMenuTree.value?.filter(state.formExtra.filterKeyword);
  },
  {
    flush: 'post',
  },
);

function open(row: any) {
  reset();
  state.form = Object.assign({ ...DEFAULT_FORM }, row);
  setVisible(true);

  menuList({}).then((res) => {
    state.menuOriginList = res.data;
    state.menuTree = handleTreeData(state.menuOriginList) as MenuTree[];
  });
}

function onNext() {
  refForm.value?.validate((valid) => {
    if (!valid) {
      return;
    }

    state.formStepActive++;

    if (state.form.id) {
      setFormLoading(true);
      getMenuIdsByRoleId(state.form.id)
        .then((res) => {
          try {
            (res.data || []).forEach((key: TreeKey) => {
              refMenuTree.value?.setChecked(key, true, false);
            });
          } catch (e) {
            console.error(e);
          }
        })
        .finally(() => {
          setFormLoading(false);
        });
    }
  });
}

function onSubmit() {
  // 当前选中的菜单
  const checkedKeys = refMenuTree.value?.getCheckedKeys() || [];
  // 当前选中的菜单和半选中的菜单
  const halfCheckedKeys = refMenuTree.value?.getHalfCheckedKeys() || [];
  const checkedIds = [...checkedKeys, ...halfCheckedKeys];
  refForm.value?.validate((valid) => {
    if (!valid) {
      return;
    }

    setFormLoading(true);

    const reqPayload = {
      ...state.form,
      // 1: 表示本次操作为分配菜单
      operAction: 1,
      menuIds: checkedIds,
    };

    const reqPromise = state.form.id ? update(reqPayload) : add(reqPayload);
    reqPromise
      .then(() => {
        ElMessage.success(state.form.id ? '修改成功' : '新增成功');
        setVisible(false);
        emit('complete');
      })
      .finally(() => {
        setFormLoading(false);
      });
  });
}

function onDialogOpen() {
  nextTick(() => {
    if (refForm.value) {
      refForm.value.clearValidate();
    }
  });
}

// 树权限（展开/折叠）
function handleCheckedTreeExpand(checked: boolean) {
  for (let i = 0; i < state.menuTree.length; i++) {
    if (refMenuTree.value) {
      refMenuTree.value.store.nodesMap[state.menuTree[i].id].expanded = checked;
    }
  }
}
// 树权限（全选/全不选）
function handleCheckedTreeNodeAll(checked: boolean) {
  refMenuTree.value?.setCheckedNodes(checked ? state.menuTree : [], false);
}

function onFilterNode(value: string, node: any) {
  if (!value) {
    return true;
  }

  return node.menuName.indexOf(value) !== -1;
}

defineExpose({
  open,
});
</script>

<template>
  <el-dialog v-model="visible" :title="title" :close-on-click-modal="false" width="800px" class="eu-role-dialog" destroy-on-close @open="onDialogOpen">
    <el-form ref="refForm" :model="state.form" :rules="rules" label-width="100px">
      <el-steps :active="state.formStepActive" :align-center="true" finish-status="success">
        <el-step title="角色信息"></el-step>
        <el-step title="功能权限"></el-step>
      </el-steps>
      <template v-if="state.formStepActive === 0">
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="state.form.roleName" placeholder="请输入角色名称" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色描述" prop="description">
              <el-input v-model="state.form.description" placeholder="请输入角色描述" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限字符串" prop="roleKey">
              <el-input v-model="state.form.roleKey" placeholder="请输入权限字符串" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色状态" prop="status">
              <enum-radio-group v-model="state.form.status" :enums="EnableFlagEnums" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      <template v-else-if="state.formStepActive === 1">
        <el-form-item label="菜单权限">
          <div style="display: flex; margin-bottom: 12px">
            <div style="flex: 1">
              <el-checkbox v-model="state.formExtra.expand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
              <el-checkbox v-model="state.formExtra.checkedAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
              <el-checkbox v-model="state.formExtra.checkStrictly">父子联动</el-checkbox>
            </div>
            <el-input v-model="state.formExtra.filterKeyword" placeholder="输入关键字进行搜索" style="width: 200px" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-tree
            ref="refMenuTree"
            :data="state.menuTree"
            show-checkbox
            node-key="id"
            empty-text="暂无数据"
            :check-strictly="!state.formExtra.checkStrictly"
            :filter-node-method="onFilterNode"
            :props="{ label: 'menuName', children: 'children' }"
          ></el-tree>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button v-if="state.formStepActive > 0" @click="state.formStepActive--">上一步</el-button>
      <div style="flex: 1">
        <el-button @click="setVisible(false)">取 消</el-button>
        <el-button v-if="state.formStepActive < 1" class="eu-submit-btn" type="primary" @click="onNext">下一步</el-button>
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
        background: linear-gradient(to left, var(--color-primary), #ebeff7);
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
      content: '';
      width: 150px;
      height: 1px;
      background: #ebeff7;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate3d(-50%, -50%, 0);
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
