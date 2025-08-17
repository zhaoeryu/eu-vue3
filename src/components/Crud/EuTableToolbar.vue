<script setup lang="ts">
import { computed, useTemplateRef, withDefaults } from 'vue';
import { Delete, Download, Plus, Refresh, Search, Setting, Sort, Upload } from '@element-plus/icons-vue';
import { type TableInstance } from 'element-plus';

import EuSortDialog from '@/components/Crud/EuSortDialog.vue';
import TableColumnSettingDialog from '@/components/TableColumnSettingDialog.vue';

export interface Permission {
  add: string[];
  del: string[];
  export: string[];
  import: string[];
}

export interface OptShow {
  add: boolean;
  del: boolean;
  export: boolean;
  import: boolean;

  refresh: boolean;
  searchToggle: boolean;
  columnSetting: boolean;
  sort: boolean;
}

export interface Props {
  multipleDisabled?: boolean;
  permission?: Permission;
  optShow: OptShow;
  refTable: TableInstance | null;
}

const DEFAULT_OPT_SHOW: OptShow = {
  add: true,
  del: true,
  export: true,
  import: true,

  refresh: true,
  searchToggle: true,
  columnSetting: true,
  sort: true,
};
const DEFAULT_PERMISSION: Permission = {
  add: [],
  del: [],
  export: [],
  import: [],
};

const props = withDefaults(defineProps<Props>(), {
  multipleDisabled: true,
  permission: () => ({}) as Permission,
});

const emit = defineEmits(['add', 'export', 'import', 'batchDel', 'sort', 'refresh']);

const innerSort = defineModel<string[]>('sort');
const searchToggle = defineModel<boolean>('searchToggle');
const refSortDialog = useTemplateRef('refSortDialog');
const refTableColumnSettingDialog = useTemplateRef('refTableColumnSettingDialog');

const fullOptShow = computed(() => Object.assign({}, DEFAULT_OPT_SHOW, props.optShow));
const fullPermission = computed(() => Object.assign({}, DEFAULT_PERMISSION, props.permission));

function onSortComplete() {
  emit('sort', innerSort.value);
}
</script>

<script lang="ts">
export default {
  name: 'EuTableToolbar',
};
</script>

<template>
  <el-row :gutter="16" class="eu-table-toolbar">
    <el-col :span="18" :xs="24" class="eu-table-toolbar__left">
      <slot name="left" />
      <el-button v-if="fullOptShow.add" v-permissions="fullPermission.add" type="primary" :icon="Plus" plain @click="emit('add')">添加</el-button>
      <el-button v-if="fullOptShow.del" v-permissions="fullPermission.del" :disabled="multipleDisabled" type="danger" :icon="Delete" plain @click="emit('batchDel')">删除</el-button>
      <el-button v-if="fullOptShow.export" v-permissions="fullPermission.export" type="warning" :icon="Download" plain @click="emit('export')">导出</el-button>
      <el-button v-if="fullOptShow.import" v-permissions="fullPermission.import" :icon="Upload" @click="emit('import')">导入</el-button>
      <slot name="right" />
    </el-col>
    <el-col :span="6" :xs="24" class="eu-table-toolbar__right">
      <el-button-group>
        <slot name="toolLeft" />
        <el-button v-if="fullOptShow.refresh" :icon="Refresh" @click="emit('refresh')"></el-button>
        <el-button v-if="fullOptShow.searchToggle" :icon="Search" @click="searchToggle = !searchToggle"></el-button>
        <el-button v-if="fullOptShow.sort && refTable" :icon="Sort" @click="refSortDialog?.open(refTable)"></el-button>
        <el-button v-if="fullOptShow.columnSetting && refTable" :icon="Setting" @click="refTableColumnSettingDialog?.open(refTable)"></el-button>
        <slot name="toolRight" />
      </el-button-group>
    </el-col>

    <eu-sort-dialog ref="refSortDialog" v-model="innerSort" @complete="onSortComplete" />
    <table-column-setting-dialog ref="refTableColumnSettingDialog" />
  </el-row>
</template>

<style scoped lang="scss">
@use '@/assets/styles/screen';
.eu-table-toolbar {
  margin-bottom: 12px;
  // 解决左侧工具栏为空时，右侧工具栏会偏移的问题
  .eu-table-toolbar__left:empty {
    height: 1px;
  }
  .eu-table-toolbar__right {
    text-align: right;
  }
}
@media only screen and (max-width: screen.$screen-md) {
  .eu-table-toolbar {
    margin-bottom: 12px;
    .eu-table-toolbar__right {
      text-align: left;
      margin-top: 12px;
    }
  }
}
</style>
