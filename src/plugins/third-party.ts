import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { App } from 'vue';
import 'dayjs/locale/zh-cn';
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export default {
  install: (_Vue: App) => {
    // do something
  },
};
