<script setup lang="ts">
import {computed, onMounted, ref, useTemplateRef} from "vue";
import {useUserStore} from "@/store";
import UserAvatar from "@/views/system/personal-center/UserAvatar.vue";
import {updatePassword, updateProfile} from "@/api/system/user";
import {ElMessage, ElMessageBox, type FormInstance} from "element-plus";
import useLoading from "@/hooks/loading";

const refFormBasic = useTemplateRef<FormInstance>('refFormBasic')
const refFormPassword = useTemplateRef<FormInstance>('refFormPassword')
const userStore = useUserStore()
const { loading: userFormLoading, setLoading: setUserFormLoading } = useLoading(false)
const { loading: updatePasswordFormLoading, setLoading: setUpdatePasswordFormLoading } = useLoading(false)
const tabActive = ref('userinfo')
const userForm = ref({
  nickname: null,
  mobile: null,
  email: null,
  sex: null
})
const updatePasswordForm = ref({
  oldPassword: null,
  newPassword: null,
  confirmPassword: null
})
const userRules = {
  nickname: [
    {required: true, message: '请输入姓名', trigger: 'blur'},
    {min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur'}
  ],
  mobile: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {
      pattern: /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
  ],
  sex: [
    {required: true, message: '请选择性别', trigger: 'blur'}
  ]
}
const updatePasswordRules = {
  oldPassword: [
    {required: true, message: '请输入旧密码', trigger: 'blur'},
    {min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur'}
  ],
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请再次输入新密码', trigger: 'blur'},
    {min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur'}
  ]
}

const user = computed(() => userStore.user)
const deptNames = computed(() => {
  return (userStore.user.deptNames || []).join(' / ') || '暂无部门'
})

onMounted(() => {
  Object.assign(userForm.value, userStore.user, {
    id: userStore.user.userId
  })
})

function onSave() {
  refFormBasic.value?.validate(valid => {
    if (!valid) {
      return
    }
    setUserFormLoading(true)
    updateProfile(userForm.value).then(() => {
      ElMessage.success('保存成功')
      userStore.getInfo()
    }).finally(() => {
      setUserFormLoading(false)
    })
  })
}

function onPasswordSave() {
  refFormPassword.value?.validate((valid) => {
    if (!valid) {
      return
    }

    // 验证旧密码和新密码是否一致
    if (updatePasswordForm.value.oldPassword === updatePasswordForm.value.newPassword) {
      ElMessage.error('新密码不能和旧密码相同')
      return
    }

    // 验证新密码和确认密码是否一致
    if (updatePasswordForm.value.newPassword !== updatePasswordForm.value.confirmPassword) {
      ElMessage.error('新密码和确认密码不一致')
      return
    }

    ElMessageBox.confirm('确认修改密码吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      setUpdatePasswordFormLoading(true)
      updatePassword(updatePasswordForm.value.oldPassword!, updatePasswordForm.value.newPassword!).then(() => {
        ElMessage.success('密码修改成功')
        userStore.getInfo()
      }).finally(() => {
        setUpdatePasswordFormLoading(false)
      })
    })
  })
}

</script>

<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :span="8" :xs="24">
        <div>
          <div style="display: flex;align-items: center;">
            <div>
              <user-avatar />
            </div>
            <div style="margin-left: 16px;">
              <div>
                <span style="font-size: 23px;color: var(--theme-text-primary-color);font-weight: 500;display: inline-block;margin-right: 0.3em;">{{ user.nickname || '-'}}</span>
                <svg-icon v-if="user.sex === 1" icon-class="sex_man" />
                <svg-icon v-else-if="user.sex === 0" icon-class="sex_woman" />
              </div>
              <div style="margin-top: 15px;color: var(--theme-text-second-color);font-size: 14px;">
                {{ user.mobile || '未绑定手机号' }}
              </div>
              <div style="margin-top: 10px;color: var(--theme-text-second-color);font-size: 14px;">
                {{ deptNames }}
              </div>
            </div>
          </div>
          <el-divider></el-divider>
          <div class="person-info">
            <div>
              <div>上次登录地点</div>
              <div>{{ user.prevLoginRegion || '-' }}</div>
            </div>
            <div>
              <div>上次登录时间</div>
              <div>{{ user.prevLoginTime || '-' }}</div>
            </div>
            <el-divider></el-divider>
            <div>
              <div>登录名</div>
              <div>{{ user.username || '-' }}</div>
            </div>
            <div>
              <div>邮箱</div>
              <div>{{ user.email || '-' }}</div>
            </div>
            <div>
              <div>账号创建时间</div>
              <div>{{ user.createTime || '-' }}</div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="16" :xs="24">
        <div>
          <el-tabs v-model="tabActive">
            <el-tab-pane label="用户信息" name="userinfo">
              <el-form ref="refFormBasic" :model="userForm" :rules="userRules" label-width="90px" :hide-required-asterisk="true">
                <el-form-item label="姓名" prop="nickname">
                  <el-input v-model="userForm.nickname" placeholder="请输入姓名，长度在 2 到 10 个字符" maxlength="10" />
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                  <el-input v-model="userForm.mobile" placeholder="请输入手机号，11 位数字" maxlength="11" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="userForm.email" placeholder="请输入邮箱" maxlength="50" />
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                  <el-radio-group v-model="userForm.sex">
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="0">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
              <div style="text-align: right;">
                <el-button :loading="userFormLoading" type="primary" style="width: 150px;" @click="onSave">保 存</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="updatePassword">
              <el-form ref="refFormPassword" :model="updatePasswordForm" :rules="updatePasswordRules" label-width="90px" :hide-required-asterisk="true">
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input v-model="updatePasswordForm.oldPassword" placeholder="请输入旧密码，长度在 6 ～ 30 个字符" maxlength="30" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="updatePasswordForm.newPassword" placeholder="请输入新密码，长度在 6 ～ 30 个字符" maxlength="30" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="updatePasswordForm.confirmPassword" placeholder="请再次输入新密码，长度在 6 ～ 30 个字符" maxlength="30" show-password />
                </el-form-item>
              </el-form>
              <div style="text-align: right;">
                <el-button :loading="updatePasswordFormLoading" type="primary" style="width: 150px;" @click="onPasswordSave">保 存</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.el-col {
  > div {
    background-color: var(--theme-base-second-bg);
    padding: 16px;
  }
}

.person-info {
  font-size: 14px;
  color: var(--theme-text-primary-color);

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 2em;

    > div:nth-child(2) {
      color: var(--theme-text-second-color);
    }
  }
}
</style>
