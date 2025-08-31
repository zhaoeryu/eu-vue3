import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { defaultTheme   } from '@/settings';
import type {EuTheme, PartialEuTheme} from '@/settings';
import { DeviceTypeEnums } from '@/utils/enums';

export type DeviceType = 'desktop' | 'mobile';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const theme = ref<EuTheme>(Object.assign({}, defaultTheme));
    const device = ref<DeviceType>(DeviceTypeEnums.DESKTOP);
    const sidebarCollapsed = ref<boolean>(false);

    const isMobileDevice = computed(() => device.value === DeviceTypeEnums.MOBILE);

    function saveTheme(newTheme: PartialEuTheme) {
      theme.value = Object.assign({}, defaultTheme, theme.value, newTheme);
    }
    function toggleDevice(newDevice: DeviceType) {
      device.value = newDevice;
    }
    function toggleCollapsed(collapsed: boolean) {
      sidebarCollapsed.value = collapsed;
    }

    function restore() {
      theme.value = Object.assign({}, defaultTheme);
    }

    return {
      theme,
      device,
      sidebarCollapsed,
      isMobileDevice,
      saveTheme,
      toggleDevice,
      toggleCollapsed,
      restore,
    };
  },
  {
    persist: {
      storage: window.localStorage,
      debug: true,
    },
  },
);
