import type {App} from 'vue';

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export default {
  install: (Vue: App) => {
    // do something
  }
}
