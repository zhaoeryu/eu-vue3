<script lang="ts" setup>
// 定义组件名称
defineOptions({
  name: 'MSelectPulldown',
});

import { CircleClose } from '@element-plus/icons-vue';
import { useZIndex } from 'element-plus';
import type { InputInstance } from 'element-plus';
import { isNil } from 'lodash';
import { ref, watch, nextTick, useTemplateRef, computed } from 'vue';

import useLoading from '@/hooks/loading';
import { ensureMinExecutionTime } from '@/utils';

export type Value = string | number | null;
export type Label = string | null;

// 定义属性接口
interface FieldConfig {
  valueKey: string;
  labelKey: string;
}

// 定义组件属性
export interface MSelectPulldownProps {
  clearable?: boolean;
  disabled?: boolean;
  immediate?: boolean,
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  width?: string;
  field?: FieldConfig;
  fetchOptions?: (keyword?: string) => Promise<any>;
  fetchObject?: (value: number | string) => Promise<any>;
  minExecutionTime?: number;
}

// 定义默认属性值
const props = withDefaults(defineProps<MSelectPulldownProps>(), {
  clearable: true,
  disabled: false,
  immediate: true,
  placeholder: '请选择',
  minHeight: '300px',
  maxHeight: '300px',
  width: '500px',
  fetchOptions: undefined,
  fetchObject: undefined,
  field: () => ({
    labelKey: 'label',
    valueKey: 'value'
  })
});

// 定义事件
const emit = defineEmits<{
  (e: 'change', row: any): void;
  (e: 'search', keyword: string): void;
}>();

const model = defineModel<Value>();
const modelLabel = defineModel<Label>('label');

// 响应式数据
const { loading, setLoading } = useLoading(false);
const keyword = ref('');
const list = ref<any[]>([]);
const isFocused = ref(false);
const isHovered = ref(false);
// refs
const xDown = useTemplateRef<any>('xDown');
const pullDownReference = useTemplateRef<InputInstance>('pullDownReference');

const filterList = computed(() => {
  let newList = []
  if (!keyword.value) {
    newList = list.value
  } else if (props.field.labelKey) {
    newList = list.value.filter(item => {
      const label = parseLabel(item)
      if (label) {
        return label.includes(keyword.value);
      }
      return false;
    });
  } else {
    newList = list.value
  }
  return newList
})

// 监听器
watch(
  () => model.value,
  async () => {
    await doParseLabelHandle(null, list.value)
  },
  { immediate: props.immediate }
);

// 方法
function onShow() {
  if (props.disabled) {
    return;
  }
  onQuery();
  xDown.value?.showPanel(pullDownReference.value?.$el);
  // 使用ElementUI的ZIndex，避免该组件在ElementUI的dialog/drawer中遮罩层层级问题
  nextTick(() => {
    if (xDown.value?.reactData) {
      xDown.value.reactData.panelIndex = useZIndex().nextZIndex();
    }
  });
}

async function onQuery() {
  if (!props.fetchOptions) return;

  setLoading(true);
  try {
    const res = await ensureMinExecutionTime(props.fetchOptions, props.minExecutionTime);
    const records = res.data ?? [];
    list.value = records;

    // 显示值处理
    await doParseLabelHandle(modelLabel.value!, records);
  } finally {
    setLoading(false);
  }
}

async function doParseLabelHandle(initLabel: Label, records: any[]) {
  if (isNil(initLabel) && !isNil(model.value) && model.value !== '') {
    // 从当前列表中匹配显示值
    const foundItem = records.find(item => item[props.field.valueKey] === model.value);
    let label = parseLabel(foundItem);
    // 加载显示值
    if (!label && props.fetchObject) {
      const objRes = await props.fetchObject(model.value);
      label = parseLabel(objRes);
    }
    modelLabel.value = label;
  }
}

function parseLabel(item: any): string | null {
  if (item && props.field.labelKey) {
    return item[props.field.labelKey];
  }
  return null;
}

