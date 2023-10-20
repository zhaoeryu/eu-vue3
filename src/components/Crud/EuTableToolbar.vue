<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {Delete, Download, Plus, Refresh, Search, Setting, Sort, Upload} from "@element-plus/icons-vue";
import EuSortDialog from "@/components/Crud/EuSortDialog.vue";
import TableColumnSettingDialog from "@/components/TableColumnSettingDialog.vue";

const DEFAULT_OPT_SHOW = {
  add: true,
  del: true,
  export: true,
  import: true,

  refresh: true,
  searchToggle: true,
  columnSetting: true,
  sort: true
}
const DEFAULT_PERMISSION = {
  add: [],
  del: [],
  export: [],
  import: []
}

const props = defineProps({
  multipleDisabled: {
    type: Boolean,
    default: true
  },
  permission: {
    type: Object,
    default: () => {
      return { }
    }
  },
  optShow: {
    type: Object,
    default: () => {
      return { }
    }
  },
  refTable: Object,
  sort: {
    type: Array || String,
    default: () => []
  },
  searchToggle: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'add',
  'export',
  'import',
  'batchDel',

  'update:sort',
  'sort',
  'update:searchToggle',
  'refresh'
])

const innerSort = ref([])
const refSortDialog = ref(null)
const refTableColumnSettingDialog = ref(null)

const fullOptShow = computed(() => Object.assign({}, DEFAULT_OPT_SHOW, props.optShow))
const fullPermission = computed(() => Object.assign({}, DEFAULT_PERMISSION, props.permission))

onMounted(() => {
  innerSort.value = props.sort || []
})

function onSortComplete() {
  emit('update:sort', innerSort.value);
  emit('sort', innerSort.value);
}
</script>

<template>
  <el-row :gutter="16" class="eu-table-toolbar">
    <el-col :span="18" :xs="24" class="eu-table-toolbar__left">
      <slot name="left"></slot>
      <el-button v-if="fullOptShow.add" v-permissions="fullPermission.add" type="primary" :icon="Plus" plain @click="$emit('add')">添加</el-button>
      <el-button v-if="fullOptShow.del" v-permissions="fullPermission.del" :disabled="multipleDisabled" type="danger" :icon="Delete" plain @click="$emit('batchDel')">删除</el-button>
      <el-button v-if="fullOptShow.export" v-permissions="fullPermission.export" type="warning" :icon="Download" plain @click="$emit('export')">导出</el-button>
      <el-button v-if="fullOptShow.import" v-permissions="fullPermission.import" :icon="Upload" @click="$emit('import')">导入</el-button>
      <slot name="right"></slot>
    </el-col>
    <el-col :span="6" :xs="24" class="eu-table-toolbar__right">
      <el-button-group>
        <slot name="toolLeft"></slot>
        <el-button v-if="fullOptShow.refresh" :icon="Refresh" @click="$emit('refresh')"></el-button>
        <el-button v-if="fullOptShow.searchToggle" :icon="Search" @click="$emit('update:searchToggle', !searchToggle)"></el-button>
        <el-button v-if="fullOptShow.sort" :icon="Sort" @click="refSortDialog.open(refTable)"></el-button>
        <el-button v-if="fullOptShow.columnSetting" :icon="Setting" @click="refTableColumnSettingDialog.open(refTable)"></el-button>
        <slot name="toolRight"></slot>
      </el-button-group>
    </el-col>

    <eu-sort-dialog ref="refSortDialog" v-model="innerSort" @complete="onSortComplete" />
    <table-column-setting-dialog ref="refTableColumnSettingDialog" />
  </el-row>
</template>

<style scoped lang="scss">
@import "@/assets/styles/screen";
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
@media only screen and (max-width: $screen-md) {
  .eu-table-toolbar {
    margin-bottom: 12px;
    .eu-table-toolbar__right {
      text-align: left;
      margin-top: 12px;
    }
  }
}
</style>
