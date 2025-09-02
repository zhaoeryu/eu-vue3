<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { onMounted, reactive, useTemplateRef, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { captcha } from '@/api/system/login';
import useLoading from '@/hooks/loading';
import { useResettableReactive } from '@/hooks/resettable';
import { defaultSetting } from '@/settings';
import { useUserStore } from '@/store';
import { STORAGE_KEY_PASSWORD, STORAGE_KEY_REMEMBER_ME, STORAGE_KEY_USERNAME } from '@/utils/constants';
import { encrypt } from '@/utils/rsaEncrypt';
import Bubbles from '@/views/login/Bubbles.vue';

interface LoginForm {
  username: string | null;
  password: string | null;
  uuid: string | null;
  verifyCode: string | null;
  rememberMe: boolean;
}
interface LoginState {
  form: LoginForm;
  captchaImg: string | null;
  redirect: string | null;
}

const refForm = useTemplateRef<FormInstance>('refForm');
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { loading, setLoading } = useLoading(false);
const [state, _reset] = useResettableReactive<LoginState>({
  form: {
    username: null,
    password: null,
    uuid: null,
    verifyCode: null,
    rememberMe: false,
  },
  captchaImg: null,
  redirect: null,
});

const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  verifyCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
});

watch(
  () => route, // 监听目标：路由对象
  (newRoute) => {
    // 记录来源页面，用于登录成功后跳转
    state.redirect = newRoute.query?.redirect as string | null;
  },
  { immediate: true },
);

onMounted(() => {
  getCaptcha();

  state.form.username = localStorage.getItem(STORAGE_KEY_USERNAME) ?? null;
  state.form.password = localStorage.getItem(STORAGE_KEY_PASSWORD) ?? null;
  const rememberMe = localStorage.getItem(STORAGE_KEY_REMEMBER_ME)
  if (!!rememberMe) {
    state.form.rememberMe = Boolean(rememberMe)
  } else {
    state.form.rememberMe = true
  }
});

function getCaptcha() {
  captcha().then((res) => {
    state.form.uuid = res.uuid;
    state.captchaImg = res.img;
  });
}

function onSubmit(formEl: FormInstance | null) {
  if (!formEl) {
    return;
  }
  formEl.validate((valid) => {
    if (!valid) {
      return;
    }
    setLoading(true);
    // 解构赋值排除 rememberMe
    const reqPayload: Omit<LoginForm, 'rememberMe'> = {
      username: state.form.username,
      password: state.form.password,
      uuid: state.form.uuid,
      verifyCode: state.form.verifyCode,
    };
    // 密码超过了30位，说明是加密过的，不需要再加密
    if (reqPayload.password && reqPayload.password.length > 30) {
      reqPayload.password = reqPayload.password;
    } else {
      const encryptedPassword = encrypt(reqPayload.password!);
      reqPayload.password = encryptedPassword || reqPayload.password;
    }
    userStore
      .login(reqPayload)
      .then(() => {
        // 如果勾选了记住我，则将用户名和密码存入cookie，否则清除cookie
        if (state.form.rememberMe) {
          localStorage.setItem(STORAGE_KEY_USERNAME, reqPayload.username!);
          localStorage.setItem(STORAGE_KEY_PASSWORD, reqPayload.password!);
          localStorage.setItem(STORAGE_KEY_REMEMBER_ME, String(state.form.rememberMe));
        } else {
          localStorage.removeItem(STORAGE_KEY_USERNAME);
          localStorage.removeItem(STORAGE_KEY_PASSWORD);
          localStorage.removeItem(STORAGE_KEY_REMEMBER_ME);
        }
        // 登录成功后回到到来源页面，如果没有来源页面就跳转到首页
        router.push({ path: state.redirect ?? '/' });
      })
      .catch(() => {
        // 登录失败刷新验证码
        getCaptcha();
      })
      .finally(() => {
        setLoading(false);
      });
  });
}
</script>

