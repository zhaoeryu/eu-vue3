import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

import useRouteStore from '@/store/modules/routes';
import { useSettingsStore } from '@/store/modules/settings';
import { useTabsStore } from '@/store/modules/tabs';
import useUserStore from '@/store/modules/user';

const pinia = createPinia();
pinia.use(
  createPersistedState({
    key: (id) => `__eu_persisted__${id}`,
  }),
);

export { useUserStore, useRouteStore, useSettingsStore, useTabsStore };

export default pinia;
