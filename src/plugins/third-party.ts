import type { App } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(relativeTime);
// eslint-disable-next-line import/no-named-as-default-member
dayjs.locale('zh-cn');

export default {
  install: (_Vue: App) => {
    // do something
  },
};
