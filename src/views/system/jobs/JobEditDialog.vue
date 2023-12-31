<script setup lang="ts">
import { add, update } from '@/api/system/job'
import {ElMessage} from "element-plus";
import {computed, nextTick, ref} from "vue";

const DEFAULT_FORM = {
  jobName: null,
  jobGroup: null,
  cron: null,
  invokeClassName: null,
  springBeanName: null,
  methodName: null,
  methodParams: null,
  status: 0,
  misfirePolicy: 0,
  concurrent: 0,
  pauseAfterFailure: 0,
  alarmEmail: null
}

const emit = defineEmits(['complete'])

const show = ref(false)
const formLoading = ref(false)
const form = ref(DEFAULT_FORM)
const rules = {
  jobName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  jobGroup: [
    { required: true, message: '请输入任务组', trigger: 'blur' }
  ],
  cron: [
    { required: true, message: '请输入cron表达式', trigger: 'blur' }
  ],
  invokeClassName: [
    { required: true, message: '请输入任务执行类的全类名', trigger: 'blur' }
  ],
  springBeanName: [
    { required: true, message: '请输入任务执行类的SpringBean名', trigger: 'blur' }
  ],
  methodName: [
    { required: true, message: '请输入任务执行的方法名', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择任务状态', trigger: 'blur' }
  ],
  misfirePolicy: [
    { required: true, message: '请选择执行策略', trigger: 'blur' }
  ],
  concurrent: [
    { required: true, message: '请选择是否允许并发', trigger: 'blur' }
  ],
  pauseAfterFailure: [
    { required: true, message: '请选择失败后是否暂停', trigger: 'blur' }
  ],
}
// 执行方式：0：springBean，1：class
const invokeMode = ref('springBean')

const refForm = ref(null)
const title = computed(() => {
  return form.value.id ? '修改任务' : '新增任务'
})

function open(row) {
  form.value = Object.assign({...DEFAULT_FORM}, row)
  show.value = true
}

function onSubmit() {
  refForm.value.validate(valid => {
    if (!valid) {
      return false
    }

    formLoading.value = true
    const reqPromise = form.value.id ? update(form.value) : add(form.value)
    reqPromise.then(() => {
      ElMessage.success(form.value.id ? '修改成功' : '新增成功')
      show.value = false
      emit('complete')
    }).finally(() => {
      formLoading.value = false
    })
  })
}

async function onDialogOpen() {
  await nextTick(() => {
    if (refForm.value) {
      refForm.value.clearValidate();
    }
  });
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    :title="title"
    v-model="show"
    :close-on-click-modal="false"
    width="800px"
    @open="onDialogOpen"
  >
    <el-form ref="refForm" :model="form" :rules="rules" label-width="130px" :hide-required-asterisk="true">
      <el-row>
        <el-col :span="12">
          <el-form-item label="任务名称" prop="jobName">
            <el-input v-model="form.jobName" placeholder="请输入任务名称" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务组" prop="jobGroup">
            <el-input v-model="form.jobGroup" placeholder="请输入任务组" maxlength="20" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="cron表达式" prop="cron">
            <el-input v-model="form.cron" placeholder="请输入cron表达式" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="任务状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0">正常</el-radio>
              <el-radio :label="1">暂停</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="执行方式" style="height: 32px;">
            <el-radio-group v-model="invokeMode">
              <el-radio-button label="springBean">SpringBean</el-radio-button>
              <el-radio-button label="class">Class</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col v-if="invokeMode === 'springBean'" :span="12">
          <el-form-item label="SpringBean" prop="springBeanName">
            <el-input v-model="form.springBeanName" placeholder="请输入任务执行类的SpringBean名" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col v-else-if="invokeMode === 'class'" :span="12">
          <el-form-item label="Class" prop="invokeClassName">
            <el-input v-model="form.invokeClassName" placeholder="请输入任务执行类的全类名" maxlength="255" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="执行方法" prop="methodName">
            <el-input v-model="form.methodName" placeholder="请输入任务执行的方法名" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="方法参数" prop="methodParams">
            <el-input v-model="form.methodParams" placeholder="请输入任务执行方法参数(选填)" maxlength="512" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="执行策略" prop="misfirePolicy">
        <el-radio-group v-model="form.misfirePolicy">
          <el-radio :label="0">默认</el-radio>
          <el-radio :label="1">立即触发执行</el-radio>
          <el-radio :label="2">触发一次执行</el-radio>
          <el-radio :label="3">不触发立即执行</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="告警邮箱" prop="alarmEmail">
            <el-input v-model="form.alarmEmail" placeholder="请输入任务失败后的告警邮箱(选填)" maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="允许并发" prop="concurrent">
            <el-switch v-model="form.concurrent" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="失败后暂停" prop="pauseAfterFailure">
            <el-switch v-model="form.pauseAfterFailure" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="show = false">取 消</el-button>
      <el-button :loading="formLoading" class="eu-submit-btn" type="primary" @click="onSubmit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>
