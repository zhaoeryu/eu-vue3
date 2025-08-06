import {defineStore} from 'pinia';
import type {SettingsState, DeviceType} from "@/store/modules/settings/types";
import {defaultTheme, type EuTheme} from "@/settings";
import {STORAGE_KEY_THEME} from "@/utils/constants";
import {DeviceTypeEnums} from "@/utils/enums";
import {isDark} from "@/utils/darkMode";

const storageTheme = JSON.parse(localStorage.getItem(STORAGE_KEY_THEME) || '{}') || {}
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
    saveTheme(theme: EuTheme) {
      const newTheme = Object.assign({}, defaultTheme, theme)
      localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(newTheme))
      this.theme = newTheme
    },
    toggleDevice(device: DeviceType) {
      this.device = device
    },
    toggleCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },
    toggleTheme() {
      const newTheme = Object.assign({}, this.theme, {
        darkMode: isDark() ? 'light' : 'dark'
      })
      this.saveTheme(newTheme)
    },
    toggleTabsView() {
      const newTheme = Object.assign({}, this.theme, {
        showTabsBar: !this.theme.showTabsBar
      })
      this.saveTheme(newTheme)
    }
  }
})

export default useSettingsStore
