import type {EuTheme} from "@/settings";

export type DeviceType = 'desktop' | 'mobile'

export interface SettingsState {
  theme: EuTheme,
  device: DeviceType,
  sidebarCollapsed: boolean
}
