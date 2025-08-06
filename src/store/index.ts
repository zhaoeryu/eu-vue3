import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import useUserStore from "@/store/modules/user";
import useRouteStore from "@/store/modules/routes";
import useSettingsStore from "@/store/modules/settings";
import useTabsViewStore from "@/store/modules/tabsView";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export {
  useUserStore,
  useRouteStore,
  useSettingsStore,
  useTabsViewStore
};

export default pinia;
