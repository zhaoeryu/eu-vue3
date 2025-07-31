import type {DefaultTheme} from "@/settings";

export type DeviceType = 'desktop' | 'mobile'

export interface SettingsState {
  theme: DefaultTheme,
  device: DeviceType,
  sidebarCollapsed: boolean
}
