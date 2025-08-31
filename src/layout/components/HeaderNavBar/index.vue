<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { computed } from 'vue';

import CmdkDialog from '@/components/cmdk/CmdkDialog.vue';
import Message from '@/components/Message.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import SidebarHeader from '@/layout/components/SidebarHeader/index.vue';
import { defaultSetting } from '@/settings';
import type { DarkMode } from '@/settings';
import { useSettingsStore } from '@/store';
import mittBus from '@/utils/mittBus';

defineOptions({
  name: 'HeaderNavBar',
});

const { isFullscreen, toggle: onScreenfull } = useFullscreen();
const settingsStore = useSettingsStore();

const darkMode = computed(() => settingsStore.theme.darkMode);

function toHomePage() {
  location.href = '/';
}
function toNewPage(url: string) {
  window.open(url);
}

function changeDarkMode(mode: DarkMode) {
  settingsStore.saveTheme({
    darkMode: mode,
  });
}

function onRefresh() {
  location.reload();
}

function onThemeClick() {
  mittBus.emit('theme:open');
}
</script>

<template>
  <header id="eu-layout__navbar">
    <div
      class="left-side"
      @click="toHomePage"
    >
      <img
        src="@/assets/logo.png"
        style="height: 30px; margin-right: 16px"
        :alt="defaultSetting.title"
      />
      <span style="font-size: 24px">{{ defaultSetting.title }}</span>
    </div>
    <ul class="right-side">
      <li class="eu-phone__hide">
        <cmdk-dialog />
      </li>
      <li
        v-if="defaultSetting.systemHelpDocUrl"
        class="eu-phone__hide"
        @click="toNewPage(defaultSetting.systemHelpDocUrl)"
      >
        <svg-icon icon-class="help" />
      </li>
      <li
        v-if="defaultSetting.githubUrl"
        class="eu-phone__hide"
        @click="toNewPage(defaultSetting.githubUrl)"
      >
        <svg-icon icon-class="github" />
      </li>
      <li
        v-if="defaultSetting.giteeUrl"
        class="eu-phone__hide"
        @click="toNewPage(defaultSetting.giteeUrl)"
      >
        <svg-icon icon-class="gitee" />
      </li>
      <li
        class="eu-phone__hide"
        @click="onRefresh"
      >
        <svg-icon icon-class="refresh" />
      </li>
      <li class="eu-phone__hide">
        <svg-icon
          v-if="darkMode === 'dark'"
          icon-class="moon"
          @click="changeDarkMode('light')"
        />
        <svg-icon
          v-else
          icon-class="sun"
          @click="changeDarkMode('dark')"
        />
      </li>
      <li @click="onThemeClick">
        <svg-icon icon-class="theme" />
      </li>
      <li>
        <message>
          <template #reference="{ messageCount }">
            <el-badge
              :value="messageCount"
              :max="99"
              :hidden="messageCount === 0"
            >
              <svg-icon icon-class="tongzhi" />
            </el-badge>
          </template>
        </message>
      </li>
      <li
        class="eu-phone__hide"
        @click="onScreenfull"
      >
        <svg-icon :icon-class="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
      </li>
      <li>
        <sidebar-header />
      </li>
    </ul>
  </header>
</template>

<style scoped lang="scss">
@use '@/assets/styles/screen.scss';

#eu-layout__navbar {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--layout-header-nav-height);
  background: var(--theme-nav-first-bg);
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
  padding: 0 16px;
  z-index: 200;
  color: var(--theme-nav-first-color);

  .left-side {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
  }

  .right-side {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    li {
      cursor: pointer;

      &+li {
        margin-left: 30px;
      }

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}

@media (max-width: screen.$screen-md) {
  .eu-phone__hide {
    display: none;
  }
}
</style>
