import { defineStore } from 'pinia';
import { ref } from 'vue';

import { type Tab } from '@/types/store/tabs';

export const useTabsStore = defineStore(
  'tabs',
  () => {
    const tabs = ref<Tab[]>([]);

    function addTab(tab: Tab) {
      if (tabs.value.some((v) => v.path === tab.path)) {
        return;
      }
      tabs.value.push(tab);
    }

    function delTab(tab: Tab) {
      tabs.value = tabs.value.filter((v) => v.path !== tab.path);
    }

    function delOthersTabs(tab: Tab) {
      tabs.value = tabs.value.filter((v) => v.affix || v.path === tab.path);
    }

    function delAllTabs() {
      tabs.value = tabs.value.filter((v) => v.affix);
    }

    function delLeftTabs(tab: Tab) {
      const index = tabs.value.findIndex((v) => v.path === tab.path);
      if (index > 0) {
        tabs.value = tabs.value.filter((v, i) => v.affix || i >= index);
      } else {
        tabs.value = tabs.value.filter((v) => v.affix);
      }
    }

    function delRightTabs(tab: Tab) {
      const index = tabs.value.findIndex((v) => v.path === tab.path);
      if (index < tabs.value.length - 1) {
        tabs.value = tabs.value.filter((v, i) => v.affix || i <= index);
      } else if (index === tabs.value.length - 1) {
        // 如果只剩当前标签页，则不进行处理
      } else {
        tabs.value = tabs.value.filter((v) => v.affix);
      }
    }

    return {
      tabs,
      addTab,
      delTab,
      delOthersTabs,
      delAllTabs,
      delLeftTabs,
      delRightTabs,
    };
  },
  {
    persist: {
      storage: window.localStorage,
      debug: true,
    },
  },
);
