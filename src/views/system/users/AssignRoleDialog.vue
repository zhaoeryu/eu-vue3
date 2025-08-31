<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed } from 'vue';

import { page as roleListApi } from '@/api/system/role';
import { assignRole, getUserInfo } from '@/api/system/user';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import useVisible from '@/hooks/visible';
import type { ANY_OBJECT } from '@/types/generic';
import type { Role } from '@/types/system/role';

const emit = defineEmits(['success']);

type State = {
  roleIds: number[];
  roleId: string;
  userId: string | null;
  roleList: Role[];
} & Partial<ANY_OBJECT>;

const { visible, setVisible } = useVisible(false);
const { loading, setLoading } = useLoading(false);
const [state, reset] = useResettableReactive<State>({
  roleIds: [],
  roleId: '',
  userId: null,
  roleList: [],
});

const assignRoleList = computed(() => {
  return state.roleIds
    .map((id) => {
      const role = state.roleList.find((item) => item.id === id);
      if (role) {
        return role;
      }
    })
    .filter((item) => item !== undefined);
});

function open(_userId: string) {
  reset();
  state.userId = _userId;
  setVisible(true);
  setLoading(true);
  Promise.all([roleListApi({ page: 1, size: 999 }), getUserInfo(_userId)])
    .then((res) => {
      state.roleList = res[0].data.records ?? [];
      state.roleIds = res[1].data.roleIds ?? [];
    })
    .finally(() => {
      setLoading(false);
    });
}

function onRemoveRole(tag: Role) {
  state.roleIds = state.roleIds.filter((item) => item !== tag.id);
}

function onAssignRoleSelectChange(_roleId: number) {
  state.roleIds.push(_roleId);
  state.roleId = '';
}

function onAssignRoleSave() {
  setLoading(true);
  assignRole({
    id: state.userId,
    roleIds: state.roleIds,
  })
    .then(() => {
      ElMessage.success('分配角色成功');
      setVisible(false);
      emit('success');
    })
    .finally(() => {
      setLoading(false);
    });
}
function onDialogClose() {
  reset();
}

defineExpose({
  open,
});
</script>

<template>
  <el-dialog
    v-model="visible"
    title="分配角色"
    width="700px"
    @close="onDialogClose"
  >
    <div class="assign-role-wrapper">
      <el-tag
        v-for="tag in assignRoleList"
        :key="tag.id"
        closable
        :disable-transitions="false"
        @close="onRemoveRole(tag)"
      >
        {{ tag.roleName }}
      </el-tag>
      <el-select
        v-model="state.roleId"
        placeholder="请选择角色"
        filterable
        class="input-new-tag"
        @change="onAssignRoleSelectChange"
      >
        <el-option
          v-for="item in state.roleList"
          :key="item.id"
          :disabled="assignRoleList.some((v) => v.id === item.id)"
          :label="item.roleName"
          :value="item.id"
        />
      </el-select>
    </div>

    <template #footer>
      <el-button @click="setVisible(false)">取 消</el-button>
      <el-button
        :loading="loading"
        type="primary"
        @click="onAssignRoleSave"
      >确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.assign-role-wrapper {
  .el-tag {
    height: 32px;
    line-height: 32px;
  }

  .el-tag+.el-tag {
    margin-left: 10px;
  }

  .input-new-tag {
    width: 120px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
