import {defineStore} from 'pinia';
import {defaultTheme, type EuTheme} from "@/settings";
import {DeviceTypeEnums} from "@/utils/enums";
import {ref, computed} from "vue";

export type DeviceType = 'desktop' | 'mobile'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<EuTheme>(Object.assign({}, defaultTheme))
  const device = ref<DeviceType>(DeviceTypeEnums.DESKTOP)
  const sidebarCollapsed = ref<boolean>(false)

  const isMobileDevice = computed(() => device.value === DeviceTypeEnums.MOBILE)

  function saveTheme(theme: EuTheme) {
    this.theme = Object.assign({}, defaultTheme, theme)
  }
  function toggleDevice(device: DeviceType) {
    this.device = device
  }
  function toggleCollapsed(collapsed: boolean) {
    this.sidebarCollapsed = collapsed
  }
  return {
    theme,
    device,
    sidebarCollapsed,
    isMobileDevice,
    saveTheme,
    toggleDevice,
    toggleCollapsed,
  }
}, {
  persist: {
    storage: window.localStorage,
    debug: true
  },
})
