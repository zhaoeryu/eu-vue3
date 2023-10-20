import { createPinia } from 'pinia'
import useUserStore from "@/store/modules/user";
import useRouteStore from "@/store/modules/routes";
import useSettingsStore from "@/store/modules/settings";
import useTabsViewStore from "@/store/modules/tabsView";

const pinia = createPinia();

export {
  useUserStore,
  useRouteStore,
  useSettingsStore,
  useTabsViewStore
};

export default pinia;
