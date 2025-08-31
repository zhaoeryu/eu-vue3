<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { reactive } from 'vue';

import useVisible from '@/hooks/visible';
import { defaultTheme } from '@/settings';
import { useSettingsStore } from '@/store';
import mittBus from '@/utils/mittBus';

defineOptions({
  name: 'ThemeConfig',
});

const settingsStore = useSettingsStore();
const { visible, setVisible } = useVisible(false);

const form = reactive({ ...defaultTheme });

function onSubmit() {
  settingsStore.saveTheme({ ...form });
  ElMessage.success('已更新');
  setVisible(false);
}

function onRestoreDefault() {
  settingsStore.restore();
  ElMessage.success('已恢复默认主题');
  setVisible(false);
}

mittBus.on('theme:open', () => {
  setVisible(true);
  Object.assign(form, defaultTheme, { ...settingsStore.theme });
});
</script>

<template>
  <el-drawer
    v-model="visible"
    title="主题配置"
    size="400px"
    direction="rtl"
    class="eu-theme-config-drawer"
    append-to-body
  >
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden">
      <div style="flex: 1; overflow-y: auto">
        <el-form
          :model="form"
          label-position="left"
        >
          <el-form-item
            label="菜单布局"
            class="eu-form-item__layout"
          >
            <el-radio-group v-model="form.layout">
              <el-radio-button value="column">
                <el-tooltip
                  content="分栏布局"
                  placement="top"
                >
                  <svg-icon icon-class="layout-column" />
                </el-tooltip>
              </el-radio-button>
              <el-radio-button value="vertical">
                <el-tooltip
                  content="垂直布局"
                  placement="top"
                >
                  <svg-icon icon-class="layout-vertical" />
                </el-tooltip>
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <!--          <el-form-item label="头部">-->
          <!--            <el-switch v-model="form.showHeader" />-->
          <!--          </el-form-item>-->
          <el-form-item
            label="标签页"
            prop="showTabsBar"
          >
            <el-switch v-model="form.showTabsBar" />
          </el-form-item>
          <!--          <el-form-item label="固定头部">-->
          <!--            <el-switch v-model="form.fixedHeader" />-->
          <!--          </el-form-item>-->
          <el-form-item label="固定标签">
            <el-switch v-model="form.fixedTabsBar" />
          </el-form-item>
          <el-form-item
            label="进度条"
            prop="showProgressBar"
          >
            <el-switch v-model="form.showProgressBar" />
          </el-form-item>
          <el-form-item label="开启水印">
            <el-switch v-model="form.enabledWatermark" />
          </el-form-item>
          <el-form-item label="暗黑模式">
            <el-radio-group v-model="form.darkMode">
              <el-radio-button value="light">
                <template #default>
                  <svg-icon
                    icon-class="sun"
                    style="font-weight: bold; font-size: 18px; height: 18px"
                  />
                </template>
              </el-radio-button>
              <el-radio-button value="dark">
                <template #default>
                  <svg-icon
                    icon-class="moon"
                    style="font-weight: bold; font-size: 18px; height: 18px"
                  />
                </template>
              </el-radio-button>
              <el-radio-button value="syncOS">
                <template #default>
                  <svg-icon
                    icon-class="auto_mode"
                    style="font-weight: bold; font-size: 18px"
                  />
                </template>
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <div class="el-drawer__footer">
        <el-button
          type="primary"
          @click="onSubmit"
        >保存</el-button>
        <el-button @click="onRestoreDefault">恢复默认</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
:deep(.el-form) {
  padding: 0 12px;

  .el-form-item {
    display: flex;
    align-items: center;

    .el-form-item__label {
      flex: 1;
    }

    .el-form-item__content {
      flex: unset;
    }
  }
}

.eu-form-item__layout {
  align-items: flex-start !important;
  flex-direction: column;

  :deep(.el-radio-button__inner) {
    background-color: unset !important;
    padding: 0;
    border: none;
  }

  .svg-icon {
    width: 75px;
    height: 50px;

    border: 1px solid var(--color-border-2);
    border-radius: var(--border-radius-medium);
  }

  .is-active {
    .svg-icon {
      box-shadow: 0 0 2px 2px var(--color-primary);
    }
  }

  .el-radio-button+.el-radio-button {
    margin-left: 12px;
  }
}
</style>
<style lang="scss">
.eu-theme-config-drawer {
  .el-drawer__body {
    padding: 0;
  }

  .el-drawer__footer {
    border-top: 1px solid var(--color-border);
    width: 100%;
    padding: 0 12px;
    box-sizing: border-box;
    height: 50px;
    line-height: 50px;
    text-align: right;
  }
}
</style>
