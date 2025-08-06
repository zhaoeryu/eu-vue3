<script setup lang="ts">
// @ts-nocheck
import Sortable from 'sortablejs';
import {nextTick, ref, toRef, useTemplateRef} from "vue";
import {Sort} from "@element-plus/icons-vue";
import useVisible from "@/hooks/visible";
import {type DialogInstance, type TableInstance } from "element-plus";

const { visible, setVisible } = useVisible(false)
const list = ref([])
const cacheRefTable = ref<TableInstance | null>(null)
const refDialog = useTemplateRef<DialogInstance>('refDialog')


function open(refTable: TableInstance, { ignoreColumns = [] } = {}) {
  if (!refTable) {
    throw new Error('请传入el-table的ref')
  }
  cacheRefTable.value = refTable

  // 缓存原始列数据
  if (refTable.store.states._eu_columns === undefined) {
    const _columns = refTable.store.states._columns.value.map(column => {
      column._eu_enabled = columnFilter(column, ignoreColumns)
      return column
    })
    // 初始化自定义状态
    refTable.store.states._eu_columns = toRef(_columns)
  }

  // 组织将要排序展示的数据
  const columns = refTable.store.states._eu_columns.value
  .filter(column => column._eu_enabled)
  .map(column => {
    const _newColumn = refTable.store.states._columns.value.find(item => item.id === column.id)
    return {
      id: column.id,
      label: column.label,
      property: column.property,
      visible: _newColumn?._eu_visible || column._eu_visible || !!_newColumn,
      enabled: column._eu_enabled || true,
      no: _newColumn?.no || column.no
    }
  }).sort((a, b) => {
    // 主要是针对第一次打开后，再次打开时，保持编辑后的顺序
    return a.no - b.no
  })
  list.value = columns
  setVisible(true)
  initSortable()
}

function columnFilter(column, ignoreColumns: string[]) {
  return column && column.type === 'default' && column.property && !ignoreColumns.includes(column.property) || false
}

async function initSortable() {
  await nextTick()
  const el = refDialog.value?.dialogContentRef.$el.querySelector('.table-column-setting-content')
  new Sortable(el, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onEnd: evt => {
      if (typeof evt.newIndex === 'number' && typeof evt.oldIndex === 'number') {
        const item = list.value[evt.oldIndex]
        list.value.splice(evt.oldIndex, 1)
        list.value.splice(evt.newIndex, 0, item)
      }
    }
  })
}

function onSave() {
  const tmpMap = new Map()
  list.value.forEach((column, index) => {
    column.no = index
    tmpMap[column.id] = column
  })

  cacheRefTable.value.store.states._columns.value = cacheRefTable.value?.store.states._eu_columns.value.map(column => {
    const _tmpColumn = tmpMap[column.id]
    if (!_tmpColumn) {
      // 针对未启用排序的列
      column._eu_visible = !column._eu_enabled
      return column
    }
    column.no = _tmpColumn.no
    column._eu_visible = _tmpColumn.visible
    return column
  })
  // 过滤掉不显示的
  .filter(column => column._eu_visible)

  // 根据no进行正序排序
  cacheRefTable.value?.store.states._columns.value.sort((a, b) => {
    return a.no - b.no
  })

  // 渲染布局
  cacheRefTable.value?.store.scheduleLayout(true, true)

  setVisible(false)
}

function onRestore() {
  list.value = cacheRefTable.value?.store.states._eu_columns.value.map(column => {
    return {
      id: column.id,
      label: column.label,
      property: column.property,
      visible: true,
      enabled: column._eu_enabled,
      no: column.no
    }
  })
}

defineExpose({
  open
})
</script>

<script lang="ts">
export default {
  name: 'TableColumnSettingDialog'
}
</script>

<template>
  <el-dialog
    title="列表设置"
    v-model="visible"
    :close-on-click-modal="false"
    width="560px"
    append-to-body
    class="dialog-footer-flex"
    ref="refDialog"
  >
    <div class="table-column-setting-wrapper">
      <div class="table-column-setting-header">
        <div>表头名称</div>
        <div>是否显示</div>
        <div>调整顺序</div>
      </div>
      <ul class="table-column-setting-content">
        <li v-for="item in list" v-show="item.enabled" :key="item.id">
          <div>{{ item.label }}</div>
          <el-switch v-model="item.visible" :active-value="true" :inactive-value="false" />
          <div class="handle">
            <el-icon><Sort/></el-icon>
          </div>
        </li>
      </ul>
    </div>
    <template #footer>
      <el-button @click="onRestore">重置预设</el-button>
      <div>
        <el-button @click="setVisible(false)">取 消</el-button>
        <el-button type="primary" @click="onSave">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.table-column-setting-wrapper {
  max-height: 460px;
  overflow-y: auto;
  color: var(--color-text-1);
}
.table-column-setting-header {
  font-weight: 500;
  font-size: 12px;
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: flex-start;
  padding: 0 20px;
  >div {
    flex: 1;
  }
  >:first-child {
    flex: 2;
  }
}
.table-column-setting-content {
  li {
    font-size: 12px;
    display: flex;
    height: 40px;
    align-items: center;
    justify-content: flex-start;
    padding: 0 20px;
    box-shadow: 0 -1px 0 0 var(--color-border-1);
    cursor: move;
    user-select: none;
    >div {
      flex: 1;
    }
    >:first-child {
      flex: 2;
    }
  }
}
.sortable-drag {
  background-color: var(--color-secondary-hover);
}
</style>
