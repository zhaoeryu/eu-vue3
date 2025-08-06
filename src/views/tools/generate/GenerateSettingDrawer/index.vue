<script setup lang="ts">
import {useResettableReactive} from "@/hooks/resettable";
import {computed, nextTick, provide, ref, useTemplateRef} from "vue";
import useLoading from "@/hooks/loading";
import useVisible from "@/hooks/visible";
import type {GenerateColumn, GenerateTable} from "@/types/system/generate";
import GenerateSettingTable from "@/views/tools/generate/GenerateSettingDrawer/GenerateSettingTable.vue";
import GenerateSettingFieldList from "@/views/tools/generate/GenerateSettingDrawer/GenerateSettingFieldList.vue";
import { tableInfo, syncTable, save } from '@/api/system/generate'
import {ElMessage, ElMessageBox} from "element-plus";
import GeneratePreview from '@/views/tools/generate/GeneratePreview.vue'
import {download} from "@/utils/request";

export type State = {
  gen: GenerateTable,
  list: GenerateColumn[],
  form: GenerateTable,
}

const generateSettingTable = useTemplateRef<InstanceType<typeof GenerateSettingTable>>('generateSettingTable')
const refGeneratePreview = useTemplateRef<InstanceType<typeof GeneratePreview>>('refGeneratePreview')
const { loading, setLoading } = useLoading(false)
const { loading: formLoading, setLoading: setFormLoading } = useLoading(false)
const { visible, setVisible } = useVisible(false)
const [state, reset] = useResettableReactive<State>({
  gen: {} as GenerateTable,

  list: [] as GenerateColumn[],
  form: {} as GenerateTable,
})

const pageTitle = computed(() => {
  return '生成配置 - ' + state.gen.tableName
})

provide('generateInfo', state)

function open(gen: GenerateTable) {
  reset()
  setVisible(true)
  state.gen = gen
  onRefresh()
}

async function onRefresh() {
  setLoading(true)

  tableInfo({
    tableName: state.gen.tableName,
  }).then(async res => {
    state.list = res.data.columns
    state.form = res.data.table
  }).finally(() => {
    setLoading(false)
  })
}

function onPreviewCode() {
  refGeneratePreview.value?.open({
    tableName: state.gen.tableName
  } as GenerateTable)
}

function onSync() {
  ElMessageBox.confirm('同步后会覆盖已配置信息，确定要同步吗？', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true;
        syncTable({
          tableName: state.gen.tableName,
        }).then(() => {
          ElMessage.success('同步成功')
          done()
          onRefresh()
        }).finally(() => {
          instance.confirmButtonLoading = false;
        })
      } else {
        done()
      }
    }
  });
}

async function onGenerate() {
  try {
    await onSave()

    await download('/api/gen/gen', {
      tableName: state.gen.tableName
    }, `${state.gen.tableName}.zip`)
  } catch (e) {
    console.error(e)
  }
}

async function onSave() {
  try {
    // 数据校验
    await generateSettingTable.value?.validate()

    // 保存数据到服务器
    setFormLoading(true)
    await save({
      table: state.form,
      columns: state.list
    })

    // 保存成功，刷新数据
    ElMessage.success('保存成功')
    onRefresh()
  } catch (err) {
    console.error(err)
  } finally {
    setFormLoading(false)
  }
}

defineExpose({
  open
})
</script>

<script lang="ts">
export default {
  name: 'GenerateSettingDrawer'
}
</script>

<template>
  <eu-drawer
    v-model="visible"
    :title="pageTitle"
    size="90%"
  >
    <div class="padding-sm">
      <eu-loading v-if="loading" style="height: 300px;" />

      <template v-else>
        <m-block-header title="表配置" :background="false" />
        <generate-setting-table ref="generateSettingTable" />

        <m-block-header title="字段配置" :background="false" />
        <generate-setting-field-list ref="generateSettingFieldList" />
      </template>
    </div>

    <generate-preview ref="refGeneratePreview" />

    <template #footer-right>
      <el-button :disabled="loading" :loading="formLoading" @click="onSync">同步</el-button>
      <el-button :disabled="loading" :loading="formLoading" @click="onGenerate">生成</el-button>
      <el-button :disabled="loading" @click="onPreviewCode">代码预览</el-button>
      <el-button :disabled="loading" class="eu-submit-btn" type="primary" :loading="formLoading" @click="onSave">保存</el-button>
    </template>
  </eu-drawer>
</template>

<style scoped lang="scss">

</style>
