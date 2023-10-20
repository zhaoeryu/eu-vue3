<script setup lang="ts">
import Sortable from 'sortablejs'
import { camelCaseToUnderline } from '@/utils'
import {ref, nextTick} from "vue";
import {Delete} from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: Array || String
})

const emit = defineEmits(['update:modelValue', 'complete'])

interface IColumns {
  fieldName: string
  fieldLabel: string
  sort: string
  checked: boolean
}

const show = ref(false)
const columns = ref<IColumns[]>([])
const sortResult = ref<IColumns[]>([])

const refDialog = ref(null)

function open(refTable) {
  show.value = true

  // 获取表格列配置
  const _columns = refTable.store.states._columns.value.filter(item => item && item.property && item.label)
    .map(column => {
      const columnName = camelCaseToUnderline(column.property)
      return {
        fieldName: columnName,
        fieldLabel: column.label,
        sort: sortResult.value.find(item => item.fieldName === columnName)?.sort
      }
    })

  // 初始化排序项
  let _sort = []
  if (typeof props.modelValue === 'string') {
    _sort.push(props.modelValue)
  } else if (Array.isArray(props.modelValue)) {
    _sort = props.modelValue
  }
  sortResult.value = _sort.map(item => {
    const column = _columns.find(column => column.fieldName === item.split(',')[0]) || {
      fieldName: item.split(',')[0],
    }
    return {
      ...column,
      sort: item.split(',')[1]
    }
  })

  // 设置选项禁用
  _columns.forEach(column => {
    column.checked = !!sortResult.value.find(item => item.fieldName === column.fieldName)
  })
  columns.value = _columns

  initSortable()
}

async function initSortable() {
  await nextTick()
  const el = refDialog.value.dialogContentRef.$el.querySelector('.sort-column-content')
  Sortable.create(el, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onEnd: function (evt) {
      const item = sortResult.value[evt.oldIndex]
      sortResult.value.splice(evt.oldIndex, 1)
      sortResult.value.splice(evt.newIndex, 0, item)
    }
  })
}

function onSave() {
  const _sort = sortResult.value.map(item => `${item.fieldName},${item.sort}`)
  emit('update:modelValue', _sort)
  emit('complete')
  show.value = false
}

function onCommand(fieldName) {
  const item = columns.value.find(item => item.fieldName === fieldName)
  const newItem = { ...item }
  if (!newItem.sort) {
    newItem.sort = 'desc'
  }
  item.checked = true
  sortResult.value.push(newItem)
}

function onClear() {
  sortResult.value = []
  columns.value.forEach(column => {
    column.checked = false
  })
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    title="设置排序规则"
    v-model="show"
    width="560px"
    ref="refDialog"
    append-to-body
    class="eu-sort-dialog"
  >
    <div style="padding: 20px;min-height: 200px;">
      <el-dropdown
        trigger="click"
        placement="bottom-start"
        @command="onCommand"
      >
        <div style="cursor: pointer;" class="text-primary">
          <i style="font-weight: bold;" class="el-icon-plus"></i>
          <span>&nbsp;添加排序规则</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in columns"
              :command="item.fieldName"
              :key="index"
              :disabled="item.checked"
            >{{ item.fieldLabel }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="sort-column-wrapper">
        <ul class="sort-column-content">
          <li v-for="(item, index) in sortResult" :key="item.fieldName">
            <div>{{ item.fieldLabel }}</div>
            <el-radio-group v-model="item.sort">
              <el-radio-button label="asc">升序</el-radio-button>
              <el-radio-button label="desc">降序</el-radio-button>
            </el-radio-group>
            <div class="handle">
              <svg-icon icon-class="drag" />
              <el-icon style="cursor: pointer;vertical-align: 0.15em;" @click="sortResult.splice(index, 1)"><Delete/> </el-icon>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClear">清空排序</el-button>
      <div>
        <el-button @click="show = false">取 消</el-button>
        <el-button type="primary" class="eu-submit-btn" @click="onSave">排 序</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.eu-sort-dialog {
  .el-dialog__footer {
    border-top: 1px solid var(--color-border-1);
    display: flex;
    justify-content: space-between;
  }
  .el-dialog__body {
    padding: 0;
  }
  .el-dropdown-menu__item {
    min-width: 250px;
  }
}
</style>
<style scoped lang="scss">
.sort-column-wrapper {
  padding: 24px 0;
  color: var(--color-text-1);
}
.sort-column-content {
  li {
    display: flex;
    height: 40px;
    align-items: center;
    justify-content: flex-start;
    padding: 0 20px;
    cursor: move;
    user-select: none;
    >:first-child {
      flex: 2;
      text-align: left;
    }
    &:not(:first-child) {
      box-shadow: 0 -1px 0 0 var(--color-border-1);
      flex: 1;
      text-align: right;
    }
    .handle {
      padding-left: 12px;
      >i {
        margin-left: 12px;
        font-weight: bold;
        font-size: 16px;
      }
      >svg {
        width: 1.5em;
        height: 1.5em;
      }
    }
  }
}
.sortable-drag {
  background-color: var(--color-secondary-hover);
}
</style>