<template>
  <div class="page-login">
    <!-- 上升的泡泡 -->
    <bubbles />
    <div class="login-body">
      <div class="left-container">
        <p class="left-container__title">开箱即用的后台管理系统</p>
        <p class="left-container__desc">内置了常见的系统解决方案</p>
        <img
          src="@/assets/images/login_banner.png"
          width="250"
          alt=""
          style="margin-top: 20px"
        />
      </div>
      <!-- 登录表单 -->
      <el-form
        ref="refForm"
        :model="state.form"
        :rules="rules"
      >
        <h3>登录{{ defaultSetting.title }}</h3>
        <el-form-item prop="username">
          <el-input
            v-model="state.form.username"
            placeholder="请输入用户名"
            maxlength="20"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="state.form.password"
            placeholder="请输入密码"
            maxlength="30"
            show-password
          ></el-input>
        </el-form-item>
        <!-- 验证码 -->
        <el-form-item
          prop="verifyCode"
          class="verify-code-form-item"
        >
          <el-row :gutter="16">
            <el-col :span="14">
              <el-input
                v-model="state.form.verifyCode"
                placeholder="请输入验证码"
                maxlength="4"
                style="margin-right: 16px"
              ></el-input>
            </el-col>
            <el-col :span="10">
              <div
                class="verify-code"
                @click="getCaptcha"
              >
                <img
                  v-if="state.captchaImg"
                  :src="state.captchaImg"
                  alt="点击获取验证码"
                />
                <span v-else>点击获取</span>
              </div>
            </el-col>
          </el-row>
        </el-form-item>
        <!-- 记住我 -->
        <el-form-item prop="rememberMe">
          <el-checkbox v-model="state.form.rememberMe">记住我</el-checkbox>
        </el-form-item>
        <el-form-item style="margin-bottom: 0">
          <el-button
            :loading="loading"
            style="width: 100%"
            type="primary"
            @click="onSubmit(refForm)"
          >登 录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/screen';

// 登录表单
.el-form {
  background-color: var(--eu-color-bg-primary);
  border-radius: 4px;
  padding: 25px;
  width: 360px;
  z-index: 2;

  h3 {
    text-align: center;
    font-size: 20px;
    margin-bottom: 30px;
    color: var(--eu-color-text-secondary);
  }

  .el-form-item {
    margin-bottom: 20px;

    &.verify-code-form-item {
      .verify-code {
        cursor: pointer;
        width: 110px;
        background-color: #868e96;
        line-height: 32px;
        height: 32px;
        box-sizing: border-box;
        text-align: center;
        overflow: hidden;
        border-radius: 4px;

        img {
          width: 100%;
          height: 100%;
        }

        span {
          color: #fff;
          font-size: 12px;
        }
      }
    }
  }
}

// 页面背景
.page-login {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-box-align: center;
  background: linear-gradient(-45deg, #4190f7, #7b3aeb);
  background-size: 600% 600%;
  animation: gradientBG 10s ease infinite;
}

html.dark .page-login {
  background: linear-gradient(-45deg, #1d2129, #00308f);
  background-size: 600% 600%;
  animation: gradientBG 10s ease infinite;
}

@keyframes gradientBG {
  0% {
    background-position: 0 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}

// 桌面端
@media (min-width: screen.$screen-md) {
  .login-body {
    background-color: var(--eu-color-bg-primary);
    border-radius: 4px;
    position: relative;
    z-index: 1;
    padding: 24px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-container {
      width: 330px;
      text-align: center;
      height: 100%;

      .left-container__title {
        font-size: 20px;
        font-weight: 500;
        line-height: 2em;
        color: var(--eu-color-text-secondary);
      }

      .left-container__desc {
        font-size: 14px;
        line-height: 2em;
        color: var(--eu-color-text-tertiary);
      }
    }

    &:before {
      content: '';
      position: absolute;
      left: 330px;
      top: 0;
      bottom: 0;
      width: 1px;
      height: 100%;
      background: var(--eu-color-border-primary);
      z-index: 10;
    }
  }
}

// 移动端
@media (max-width: screen.$screen-md) {
  .left-container {
    display: none;
  }
}
</style>
