<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, TreeInstance, TreeKey } from 'element-plus';
import { nextTick, ref, useTemplateRef, watch } from 'vue';

import { list as deptListApi } from '@/api/system/dept';
import { getDeptIdsByRoleId, update } from '@/api/system/role';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import useVisible from '@/hooks/visible';
import type { DeptTree, Dept } from '@/types/system/dept';
import type { Role } from '@/types/system/role';
import { handleTreeData } from '@/utils';
import { DataScopeEnums as dataScopeEnums } from '@/utils/enums';

const emit = defineEmits(['complete']);

const rules = {
  dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }],
};
const DEFAULT_FORM = {
  id: null as number | null,
  roleName: null,
  dataScope: null,
};
const DEFAULT_FORM_EXTRA = {
  expand: false,
  checkedAll: false,
  checkStrictly: true,
  filterKeyword: null,
};

const refForm = useTemplateRef<FormInstance>('refForm');
const refDeptTree = useTemplateRef<TreeInstance>('refDeptTree');
const { visible, setVisible } = useVisible(false);
const { loading: formLoading, setLoading: setFormLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  form: {
    ...DEFAULT_FORM,
  },
  formExtra: {
    ...DEFAULT_FORM_EXTRA,
  },

  deptTree: [] as DeptTree[],
  deptList: [] as Dept[],
});

const title = ref('分配数据权限');

watch(
  () => state.formExtra.filterKeyword,
  () => {
    refDeptTree.value?.filter(state.formExtra.filterKeyword);
  },
  {
    flush: 'post',
  },
);

function open(row: Role) {
  reset();
  state.form = Object.assign({ ...DEFAULT_FORM }, row);
  setVisible(true);

  setFormLoading(true);
  Promise.all([deptListApi({}), getDeptIdsByRoleId(state.form.id!)])
    .then((res) => {
      state.deptList = res[0].data;
      state.deptTree = handleTreeData(state.deptList) as DeptTree[];

      nextTick(() => {
        try {
          (res[1].data ?? []).forEach((key: TreeKey) => {
            refDeptTree.value?.setChecked(key, true, false);
          });
        } catch (e) {
          console.error(e);
        }
      });
    })
    .finally(() => {
      setFormLoading(false);
    });
}

function onSubmit() {
  refForm.value?.validate((valid) => {
    if (!valid) {
      return;
    }

    let checkedIds: TreeKey[] = [];
    if (dataScopeEnums.CUSTOM.value === state.form.dataScope) {
      const checkedKeys = refDeptTree.value?.getCheckedKeys() ?? [];
      const halfCheckedKeys = refDeptTree.value?.getHalfCheckedKeys() ?? [];
      checkedIds = [...checkedKeys, ...halfCheckedKeys];
    }

    const reqPayload = {
      ...state.form,
      // 2: 表示本次操作为分配数据权限
      operAction: 2,
      deptIds: checkedIds,
    };

    setFormLoading(true);
    update(reqPayload)
      .then(() => {
        ElMessage.success('操作成功');
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
  for (const item of state.deptList) {
    refDeptTree.value?.setChecked(item.id, checked, false);
  }
}
// 树权限（全选/全不选）
function handleCheckedTreeNodeAll(checked: boolean) {
  if (checked) {
    // Get all node keys for full selection
    const getAllKeys = (nodes: DeptTree[]): (string | number)[] => {
      const keys: (string | number)[] = [];
      nodes.forEach(node => {
        keys.push(node.id);
        if (node.children && node.children.length > 0) {
          keys.push(...getAllKeys(node.children));
        }
      });
      return keys;
    };
    const allKeys = getAllKeys(state.deptTree);
    refDeptTree.value?.setCheckedKeys(allKeys, false);
  } else {
    refDeptTree.value?.setCheckedKeys([], false);
  }
}

function onFilterNode(value: string, node: any) {
  if (!value) {
    return true;
  }

  return node.deptName.indexOf(value) !== -1;
}

defineExpose({
  open,
});
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    width="770px"
    @open="onDialogOpen"
  >
    <template #header>
      <div>
        <span class="el-dialog__title">{{ title }}</span>
        <span> - [{{ state.form.roleName }}]</span>
      </div>
    </template>
    <el-form
      ref="refForm"
      :model="state.form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item
        label="权限范围"
        prop="dataScope"
      >
        <el-radio-group v-model="state.form.dataScope">
          <el-radio-button
            v-for="item in dataScopeEnums"
            :key="item.value"
            :value="item.value"
          >{{ item.label
            }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="state.form.dataScope === dataScopeEnums.CUSTOM.value"
        label="数据权限"
      >
        <div>
          <div style="display: flex; margin-bottom: 12px">
            <div style="flex: 1">
              <el-checkbox
                v-model="state.formExtra.expand"
                @change="handleCheckedTreeExpand($event)"
              >展开/折叠</el-checkbox>
              <el-checkbox
                v-model="state.formExtra.checkedAll"
                @change="handleCheckedTreeNodeAll($event)"
              >全选/全不选</el-checkbox>
              <el-checkbox v-model="state.formExtra.checkStrictly">父子联动</el-checkbox>
            </div>
            <el-input
              v-model="state.formExtra.filterKeyword"
              placeholder="输入关键字进行搜索"
              style="width: 200px"
              clearable
              class="margin-left-sm"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>
          <el-tree
            ref="refDeptTree"
            :data="state.deptTree"
            show-checkbox
            node-key="id"
            empty-text="暂无数据"
            :check-strictly="!state.formExtra.checkStrictly"
            :filter-node-method="onFilterNode"
            default-expand-all
            :props="{ label: 'deptName', children: 'children' }"
          ></el-tree>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="setVisible(false)">取 消</el-button>
      <el-button
        :loading="formLoading"
        class="eu-submit-btn"
        type="primary"
        @click="onSubmit"
      >确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
