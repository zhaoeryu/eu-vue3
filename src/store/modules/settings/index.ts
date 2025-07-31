import {defineStore} from 'pinia';
import type {SettingsState} from "@/store/modules/settings/types";
import {defaultTheme} from "@/settings";
import {STORAGE_KEY_THEME} from "@/utils/constants";
import {DeviceTypeEnums} from "@/utils/enums";

const storageTheme = JSON.parse(localStorage.getItem(STORAGE_KEY_THEME)) || {}
const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: Object.assign({}, defaultTheme, storageTheme),
    device: 'desktop',
    sidebarCollapsed: false
  }),
  getters: {
    isMobileDevice(state: SettingsState) {
      return state.device === DeviceTypeEnums.MOBILE
    }
  },
  actions: {
    saveTheme(theme) {
      const newTheme = Object.assign({}, defaultTheme, theme)
      localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(newTheme))
      this.theme = newTheme
    },
    toggleDevice(device) {
      this.device = device
    },
    toggleCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    }
  }
})

export default useSettingsStore
