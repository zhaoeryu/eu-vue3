import { listByDictKey } from '@/api/system/dictDetail';
import { useCacheStore } from '@/store/modules/options';

export default function useDict() {
  async function fetchOptions(dictKey: string) {
    return useCacheStore().fetchOptions(
      {
        dictKey,
      },
      listByDictKey,
    );
  }
  return {
    fetchOptions,
  };
}
