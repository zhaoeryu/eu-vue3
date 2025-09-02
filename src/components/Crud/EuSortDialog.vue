<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue';
import type { DialogInstance, TableInstance } from 'element-plus';
import Sortable from 'sortablejs';
import { ref, nextTick, useTemplateRef } from 'vue';

import useVisible from '@/hooks/visible';
import { camelCaseToUnderline } from '@/utils';

interface IColumns {
  fieldName: string;
  fieldLabel: string;
  sort: string;
  checked: boolean;
}

const model = defineModel<string[]>();
const emit = defineEmits(['complete']);

const { visible, setVisible } = useVisible(false);
const columns = ref<IColumns[]>([]);
const sortResult = ref<IColumns[]>([]);
const refDialog = useTemplateRef<DialogInstance>('refDialog');

function open(refTable: TableInstance) {
  setVisible(true);

  // 获取表格列配置
  const _columns: IColumns[] = refTable.store.states._columns.value
    .filter((item) => item?.property && item.label)
    .map((column) => {
      const columnName = camelCaseToUnderline(column.property);
      return {
        fieldName: columnName,
        fieldLabel: column.label,
        sort: sortResult.value.find((item) => item.fieldName === columnName)?.sort,
      } as IColumns;
    });

  // 初始化排序项
  let _sort: string[] = [];
  if (typeof model.value === 'string') {
    _sort.push(model.value);
  } else if (Array.isArray(model.value)) {
    _sort = model.value;
  }
  sortResult.value = _sort.map((item) => {
    const column = _columns.find((column) => column.fieldName === item.split(',')[0]) ?? {
      fieldName: item.split(',')[0],
    };
    return {
      ...column,
      sort: item.split(',')[1],
    } as IColumns;
  });

  // 设置选项禁用
  _columns.forEach((column) => {
    column.checked = !!sortResult.value.find((item) => item.fieldName === column.fieldName);
  });
  columns.value = _columns;

  initSortable();
}

async function initSortable() {
  await nextTick();
  const el = refDialog.value?.dialogContentRef.$el.querySelector('.sort-column-content');
  Sortable.create(el, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onEnd: function (evt) {
      if (typeof evt.oldIndex === 'number' && typeof evt.newIndex === 'number') {
        const item = sortResult.value[evt.oldIndex];
        sortResult.value.splice(evt.oldIndex, 1);
        sortResult.value.splice(evt.newIndex, 0, item);
      }
    },
  });
}

function onSave() {
  const _sort = sortResult.value.map((item) => `${item.fieldName},${item.sort}`);
  model.value = _sort;
  emit('complete');
  setVisible(false);
}

function onCommand(fieldName: string) {
  const item = columns.value.find((item) => item.fieldName === fieldName) as IColumns;
  const newItem = { ...item };
  if (!newItem.sort) {
    newItem.sort = 'desc';
  }
  item.checked = true;
  sortResult.value.push(newItem);
}

function onClear() {
  sortResult.value = [];
  columns.value.forEach((column) => {
    column.checked = false;
  });
}

defineExpose({
  open,
});
</script>

<script lang="ts">
export default {
  name: 'EuSortDialog',
};
</script>

<template>
  <el-dialog
    ref="refDialog"
    v-model="visible"
    title="设置排序规则"
    width="560px"
    append-to-body
    class="eu-sort-dialog"
  >
    <div style="padding: 20px; min-height: 200px">
      <el-dropdown
        trigger="click"
        placement="bottom-start"
        @command="onCommand"
      >
        <div
          style="cursor: pointer"
          class="text-primary"
        >
          <i
            style="font-weight: bold"
            class="el-icon-plus"
          />
          <span>&nbsp;添加排序规则</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in columns"
              :key="index"
              :command="item.fieldName"
              :disabled="item.checked"
            >{{ item.fieldLabel }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="sort-column-wrapper">
        <ul class="sort-column-content">
          <li
            v-for="(item, index) in sortResult"
            :key="item.fieldName"
          >
            <div>{{ item.fieldLabel }}</div>
            <el-radio-group v-model="item.sort">
              <el-radio-button value="asc">升序</el-radio-button>
              <el-radio-button value="desc">降序</el-radio-button>
            </el-radio-group>
            <div class="handle">
              <svg-icon icon-class="drag" />
              <el-icon
                style="cursor: pointer; vertical-align: 0.15em"
                @click="sortResult.splice(index, 1)"
              >
                <Delete />
              </el-icon>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClear">清空排序</el-button>
      <div>
        <el-button @click="setVisible(false)">取 消</el-button>
        <el-button
          type="primary"
          class="eu-submit-btn"
          @click="onSave"
        >排 序</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.eu-sort-dialog {
  .el-dialog__footer {
    border-top: 1px solid var(--eu-color-border-primary);
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
  color: var(--eu-color-text-secondary);
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

    > :first-child {
      flex: 2;
      text-align: left;
    }

    &:not(:first-child) {
      box-shadow: 0 -1px 0 0 var(--eu-color-border-primary);
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
  background-color: var(--eu-color-bg-secondary);
}
</style>
