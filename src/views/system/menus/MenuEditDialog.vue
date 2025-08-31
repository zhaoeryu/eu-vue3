<script setup lang="ts">
import { ElMessage  } from 'element-plus';
import type {FormInstance} from 'element-plus';
import { computed, nextTick, ref, useTemplateRef } from 'vue';

import { add, update } from '@/api/system/menu';
import EnumRadioGroup from '@/components/EnumRadioGroup.vue';
import IconSelect from '@/components/IconSelect.vue';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import useVisible from '@/hooks/visible';
import type { MenuTree } from '@/types/system/menu';
import { EnableFlagEnums, MenuTypeEnums } from '@/utils/enums';

const emit = defineEmits(['complete']);

const rules = {
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择菜单状态', trigger: 'change' }],
  sortNum: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
  component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }],
};
const DEFAULT_FORM = {
  id: null,
  menuName: null,
  menuIcon: null,
  sortNum: 999,
  permission: null,
  path: null,
  params: null,
  componentName: null,
  component: null,
  status: null,
  visible: null,
  cache: null,
  iframe: null,
  dot: null,
  badge: null,
  menuType: null,
  parentId: null,
  showHeader: true,
  showFooter: true,
  alwaysShow: null,

  _parentIds: [],
};

const refForm = useTemplateRef<FormInstance>('refForm');
const { visible, setVisible } = useVisible(false);
const { loading: formLoading, setLoading: setFormLoading } = useLoading(false);
const [state, reset] = useResettableReactive({
  form: {
    ...DEFAULT_FORM,
  },
});

const list = ref<MenuTree[]>([]);

const title = computed(() => {
  return state.form.id ? '修改菜单' : '新增菜单';
});

function open(row: MenuTree, _list: MenuTree[]) {
  reset();
  state.form = Object.assign({ ...DEFAULT_FORM }, row);
  list.value = _list;
  setVisible(true);
}

function onSubmit() {
  refForm.value?.validate((valid) => {
    if (!valid) {
      return;
    }

    // 设置直接父级ID
    if (state.form._parentIds.length) {
      state.form.parentId = state.form._parentIds[state.form._parentIds.length - 1];
    } else {
      state.form.parentId = null;
    }

    setFormLoading(true);
    const reqPromise = state.form.id ? update(state.form) : add(state.form);
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

async function onDialogOpen() {
  await nextTick(() => {
    if (refForm.value) {
      refForm.value.clearValidate();
    }
  });
}

defineExpose({
  open,
});
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="800px" :close-on-click-modal="false" @open="onDialogOpen">
    <el-form ref="refForm" :model="state.form" :rules="rules" label-width="90px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="上级菜单" prop="parentId">
            <el-cascader
              v-model="state.form._parentIds"
              :options="list"
              :props="{
                checkStrictly: true,
                value: 'id',
                label: 'menuName',
                children: 'children',
              }"
              placeholder="请选择上级菜单"
              clearable
              filterable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="菜单类型" prop="menuType">
            <enum-radio-group v-model="state.form.menuType" :enums="MenuTypeEnums" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单名称" prop="menuName">
            <el-input v-model="state.form.menuName" placeholder="请输入菜单名称" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单状态" prop="status">
            <enum-radio-group v-model="state.form.status" :enums="EnableFlagEnums" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="sortNum">
            <el-input-number v-model="state.form.sortNum" placeholder="请输入显示排序" :min="0" :max="9999" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col v-if="state.form.menuType !== 3" :span="12">
          <el-form-item label="路由地址" prop="path">
            <el-input v-model="state.form.path" placeholder="请输入路由地址" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col v-if="state.form.menuType !== 3" :span="12">
          <el-form-item label="菜单图标" prop="menuIcon" class="el-form-item_menu-icon">
            <icon-select v-model="state.form.menuIcon">
              <template #reference>
                <el-input v-model="state.form.menuIcon" placeholder="请选择菜单图标" readonly>
                  <template #prefix>
                    <svg-icon v-if="state.form.menuIcon" :icon-class="state.form.menuIcon" />
                  </template>
                </el-input>
              </template>
            </icon-select>
          </el-form-item>
        </el-col>
        <template v-if="state.form.menuType === 2">
          <el-col :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="state.form.component" placeholder="请输入组件路径" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件Name" prop="componentName">
              <el-input v-model="state.form.componentName" placeholder="请输入组件Name" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由参数" prop="params">
              <el-input v-model="state.form.params" placeholder="请输入路由参数" maxlength="20" />
            </el-form-item>
          </el-col>
        </template>
        <el-col v-if="state.form.menuType !== 1" :span="12">
          <el-form-item label="权限标识" prop="permission">
            <el-input v-model="state.form.permission" placeholder="请输入权限标识" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col v-if="state.form.menuType !== 3" :span="12">
          <el-form-item label="是否显示" prop="hidden">
            <el-switch v-model="state.form.visible" :active-value="true" :inactive-value="false" />
          </el-form-item>
        </el-col>
        <el-col v-if="state.form.menuType === 1" :span="12">
          <el-form-item label="保持显示" prop="alwaysShow">
            <template #label>
              <el-tooltip class="item" effect="dark" content="当该目录的子菜单只有一项时，该目录是否保持显示。true：显示该目录，false：该目录隐藏直接显示子菜单" placement="top">
                <span>
                  <span>保持显示</span>
                  <i class="el-icon-info" />
                </span>
              </el-tooltip>
            </template>
            <el-switch v-model="state.form.alwaysShow" :active-value="true" :inactive-value="false" />
          </el-form-item>
        </el-col>
        <template v-if="state.form.menuType === 2">
          <el-col :span="12">
            <el-form-item label="是否缓存" prop="cache">
              <el-switch v-model="state.form.cache" :active-value="true" :inactive-value="false" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示Header" prop="showHeader">
              <el-switch v-model="state.form.showHeader" :active-value="true" :inactive-value="false" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示Footer" prop="showFooter">
              <el-switch v-model="state.form.showFooter" :active-value="true" :inactive-value="false" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="dot" prop="dot">
              <el-switch v-model="state.form.dot" :active-value="true" :inactive-value="false" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="badge" prop="badge">
              <el-input v-model="state.form.badge" placeholder="请输入badge" maxlength="5" />
            </el-form-item>
          </el-col>
        </template>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="setVisible(false)">取 消</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
