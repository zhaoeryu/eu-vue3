import presetWind from '@unocss/preset-wind3'
import {
  defineConfig,
  presetAttributify,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    // 支持css class属性化
    presetAttributify(),
  ],
})
