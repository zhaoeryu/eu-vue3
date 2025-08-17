import { defineStore } from 'pinia';
import { Md5 } from 'ts-md5';

// 定义Store的返回类型
interface CacheStore {
  optionsCache: Record<string, any>;
  requestLocks: Record<string, boolean>;
  objectsCache: Record<string, any>;
  objectRequestLocks: Record<string, boolean>;

  fetchOptions: (params: any, api: (params: any) => Promise<any>) => Promise<any>;
  fetchObject: (key: string, fetchApi: (key: string | number) => Promise<any>) => Promise<any>;
  clear: () => void;
}

export const useCacheStore = defineStore('cache', (): CacheStore => {
  // 状态定义（替代Vuex的state）
  const optionsCache: Record<string, any> = {}; // 数据缓存
  const requestLocks: Record<string, boolean> = {}; // 请求锁对象
  const objectsCache: Record<string, any> = {}; // 对象缓存
  const objectRequestLocks: Record<string, boolean> = {}; // 对象请求锁对象

  // 清除所有锁
  const clear = () => {
    Object.keys(requestLocks).forEach((key) => delete requestLocks[key]);
    Object.keys(objectRequestLocks).forEach((key) => delete objectRequestLocks[key]);
  };

  // 获取选项数据（带缓存和锁机制）
  const fetchOptions = async (params: any, api: (params: any) => Promise<any>) => {
    const key = Md5.hashStr(JSON.stringify(params));

    // 存在缓存直接返回
    if (optionsCache[key]) {
      return optionsCache[key];
    }

    // 存在请求锁时等待
    if (requestLocks[key]) {
      return new Promise((resolve) => {
        const checkLock = setInterval(() => {
          if (!requestLocks[key]) {
            clearInterval(checkLock);
            resolve(fetchOptions(params, api));
          }
        }, 100);
      });
    }

    // 设置请求锁
    requestLocks[key] = true;

    try {
      const response = await api(params);
      optionsCache[key] = response;
      return response;
    } catch (error) {
      console.error('获取选项失败:', error);
      throw error; // 继续抛出错误供组件处理
    } finally {
      // 无论成功失败都释放锁
      delete requestLocks[key];
    }
  };

  // 获取对象数据（带缓存和锁机制）
  const fetchObject = async (key: string, fetchApi: (key: string | number) => Promise<any>) => {
    // 存在缓存直接返回
    if (objectsCache[key]) {
      return objectsCache[key];
    }

    // 存在请求锁时等待
    if (objectRequestLocks[key]) {
      return new Promise((resolve) => {
        const checkLock = setInterval(() => {
          if (!objectRequestLocks[key]) {
            clearInterval(checkLock);
            resolve(fetchObject(key, fetchApi));
          }
        }, 100);
      });
    }

    // 设置请求锁
    objectRequestLocks[key] = true;

    try {
      const response = await fetchApi(key);
      objectsCache[key] = response;
      return response;
    } catch (error) {
      console.error('获取对象失败:', error);
      throw error; // 继续抛出错误供组件处理
    } finally {
      // 无论成功失败都释放锁
      delete objectRequestLocks[key];
    }
  };

  return {
    optionsCache,
    requestLocks,
    objectsCache,
    objectRequestLocks,
    fetchOptions,
    fetchObject,
    clear,
  };
});
