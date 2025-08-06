import {useCacheStore} from "@/store/modules/options";
import {listByDictKey} from '@/api/system/dictDetail'

export default function useDict() {
  async function fetchOptions(dictKey: string) {
    return useCacheStore().fetchOptions({
      dictKey
    }, listByDictKey)
  }
  return {
    fetchOptions
  }
}