function onItemChecked(row: any) {
  modelLabel.value = parseLabel(row);
  model.value = row[props.field.valueKey]
  emit('change', row);
  xDown.value?.hidePanel();
}

function onClear() {
  onItemChecked({});
  isFocused.value = false;
  pullDownReference.value?.blur();
}

function onFocus() {
  isFocused.value = true;
  onShow();
}

function onBlur() {
  isFocused.value = false;
}

defineExpose({
  focus: onFocus,
  blur: onBlur,
  clear: onClear,
  onQuery,
  onItemChecked,
});
</script>

<template>
  <vxe-pulldown
    ref="xDown"
    :transfer="true"
    :show-popup-shadow="true"
    class-name="m-pulldown"
    popup-class-name="m-pulldown-popup"
    :destroy-on-close="false"
  >
    <template #default>
      <slot name="default" />
      <el-input
        v-if="!$slots.default"
        ref="pullDownReference"
        v-model="modelLabel"
        :disabled="disabled"
        :placeholder="placeholder"
        readonly
        style="width: 100%"
        @focus="onFocus"
        @blur="onBlur"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <template #suffix>
          <span
            v-if="(isFocused || isHovered) && clearable && !disabled && !isNil(model)"
            style="font-size: 16px; line-height: 28px"
            @mousedown.stop.prevent="onClear"
          >
            <el-icon style="margin-left: 5px; cursor: pointer">
              <CircleClose />
            </el-icon>
          </span>
        </template>
      </el-input>
    </template>

    <template #header>
      <div :style="{ width: width }">
        <slot name="header" />
        <div
          v-if="!$slots.header"
          class="header"
        >
          <div>
            <slot name="search-prepend" />
            <el-input
              v-model="keyword"
              style="width: 250px"
              placeholder="请输入关键字"
              clearable
              :validate-event="false"
            />
            <slot name="search-append" />
          </div>
          <el-button
            style="margin-left: 12px;"
            type="primary"
            @click="onQuery"
          >
            {{ '刷新' }}
          </el-button>
        </div>
      </div>
    </template>

    <template #footer>
      <div :style="{ width: width }">
        <slot
          name="footer"
          :query="onQuery"
        />
      </div>
    </template>

    <template #dropdown>
      <div :style="{ width: width }">
        <slot name="dropdown">
          <div class="m-dropdown">
            <div
              class="m-dropdown-content"
              :style="{ minHeight: minHeight, maxHeight: maxHeight, overflowY: 'auto', width: width }"
            >
              <eu-loading
                v-if="loading"
                style="height: 300px"
              />
              <template v-else-if="filterList.length">
                <slot
                  name="list"
                  :list="filterList"
                  :checked="onItemChecked"
                  :checkedValue="model"
                >
                  <div class="list">
                    <div
                      v-for="item in list"
                      :key="item[field.valueKey]"
                      class="item cursor"
                      @click="onItemChecked(item)"
                    >
                      <slot
                        name="item"
                        :item="item"
                        :active="item[field.valueKey] === model"
                      >
                        <div :class="{ active: item[field.valueKey] === model }">
                          {{ item.username }}
                        </div>
                      </slot>
                    </div>
                  </div>
                </slot>
              </template>
              <template v-else>
                <slot name="empty">
                  <el-empty
                    style="width: 100%"
                    :image-size="120"
                    description="暂无数据"
                  />
                </slot>
              </template>
            </div>
          </div>
        </slot>
      </div>
    </template>
  </vxe-pulldown>
</template>

<style scoped lang="scss">
.m-pulldown {
  display: block;
}

.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 12px;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background-color: var(--color-border);
  }
}

.m-dropdown {
  background-color: var(--el-dialog-bg-color);
  display: flex;
  flex-direction: column;
}

.m-dropdown-content {
  flex: 1;
}

.list {
  padding: 12px 0;
}

.item {
  padding: 12px;
  margin: 0 12px;
  border-radius: var(--el-border-radius-base);

  &:hover {
    background-color: var(--el-color-primary-light-9);
  }

  &>.active {
    color: var(--el-color-primary);
    font-weight: 500;
  }
}
</style>
